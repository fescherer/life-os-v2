'use client';

import { useState } from 'react';
import FinanceDataTable, { type Column } from './table';

type FinanceTab = 'income' | 'expenses';

type IncomeRow = {
  id: number;
  source: string;
  category: string;
  amount: string;
  date: string;
};

type ExpenseRow = {
  id: number;
  vendor: string;
  category: string;
  amount: string;
  status: string;
};

const incomeData: IncomeRow[] = [
  { id: 1, source: 'Salary', category: 'Work', amount: '$4,500', date: '2026-04-01' },
  { id: 2, source: 'Freelance', category: 'Client', amount: '$850', date: '2026-04-08' },
];

const vendors = ['Amazon', 'Netflix', 'Google', 'Apple', 'Microsoft', 'Uber', 'Spotify'];
const categories = ['Office', 'Subscription', 'Travel', 'Food', 'Software'];
const statuses = ['Paid', 'Pending', 'Failed'];

const expenseData: ExpenseRow[] = Array.from({ length: 200 }, (_, i) => ({
  id: i + 1,
  vendor: vendors[Math.floor(Math.random() * vendors.length)],
  category: categories[Math.floor(Math.random() * categories.length)],
  amount: `$${(Math.random() * 500).toFixed(2)}`,
  status: statuses[Math.floor(Math.random() * statuses.length)],
}));

const incomeColumns: Column<IncomeRow>[] = [
  { key: 'source', label: 'Source' },
  { key: 'category', label: 'Category' },
  { key: 'amount', label: 'Amount' },
  { key: 'date', label: 'Date' },
];

const expenseColumns: Column<ExpenseRow>[] = [
  { key: 'vendor', label: 'Vendor' },
  { key: 'category', label: 'Category' },
  { key: 'amount', label: 'Amount' },
  { key: 'status', label: 'Status' },
];

export default function TablePage() {
  const [tab, setTab] = useState<FinanceTab>('income');
  const [search, setSearch] = useState('');

  return (
    <main className="card border-base-300 bg-base-100 flex flex-1 flex-col p-3 shadow-sm sm:p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div role="tablist" className="tabs tabs-lift">
          <button
            role="tab"
            className={`tab border-base-300 h-14 min-h-14 px-4 ${
              tab === 'income' ? 'tab-active bg-base-200! text-base-content!' : ''
            }`}
            onClick={() => {
              setTab('income');
              setSearch('');
            }}
          >
            Income
          </button>

          <button
            role="tab"
            className={`tab border-base-300 h-14 min-h-14 px-4 ${
              tab === 'expenses' ? 'tab-active bg-base-200! text-base-content!' : ''
            }`}
            onClick={() => {
              setTab('expenses');
              setSearch('');
            }}
          >
            Expenses
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
        {tab === 'income' ? (
          <FinanceDataTable<IncomeRow>
            columns={incomeColumns}
            data={incomeData}
            search={search}
          />
        ) : (
          <FinanceDataTable<ExpenseRow>
            columns={expenseColumns}
            data={expenseData}
            search={search}
          />
        )}
      </div>
    </main>
  );
}
