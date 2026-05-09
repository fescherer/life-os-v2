Table fin_asset_transactions {
  id integer [primary key]
  owner_id uuid
  created_at timestamp
  updated_at timestamp
  occurred_at timestamp
  amount_cents integer [note: 'store in cents']
  description string
  account_id integer [note: "ex: Nubank, Inter"]
  transaction_type integer [note: "BUY, SELL, INCOME"]
  asset_id integer
}

Table fin_assets {
  id integer [primary key]
  owner_id uuid
  created_at timestamp
  updated_at timestamp
  asset_type integer [note: "FII, STOCK, CRYPTO"]
  name string
  ticker string
}

Table fin_entries {
  id integer [primary key]
  owner_id uuid
  created_at timestamp
  updated_at timestamp
  occurred_at timestamp
  amount_cents integer
  description string
  account_id integer [note: "bank or account"]
  entry_type integer [note: "EXPENSE, INCOME, TRANSFER"]
  category_id integer [note: "Food, Salary, Dividends, Subscriptions"]
}

Table shipment_tracking {
  id integer [primary key]
  owner_id uuid
  created_at timestamp
  updated_at timestamp
  entry_id integer
  carrier_id integer [note: "Correios, Shopee, Mercado Livre, Amazon"]
  tracking_url string
  estimated_delivery timestamp
  is_delivered boolean
}

Table coins {
  id integer [primary key]
  owner_id uuid
  created_at timestamp
  updated_at timestamp
  name string
  numista_url string
  minting_period string [note: "ex: 2016 or 2000-2016"]
  currency_family integer [note: "Real, Cruzeiro, etc"]
  owned boolean
  condition integer [note: "poor, acceptable, good, excellent"]
  is_commemorative boolean
}

Table gogo_items {
  id integer [primary key]
  owner_id uuid
  created_at timestamp
  updated_at timestamp
  collection_id integer [note: "Megatrip, Urban Toys"]
  is_official boolean
  quantity integer
  classification string [note: "ex: 1-05 or #fff000"]
}

Table gogo_entry_links {
  id integer [primary key]
  owner_id uuid
  created_at timestamp
  updated_at timestamp
  entry_id integer
}

Table media_list {
  id integer [primary key]
  owner_id uuid
  created_at timestamp
  updated_at timestamp
  list_type integer [note: "watchlist, reading_list, wishlist"]
  description string
  links string[]
}

Table reviews {
  id integer [primary key]
  owner_id uuid
  created_at timestamp
  updated_at timestamp
  review_date timestamp
  finished_at timestamp
  media_title string
  media_segment string [note: "arc, season, volume"]
  content string
}

Table selects {
  id integer [primary key]
  owner_id uuid
  name string
}

Table select_options {
  id integer [primary key]
  owner_id uuid
  select_id integer
  label string
  value string
}

Ref: select_options.select_id < selects.id

Ref: fin_asset_transactions.asset_id < fin_assets.id

Ref: shipment_tracking.entry_id < fin_entries.id
