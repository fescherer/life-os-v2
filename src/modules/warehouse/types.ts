export type WarehouseItem = {
  id: string;
  text: string;
};

export type WarehouseBox = {
  name: string;
  coverUrl?: string;
  items: WarehouseItem[];
};
