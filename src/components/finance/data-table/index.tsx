'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import type {
  FinanceAssetEntryTableRow,
  FinanceEditRecord,
  FinanceEntryTableRow,
} from '@/queries/finances/entries';
import FinanceDataTable, { type Column } from './table';

type FinanceTab = 'entry' | 'entry-asset';

const entryColumns: Column<FinanceEntryTableRow>[] = [
  { key: 'date', label: 'Date' },
  { key: 'description', label: 'Description' },
  { key: 'bank', label: 'Bank' },
  { key: 'type', label: 'Type' },
  { key: 'category', label: 'Category' },
  { key: 'amount', label: 'Amount' },
];

const entryAssetColumns: Column<FinanceAssetEntryTableRow>[] = [
  { key: 'date', label: 'Date' },
  { key: 'description', label: 'Description' },
  { key: 'bank', label: 'Bank' },
  { key: 'type', label: 'Type' },
  { key: 'asset', label: 'Asset' },
  { key: 'amount', label: 'Amount' },
];

type TablePageProps = {
  initialAssetEntryData: FinanceAssetEntryTableRow[];
  initialEntryData: FinanceEntryTableRow[];
  onEditRecord: (record: FinanceEditRecord) => void;
};

export default function TablePage({
  initialAssetEntryData,
  initialEntryData,
  onEditRecord,
}: TablePageProps) {
  const [tab, setTab] = useState<FinanceTab>('entry');
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery<
    FinanceEntryTableRow[] | FinanceAssetEntryTableRow[]
  >({
    queryKey: ['finances', tab],
    queryFn: async () => {
      const params =
        tab === 'entry' ? '' : '?table=fin_assets_entries';
      const res = await fetch(`/api/finances${params}`);

      if (!res.ok) {
        throw new Error(`Failed to load ${tab}`);
      }

      return res.json();
    },
    initialData: tab === 'entry' ? initialEntryData : initialAssetEntryData,
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <main className="card border-base-300 bg-base-100 flex flex-1 flex-col p-3 shadow-sm sm:p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div role="tablist" className="tabs tabs-lift">
          <button
            role="tab"
            className={`tab border-base-300 h-14 min-h-14 px-4 ${
              tab === 'entry' ? 'tab-active bg-base-200! text-base-content!' : ''
            }`}
            onClick={() => {
              setTab('entry');
              setSearch('');
            }}
          >
            Entry
          </button>

          <button
            role="tab"
            className={`tab border-base-300 h-14 min-h-14 px-4 ${
              tab === 'entry-asset'
                ? 'tab-active bg-base-200! text-base-content!'
                : ''
            }`}
            onClick={() => {
              setTab('entry-asset');
              setSearch('');
            }}
          >
            Entry Asset
          </button>
        </div>

        <label className="input input-bordered mb-3 flex w-full items-center gap-2 sm:max-w-sm">
          <span className="text-base-content/50">⌕</span>
          <input
            className="grow"
            placeholder="Search records..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
      </div>

      <div className="border-base-300 bg-base-100 -mt-px flex flex-1 overflow-hidden rounded-tr-2xl rounded-b-2xl border">
        {tab === 'entry' ? (
          <FinanceDataTable<FinanceEntryTableRow>
            columns={entryColumns}
            data={data ?? []}
            onEditRow={(row) =>
              onEditRecord({
                bankId: row.bankId,
                categoryId: row.categoryId,
                date: row.rawDate,
                description: row.description,
                id: row.id,
                table: "fin_entries",
                typeId: row.typeId,
                value: row.rawValue,
              })
            }
            search={search}
          />
        ) : (
          <FinanceDataTable<FinanceAssetEntryTableRow>
            columns={entryAssetColumns}
            data={data ?? []}
            onEditRow={(row) =>
              onEditRecord({
                assetId: row.assetId,
                bankId: row.bankId,
                date: row.rawDate,
                description: row.description,
                id: row.id,
                table: "fin_assets_entries",
                typeId: row.typeId,
                value: row.rawValue,
              })
            }
            search={search}
          />
        )}
      </div>
    </main>
  );
}
