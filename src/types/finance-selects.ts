export const FINANCE_SELECT_NAMES = {
  banks: "finances_bank",
  assetEntryTypes: "finances_asset_entry_type",
  assetTypes: "finances_asset_type",
  entryTypes: "finances_entry_type",
  entryCategories: "finances_entry_category",
} as const;

export type FinanceSelectKey = keyof typeof FINANCE_SELECT_NAMES;
export type FinanceSelectName =
  (typeof FINANCE_SELECT_NAMES)[FinanceSelectKey];

export type FinanceSelectOption = {
  id: number;
  label: string;
  value: string;
};

export type FinanceSelectUsageReference = {
  count: number;
  label: string;
  table: string;
};

export type FinanceSelectDeletePreview = {
  canDelete: boolean;
  optionId: number;
  optionLabel: string;
  references: FinanceSelectUsageReference[];
  replacementRequired: boolean;
  usageCount: number;
};

export type FinanceSelectsData = Record<FinanceSelectKey, FinanceSelectOption[]>;

export const EMPTY_FINANCE_SELECTS: FinanceSelectsData = {
  banks: [],
  assetEntryTypes: [],
  assetTypes: [],
  entryTypes: [],
  entryCategories: [],
};

export function getFinanceSelectKeyByName(
  name: FinanceSelectName
): FinanceSelectKey {
  const entry = Object.entries(FINANCE_SELECT_NAMES).find(
    ([, selectName]) => selectName === name
  ) as [FinanceSelectKey, FinanceSelectName] | undefined;

  if (!entry) {
    throw new Error(`Unknown finance select name: ${name}`);
  }

  return entry[0];
}
