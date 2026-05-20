export type RowWithId<T> = T & {
  id: string;
  created_at: string;
  updated_at: string;
};
