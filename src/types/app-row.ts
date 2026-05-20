export type AppDataRow<T = Record<string, unknown>> = {
  id: string;
  user_id: string;
  table_id: string;
  data: T;
  position: number;
  created_at: string;
  updated_at: string;
};
