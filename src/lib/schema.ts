


export const POSSIBLE_TYPES = {
  STRING: "string",
  NUMBER: "number",
  BOOLEAN: "boolean",
  DATE: "date",
  FORMULA: "formula",
  URL: "url",
  SELECT: "select",
  RELATION: "relation",
} as const;



export const DB_TABLES = [
  {
    id: "finances_entries",
    label: "Finances",
    columns: [
      {
        id: "date",
        label: "Data",
        type: POSSIBLE_TYPES.DATE,
      },
      {
        id: "amount",
        label: "Valor",
        type: POSSIBLE_TYPES.NUMBER,
      },
      {
        id: "description",
        label: "Descricao",
        type: POSSIBLE_TYPES.STRING,
      },
      {
        id: "bank",
        label: "Banco",
        type: POSSIBLE_TYPES.SELECT,
        config: {
          selectId: "bank",
        },
      },
      {
        id: "type",
        label: "Tipo",
        type: POSSIBLE_TYPES.SELECT,
        config: {
          selectId: "entry_type",
        },
      },
    ],
  },
  {
    id: "assets",
    label: "Assets",
    columns: [
      {
        id: "name",
        label: "Name",
        type: POSSIBLE_TYPES.STRING,
      },
      {
        id: "ticker",
        label: "Ticker",
        type: POSSIBLE_TYPES.STRING,
      },
      {
        id: "asset_type",
        label: "Tipo de Ativo",
        type: POSSIBLE_TYPES.SELECT,
        config: {
          selectId: "asset_type",
        },
      },
    ],
  },
  {
    id: "assets_entries",
    label: "Assets Entries",
    columns: [
      {
        id: "date",
        label: "Data",
        type: POSSIBLE_TYPES.DATE,
      },
      {
        id: "amount",
        label: "Valor",
        type: POSSIBLE_TYPES.NUMBER,
      },
      {
        id: "description",
        label: "Descricao",
        type: POSSIBLE_TYPES.STRING,
      },
      {
        id: "bank",
        label: "Banco",
        type: POSSIBLE_TYPES.SELECT,
        config: {
          selectId: "bank",
        },
      },
      {
        id: "type",
        label: "Tipo",
        type: POSSIBLE_TYPES.SELECT,
        config: {
          selectId: "asset_entry_type",
        },
      },
      {
        id: "asset",
        label: "Ativo",
        type: POSSIBLE_TYPES.RELATION,
        config: {
          relationId: "assets",
        },
      },
    ],
  },
] as const;