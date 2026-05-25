export type GogoCollectionItem = {
  id: string;
  color: string;
  colorText: string;
  colorType: string;
  imageUrl?: string;
  quantity: number;
};

export type GogoCollection = {
  name: string;
  coverUrl?: string;
  items: GogoCollectionItem[];
};

export type GogoPurchase = {
  date: string;
  description: string;
  price: number;
  store: string;
};
