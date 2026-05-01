export const SupabaseTables = {
  fin_assets: {
    row: {
      created_at: "created_at",
      id: "id",
      name: "name",
      ticker: "ticker",
      type: "type",
      updated_at: "updated_at",
      user_id: "user_id",
    },
    relationships: [
      {
        foreignKeyName: "fin_assets_type_fkey",
        columns: {"type": "type"},
        isOneToOne: false,
        referencedRelation: "selects_options",
        referencedColumns: {"id": "id"},
      },
    ]
  },
  fin_assets_entries: {
    row: {
      asset_id: "asset_id",
      bank: "bank",
      created_at: "created_at",
      date: "date",
      description: "description",
      id: "id",
      type: "type",
      updated_at: "updated_at",
      user_id: "user_id",
      value: "value"
    },
    relationships: [
      {
        foreignKeyName: "fin_assets_entries_asset_id_fkey",
        columns: {"asset_id": "asset_id"},
        isOneToOne: false,
        referencedRelation: "selects_options",
        referencedColumns: {"id": "id"},
      },
      {
        foreignKeyName: "fin_assets_entries_asset_id_fkey1",
        columns: {"asset_id": "asset_id"},
        isOneToOne: false,
        referencedRelation: "fin_assets",
        referencedColumns: {"id": "id"},
      },
      {
        foreignKeyName: "fin_assets_entries_type_fkey",
        columns: {"type": "type"},
        isOneToOne: false,
        referencedRelation: "selects_options",
        referencedColumns: {"id": "id"},
      },
    ]
  },
  fin_entries: {
    row: {
      bank: "bank",
      category: "category",
      created_at: "created_at",
      date: "date",
      description: "description",
      id: "id",
      type: "type",
      updated_at: "updated_at",
      user_id: "user_id",
      value: "value",
    },
    relationships: [
      {
        foreignKeyName: "fin_entries_bank_fkey",
        columns: {"bank": "bank"},
        isOneToOne: false,
        referencedRelation: "selects_options",
        referencedColumns: {"id": "id"},
      },
      {
        foreignKeyName: "fin_entries_category_fkey",
        columns: {"category": "category"},
        isOneToOne: false,
        referencedRelation: "selects_options",
        referencedColumns: {"id": "id"},
      },
      {
        foreignKeyName: "fin_entries_type_fkey",
        columns: {"type": "type"},
        isOneToOne: false,
        referencedRelation: "selects_options",
        referencedColumns: {"id": "id"},
      },
    ]
  },
  packaging_tracker: {
    row: {
      carrier_id: "carrier_id",
      created_at: "created_at",
      estimated_delivery: "estimated_delivery",
      fin_entry_id: "fin_entry_id",
      id: "id",
      is_delivered: "is_delivered",
      tracking_url: "tracking_url",
      updated_at: "updated_at",
      user_id: "user_id",
    },
    relationships: [
      {
        foreignKeyName: "packaging_tracker_carrier_id_fkey",
        columns: {"carrier_id": "carrier_id"},
        isOneToOne: false,
        referencedRelation: "selects_options",
        referencedColumns: {"id": "id"},
      },
      {
        foreignKeyName: "packaging_tracker_fin_entry_id_fkey",
        columns: {"fin_entry_id": "fin_entry_id"},
        isOneToOne: false,
        referencedRelation: "fin_entries",
        referencedColumns: {"id": "id"},
      },
    ]
  },
  selects: {
    row: {
      created_at: "created_at",
      id: "id",
      name: "name",
      updated_at: "updated_at",
      user_id: "user_id",
    },
    relationships: []
  },
  selects_options: {
    row: {
      created_at: "created_at",
      id: "id",
      label: "label",
      select_id: "select_id",
      updated_at: "updated_at",
      user_id: "user_id",
      value: "value",
    },
    relationships: [
      {
        foreignKeyName: "selects_options_select_id_fkey",
        columns: {"select_id": "select_id"},
        isOneToOne: false,
        referencedRelation: "selects",
        referencedColumns: {"id": "id"},
      },
    ]
  },
  user_settings: {
    row: {
      config: "config",
      created_at: "created_at",
      id: "id",
      updated_at: "updated_at",
      user_id: "user_id",
      value: "value",
    },
    relationships: []
  }
}