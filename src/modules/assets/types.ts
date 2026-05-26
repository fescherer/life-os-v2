export type Asset = {
  asset_type: number;
  name: string;
  ticker: string;
};

export type AssetEntry = {
  date: string;
  value: number;
  bank: number;
  type: number;
  asset_id: string;
};
