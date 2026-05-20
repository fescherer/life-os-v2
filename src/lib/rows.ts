export const DB_ROWS = [
  {
    id: 1,
    created_at: "2024-01-01T00:00:00.000Z",
    updated_at: "2024-01-01T00:00:00.000Z",
    table_id: "finances_entries",
    position: 0,
  },
  {
    id: 2,
    created_at: "2024-01-02T00:00:00.000Z",
    updated_at: "2024-01-02T00:00:00.000Z",
    table_id: "assets_entries",
    position: 0,
  },
]


export const DB_ROWS_VALUES = [
  {
    id: 1,
    row_id: 1,
    column_id: "date",
    value_numeric: null,
    value_string: '2024-01-01',
  },
  {
    id: 2,
    row_id: 1,
    column_id: "amount",
    value_numeric: 10000,
    value_string: null,
  },
  {
    id: 3,
    row_id: 1,
    column_id: "description",
    value_numeric: null,
    value_string: 'salario',
  },
  {
    id: 4,
    row_id: 1,
    column_id: "bank",
    value_numeric: 1,
    value_string: null,
  },
  {
    id: 5,
    row_id: 1,
    column_id: "type",
    value_numeric: 5,
    value_string: null,
  },

  {
    id: 6,
    row_id: 2,
    column_id: "date",
    value_numeric: null,
    value_string: '2024-01-02',
  },
  {
    id: 7,
    row_id: 2,
    column_id: "amount",
    value_numeric: 5000,
    value_string: null,
  }
]



export const example = [
  {
    table_id: "finances_entries",
    date: '2024-01-01',
    amount: 10000,
    description: 'salario',
    bank: 1,
    type: 5,
  }
]
