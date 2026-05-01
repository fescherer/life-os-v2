'use client';

import type { FinanceAssetOption } from '@/queries/finances/assets';
import type {
  FinanceAssetEntryTableRow,
  FinanceEditRecord,
  FinanceEntryTableRow,
} from '@/queries/finances/entries';
import type { FinanceSelectsData } from '@/types/finance-selects';
import FinanceDataTable from '@/components/finance/data-table';
import { FilterFinance } from '@/components/finance/filter';
import { SummaryFinance } from '@/components/finance/summary';
import { useState } from 'react';

type Props = {
  initialAssetEntryData: FinanceAssetEntryTableRow[];
  initialAssets: FinanceAssetOption[];
  initialEntryData: FinanceEntryTableRow[];
  initialSelects: FinanceSelectsData;
};

export function FinancePageClient({
  initialAssetEntryData,
  initialAssets,
  initialEntryData,
  initialSelects,
}: Props) {
  const [editingRecord, setEditingRecord] = useState<FinanceEditRecord | null>(null);

  return (
    <div className="flex h-full w-full flex-1 flex-col gap-4">
      <FilterFinance
        editingRecord={editingRecord}
        initialAssets={initialAssets}
        initialSelects={initialSelects}
        onEditingChange={setEditingRecord}
      />

      <div className="flex flex-1 gap-4">
        <SummaryFinance />
        <FinanceDataTable
          initialAssetEntryData={initialAssetEntryData}
          initialEntryData={initialEntryData}
          onEditRecord={setEditingRecord}
        />
      </div>
    </div>
  );
}
