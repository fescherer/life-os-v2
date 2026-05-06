import { ensureFinancesSelect } from "@/lib/queries/selects/ensure-finances";
import { getSupabaseConfig } from "@/lib/queries";
import {
  type FinanceSelectDeletePreview,
  EMPTY_FINANCE_SELECTS,
  FINANCE_SELECT_NAMES,
  type FinanceSelectName,
  type FinanceSelectOption,
  type FinanceSelectsData,
  type FinanceSelectUsageReference,
  getFinanceSelectKeyByName,
} from "@/types/finance-selects";
import { slugify } from "@/lib/util";

type UsageTarget = {
  column: string;
  label: string;
  table: "fin_assets" | "fin_assets_entries" | "fin_entries";
};

const FINANCE_SELECT_USAGE_MAP: Record<FinanceSelectName, UsageTarget[]> = {
  [FINANCE_SELECT_NAMES.banks]: [
    { table: "fin_entries", column: "bank", label: "lancamentos" },
    { table: "fin_assets_entries", column: "bank", label: "movimentacoes de ativos" },
  ],
  [FINANCE_SELECT_NAMES.assetEntryTypes]: [
    { table: "fin_assets_entries", column: "type", label: "movimentacoes de ativos" },
  ],
  [FINANCE_SELECT_NAMES.assetTypes]: [
    { table: "fin_assets", column: "type", label: "ativos" },
  ],
  [FINANCE_SELECT_NAMES.entryTypes]: [
    { table: "fin_entries", column: "type", label: "lancamentos" },
  ],
  [FINANCE_SELECT_NAMES.entryCategories]: [
    { table: "fin_entries", column: "category", label: "lancamentos" },
  ],
};

function dedupeFinanceOptions(options: FinanceSelectOption[]) {
  const uniqueOptions = new Map<string, FinanceSelectOption>();

  for (const option of options) {
    const existingOption = uniqueOptions.get(option.value);

    if (!existingOption || option.id < existingOption.id) {
      uniqueOptions.set(option.value, option);
    }
  }

  return Array.from(uniqueOptions.values()).sort((a, b) =>
    a.label.localeCompare(b.label)
  );
}

function dedupeFinanceSelectRows(selects: Array<{ id: number; name: FinanceSelectName }>) {
  const uniqueSelects = new Map<FinanceSelectName, { id: number; name: FinanceSelectName }>();

  for (const select of selects) {
    const existingSelect = uniqueSelects.get(select.name);

    if (!existingSelect || select.id < existingSelect.id) {
      uniqueSelects.set(select.name, select);
    }
  }

  return Array.from(uniqueSelects.values());
}

async function getCanonicalFinanceSelect(input: {
  selectName: FinanceSelectName;
  supabase: Awaited<ReturnType<typeof getSupabaseConfig>>["supabase"];
  userId: string;
}) {
  const { data: select, error: selectError } = await input.supabase
    .from("selects")
    .select("id, name")
    .eq("user_id", input.userId)
    .eq("name", input.selectName)
    .order("id", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (selectError) throw selectError;

  if (!select) {
    throw new Error(`Select not found: ${input.selectName}`);
  }

  return select;
}

export async function getFinanceSelects(): Promise<FinanceSelectsData> {
  await ensureFinancesSelect();

  const { user, supabase } = await getSupabaseConfig();
  const selectNames = Object.values(FINANCE_SELECT_NAMES);

  const { data: selects, error: selectsError } = await supabase
    .from("selects")
    .select("id, name")
    .eq("user_id", user.id)
    .in("name", selectNames)
    .order("name", { ascending: true })
    .order("id", { ascending: true });

  if (selectsError) throw selectsError;

  if (!selects?.length) {
    return { ...EMPTY_FINANCE_SELECTS };
  }

  const canonicalSelects = dedupeFinanceSelectRows(
    selects as Array<{ id: number; name: FinanceSelectName }>
  );
  const selectIds = canonicalSelects.map((select) => select.id);

  const { data: options, error: optionsError } = await supabase
    .from("selects_options")
    .select("id, select_id, label, value")
    .eq("user_id", user.id)
    .in("select_id", selectIds)
    .order("label", { ascending: true });

  if (optionsError) throw optionsError;

  const selectNameById = new Map(
    canonicalSelects.map((select) => [select.id, select.name])
  );
  const result: FinanceSelectsData = {
    ...EMPTY_FINANCE_SELECTS,
  };

  for (const option of options ?? []) {
    const selectName = selectNameById.get(option.select_id) as
      | FinanceSelectName
      | undefined;

    if (!selectName) continue;

    const key = getFinanceSelectKeyByName(selectName);
    result[key].push({
      id: option.id,
      label: option.label,
      value: option.value,
    });
  }

  for (const key of Object.keys(result) as Array<keyof FinanceSelectsData>) {
    result[key] = dedupeFinanceOptions(result[key]);
  }

  return result;
}

export async function createFinanceSelectOption(input: {
  selectName: FinanceSelectName;
  label: string;
}): Promise<FinanceSelectOption> {
  const { user, supabase } = await getSupabaseConfig();
  const normalizedLabel = input.label.trim();
  const normalizedValue = slugify(normalizedLabel);

  if (!normalizedValue) {
    throw new Error("A opção precisa conter pelo menos uma letra ou número.");
  }

  const select = await getCanonicalFinanceSelect({
    selectName: input.selectName,
    supabase,
    userId: user.id,
  });

  const { data: existingOption, error: existingOptionError } = await supabase
    .from("selects_options")
    .select("id, label, value")
    .eq("user_id", user.id)
    .eq("select_id", select.id)
    .eq("value", normalizedValue)
    .maybeSingle();

  if (existingOptionError) throw existingOptionError;

  if (existingOption) {
    return {
      id: existingOption.id,
      label: existingOption.label,
      value: existingOption.value,
    };
  }

  const { data, error } = await supabase
    .from("selects_options")
    .insert({
      user_id: user.id,
      select_id: select.id,
      label: normalizedLabel,
      value: normalizedValue,
    })
    .select("id, label, value")
    .single();

  if (error) throw error;

  return {
    id: data.id,
    label: data.label,
    value: data.value,
  };
}

async function getFinanceSelectOptionContext(input: {
  optionId: number;
  selectName: FinanceSelectName;
}) {
  const { user, supabase } = await getSupabaseConfig();

  const select = await getCanonicalFinanceSelect({
    selectName: input.selectName,
    supabase,
    userId: user.id,
  });

  const { data: option, error: optionError } = await supabase
    .from("selects_options")
    .select("id, label, value")
    .eq("user_id", user.id)
    .eq("select_id", select.id)
    .eq("id", input.optionId)
    .single();

  if (optionError) throw optionError;

  return {
    option,
    selectId: select.id,
    supabase,
    userId: user.id,
  };
}

async function countOptionUsage(input: {
  column: string;
  optionId: number;
  table: UsageTarget["table"];
  supabase: Awaited<ReturnType<typeof getSupabaseConfig>>["supabase"];
  userId: string;
}) {
  const { count, error } = await input.supabase
    .from(input.table)
    .select("*", { count: "exact", head: true })
    .eq("user_id", input.userId)
    .eq(input.column, input.optionId);

  if (error) throw error;

  return count ?? 0;
}

async function getReplacementOption(input: {
  optionId: number;
  selectId: number;
  supabase: Awaited<ReturnType<typeof getSupabaseConfig>>["supabase"];
  userId: string;
}) {
  const { data: replacementOption, error } = await input.supabase
    .from("selects_options")
    .select("id")
    .eq("user_id", input.userId)
    .eq("select_id", input.selectId)
    .eq("id", input.optionId)
    .single();

  if (error) throw error;

  return replacementOption;
}

async function replaceOptionUsage(input: {
  fromOptionId: number;
  selectName: FinanceSelectName;
  supabase: Awaited<ReturnType<typeof getSupabaseConfig>>["supabase"];
  toOptionId: number;
  userId: string;
}) {
  const targets = FINANCE_SELECT_USAGE_MAP[input.selectName];

  for (const target of targets) {
    const { error } = await input.supabase
      .from(target.table)
      .update({ [target.column]: input.toOptionId })
      .eq("user_id", input.userId)
      .eq(target.column, input.fromOptionId);

    if (error) throw error;
  }
}

export async function previewFinanceSelectOptionDeletion(input: {
  optionId: number;
  selectName: FinanceSelectName;
}): Promise<FinanceSelectDeletePreview> {
  const { option, supabase, userId } = await getFinanceSelectOptionContext(input);
  const targets = FINANCE_SELECT_USAGE_MAP[input.selectName];

  const referencesWithCounts = await Promise.all(
    targets.map(async (target) => ({
      ...target,
      count: await countOptionUsage({
        column: target.column,
        optionId: input.optionId,
        supabase,
        table: target.table,
        userId,
      }),
    }))
  );

  const references: FinanceSelectUsageReference[] = referencesWithCounts
    .filter((target) => target.count > 0)
    .map(({ count, label, table }) => ({
      count,
      label,
      table,
    }));

  const usageCount = references.reduce((total, reference) => total + reference.count, 0);

  return {
    canDelete: usageCount === 0,
    optionId: option.id,
    optionLabel: option.label,
    references,
    replacementRequired: usageCount > 0,
    usageCount,
  };
}

export async function deleteFinanceSelectOption(input: {
  optionId: number;
  replacementOptionId?: number;
  selectName: FinanceSelectName;
}): Promise<FinanceSelectDeletePreview> {
  const preview = await previewFinanceSelectOptionDeletion(input);
  const { selectId, supabase, userId } = await getFinanceSelectOptionContext(input);

  if (!preview.canDelete && typeof input.replacementOptionId !== "number") {
    throw new Error("Essa opcao ainda esta sendo usada e nao pode ser excluida.");
  }

  if (typeof input.replacementOptionId === "number") {
    if (input.replacementOptionId === input.optionId) {
      throw new Error("Escolha uma opcao diferente para substituir.");
    }

    await getReplacementOption({
      optionId: input.replacementOptionId,
      selectId,
      supabase,
      userId,
    });

    await replaceOptionUsage({
      fromOptionId: input.optionId,
      selectName: input.selectName,
      supabase,
      toOptionId: input.replacementOptionId,
      userId,
    });
  }

  const { error } = await supabase
    .from("selects_options")
    .delete()
    .eq("user_id", userId)
    .eq("select_id", selectId)
    .eq("id", input.optionId);

  if (error) throw error;

  return preview;
}
