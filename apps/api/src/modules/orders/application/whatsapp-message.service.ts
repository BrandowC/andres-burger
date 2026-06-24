import { Injectable } from '@nestjs/common';
import { DeliveryType, PaymentMethod } from '@prisma/client';

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
  generateMessage(params: GenerateWhatsappMessageParams): string {
    const paymentLabel = this.getPaymentLabel(params.paymentMethod);

    const itemsText = params.items
      .map((item) => {
        const productLine = `${item.quantity} ${item.name} - ${this.formatMoney(
          item.subtotal,
        )}`;

        const additionsText =
          item.additions && item.additions.length > 0
            ? item.additions
                .map(
                  (addition) =>
                    `   + ${addition.quantity} ${addition.name} - ${this.formatMoney(
                      addition.subtotal,
                    )}`,
                )
                .join('\n')
            : '';

        const noteText = item.note
          ? `   *Nota del producto:*\n   ${item.note}`
          : '';

        return [productLine, additionsText, noteText]
          .filter(Boolean)
          .join('\n');
      })
      .join('\n');

    const deliveryText =
      params.deliveryType === DeliveryType.DELIVERY
        ? `*Entrega:*
Domicilio

*Dirección:*
${params.address || 'No especificada'}

*Barrio:*
${params.neighborhood || 'No especificado'}

*Referencia:*
${params.reference || 'Sin referencia'}`
        : `*Entrega:*
Recoger en local`;

    const totalText =
      params.deliveryType === DeliveryType.DELIVERY
        ? `*Subtotal:*
${this.formatMoney(params.subtotal)}

*Domicilio:*
Por confirmar

*Total:*
Por confirmar`
        : `*Total:*
${this.formatMoney(params.total || params.subtotal)}`;

    const noteText = params.customerNote
      ? `
*Nota general:*
${params.customerNote}
`
      : '';

    return `*Pedido ${params.businessName}*
*Código:*
${params.orderCode}

*Cliente:*
${params.customerName}

*Celular:*
${params.customerPhone}

*Pedido:*
${itemsText}
${noteText}
${deliveryText}

*Método de pago:*
${paymentLabel}

${totalText}`;
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
}
