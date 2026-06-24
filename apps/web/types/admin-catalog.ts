export type AdminCategory = {
  id: string;
  name: string;
  slug: string;
  emoji: string | null;
  sortOrder: number;
  isActive: boolean;
};

export type AdminProduct = {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  emoji: string | null;
  imageUrl: string | null;
  isAvailable: boolean;
  isFeatured: boolean;
  sortOrder: number;
  category: AdminCategory;
};
