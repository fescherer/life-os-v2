export type WarehouseItem = {
  id: string;
  text: string;
};

export type WarehouseBox = {
  name: string;
  items: WarehouseItem[];
};
