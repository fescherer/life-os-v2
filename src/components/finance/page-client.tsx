'use client';

import type { FinanceAssetOption } from '@/queries/finances/assets';
import type {
  FinanceAssetEntryTableRow,
  FinanceChangedRecord,
  FinanceEditRecord,
  FinanceEntryTableRow,
} from '@/queries/finances/entries';
import type { FinanceSelectsData } from '@/types/finance-selects';
import FinanceDataTable, {
  type FinanceTab,
} from '@/components/finance/data-table';
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
  const [financeTab, setFinanceTab] = useState<FinanceTab>('entry');
  const [highlightedRecord, setHighlightedRecord] =
    useState<FinanceChangedRecord | null>(null);

  function handleRecordSaved(record: FinanceChangedRecord) {
    setFinanceTab(record.table === 'fin_entries' ? 'entry' : 'entry-asset');
    setHighlightedRecord(record);
  }

  return (
    <div className="flex h-full w-full flex-1 flex-col gap-4">
      <FilterFinance
        editingRecord={editingRecord}
        initialAssets={initialAssets}
        initialSelects={initialSelects}
        onEditingChange={setEditingRecord}
        onRecordSaved={handleRecordSaved}
      />

      <div className="flex flex-1 gap-4">
        <SummaryFinance />
        <FinanceDataTable
          highlightedRecord={highlightedRecord}
          initialAssetEntryData={initialAssetEntryData}
          initialEntryData={initialEntryData}
          onEditRecord={setEditingRecord}
          onHighlightComplete={() => setHighlightedRecord(null)}
          onTabChange={setFinanceTab}
          tab={financeTab}
        />
      </div>
    </div>
  );
}
