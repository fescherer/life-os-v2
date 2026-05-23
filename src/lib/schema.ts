


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
    id: "coin_collection",
    label: "Coin Collection",
    columns: [
      {
        id: "year",
        label: "Year",
        type: POSSIBLE_TYPES.STRING,
      },
      {
        id: "name",
        label: "Name",
        type: POSSIBLE_TYPES.STRING,
      },
      {
        id: "family",
        label: "Family",
        type: POSSIBLE_TYPES.STRING,
      },
      {
        id: "description",
        label: "Description",
        type: POSSIBLE_TYPES.STRING,
      },
      {
        id: "numistaId",
        label: "Numista ID",
        type: POSSIBLE_TYPES.STRING,
      },
      {
        id: "imageUrl",
        label: "Image",
        type: POSSIBLE_TYPES.URL,
      },
      {
        id: "material",
        label: "Material",
        type: POSSIBLE_TYPES.STRING,
      },
      {
        id: "isCommemorative",
        label: "Commemorative",
        type: POSSIBLE_TYPES.BOOLEAN,
      },
      {
        id: "isOwned",
        label: "In Collection",
        type: POSSIBLE_TYPES.BOOLEAN,
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
