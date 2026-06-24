export type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  emoji: string | null;
  imageUrl: string | null;
};

export type Category = {
  id: string;
  name: string;
  emoji: string | null;
  products: Product[];
};

export type Addition = {
  id: string;
  name: string;
  price: number;
  emoji: string | null;
};

export type BusinessMenu = {
  id: string;
  name: string;
  description: string | null;
  address: string;
  openingHours: string;
  phone: string;
  whatsappNumber: string;
  categories: Category[];
  additions: Addition[];
};
