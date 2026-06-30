import { Injectable } from '@nestjs/common';

type DeliveryType = 'PICKUP' | 'DELIVERY';
type PaymentMethod = 'CASH' | 'NEQUI' | 'BANCOLOMBIA' | 'QR';

type WhatsappOrderItem = {
  name: string;
  emoji?: string | null;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  note?: string | null;
  additions?: {
    name: string;
    quantity: number;
    price: number;
    subtotal: number;
  }[];
};

type GenerateWhatsappMessageParams = {
  businessName: string;
  whatsappNumber: string;
  orderCode: string;
  customerName: string;
  customerPhone: string;
  deliveryType: DeliveryType;
  paymentMethod: PaymentMethod;
  address?: string | null;
  neighborhood?: string | null;
  reference?: string | null;
  customerNote?: string | null;
  subtotal: number;
  total: number | null;
  items: WhatsappOrderItem[];
};

@Injectable()
export class WhatsappMessageService {
  private readonly E = {
    burger: '\u{1F354}',
    hotdog: '\u{1F32D}',
    fries: '\u{1F35F}',
    corn: '\u{1F33D}',
    drink: '\u{1F964}',
    juice: '\u{1F9C3}',
    meat: '\u{1F969}',
    chicken: '\u{1F357}',
    user: '\u{1F464}',
    phone: '\u{1F4F1}',
    cart: '\u{1F6D2}',
    note: '\u{1F4DD}',
    delivery: '\u{1F6F5}',
    pickup: '\u{1F6B6}',
    location: '\u{1F4CD}',
    house: '\u{1F3D8}',
    pin: '\u{1F4CC}',
    card: '\u{1F4B3}',
    money: '\u{1F4B0}',
    plate: '\u{1F37D}',
  };

  generateMessage(params: GenerateWhatsappMessageParams): string {
    const lines: string[] = [];

    lines.push(`${this.E.burger} *Pedido ${params.businessName}*`);
    lines.push(`*Código:* ${params.orderCode}`);
    lines.push('');
    lines.push(`${this.E.user} *Cliente:* ${params.customerName}`);
    lines.push(`${this.E.phone} *Celular:* ${params.customerPhone}`);
    lines.push('');
    lines.push(`${this.E.cart} *Pedido:*`);

    for (const item of params.items) {
      const emoji = this.getSafeProductEmoji(item.name);

      lines.push(
        `• ${emoji} ${item.quantity} ${item.name} - ${this.formatMoney(
          item.subtotal,
        )}`,
      );

      if (item.additions && item.additions.length > 0) {
        for (const addition of item.additions) {
          lines.push(
            `   + ${addition.quantity} ${addition.name} - ${this.formatMoney(
              addition.subtotal,
            )}`,
          );
        }
      }

      if (item.note) {
        lines.push(`   ${this.E.note} ${item.note}`);
      }
    }

    if (params.customerNote) {
      lines.push('');
      lines.push(`${this.E.note} *Nota general:* ${params.customerNote}`);
    }

    lines.push('');

    if (params.deliveryType === 'DELIVERY') {
      lines.push(`${this.E.delivery} *Entrega:* Domicilio`);
      lines.push(
        `${this.E.location} *Dirección:* ${
          params.address || 'No especificada'
        }`,
      );
      lines.push(
        `${this.E.house} *Barrio:* ${params.neighborhood || 'No especificado'}`,
      );
      lines.push(
        `${this.E.pin} *Referencia:* ${params.reference || 'Sin referencia'}`,
      );
    } else {
      lines.push(`${this.E.pickup} *Entrega:* Recoger en local`);
    }

    lines.push(
      `${this.E.card} *Método de pago:* ${this.getPaymentLabel(
        params.paymentMethod,
      )}`,
    );

    if (params.deliveryType === 'DELIVERY') {
      lines.push(
        `${this.E.money} *Subtotal:* ${this.formatMoney(params.subtotal)}`,
      );
      lines.push(`${this.E.delivery} *Domicilio:* Por confirmar`);
      lines.push(`${this.E.money} *Total:* Por confirmar`);
    } else {
      lines.push(
        `${this.E.money} *Total:* ${this.formatMoney(
          params.total || params.subtotal,
        )}`,
      );
    }

    return lines.join('\n');
  }

  generateWhatsappUrl(whatsappNumber: string, message: string): string {
    const cleanNumber = whatsappNumber.replace(/\D/g, '');
    const encodedMessage = encodeURIComponent(message);

    return `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
  }

  private formatMoney(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(value);
  }

  private getPaymentLabel(paymentMethod: PaymentMethod): string {
    const labels: Record<PaymentMethod, string> = {
      CASH: 'Efectivo',
      NEQUI: 'Nequi',
      BANCOLOMBIA: 'Bancolombia',
      QR: 'QR',
    };

    return labels[paymentMethod];
  }

  private getSafeProductEmoji(name: string): string {
    const normalizedName = name.toLowerCase();

    if (normalizedName.includes('hamburguesa')) return this.E.burger;
    if (normalizedName.includes('perro')) return this.E.hotdog;
    if (normalizedName.includes('papita')) return this.E.fries;
    if (normalizedName.includes('salchipapa')) return this.E.fries;
    if (normalizedName.includes('mazorcada')) return this.E.corn;
    if (normalizedName.includes('coca')) return this.E.drink;
    if (normalizedName.includes('postobón')) return this.E.drink;
    if (normalizedName.includes('uva')) return this.E.drink;
    if (normalizedName.includes('colombiana')) return this.E.drink;
    if (normalizedName.includes('ginger')) return this.E.drink;
    if (normalizedName.includes('jugo')) return this.E.juice;
    if (normalizedName.includes('churrasco')) return this.E.meat;
    if (normalizedName.includes('punta')) return this.E.meat;
    if (normalizedName.includes('filete')) return this.E.meat;
    if (normalizedName.includes('pechuga')) return this.E.chicken;

    return this.E.plate;
  }
}
