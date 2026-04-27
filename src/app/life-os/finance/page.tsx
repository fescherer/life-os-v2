import FinanceDataTable from '@/components/finance/data-table'
import { FilterFinance } from '@/components/finance/filter'
import { SummaryFinance } from '@/components/finance/summary'

export default function FinancePage() {
  return (
    <div className="flex h-full w-full flex-1 flex-col gap-4">
      <FilterFinance />
      
      <div className='flex flex-1 gap-4'> 
        <SummaryFinance />
        <FinanceDataTable />
      </div>
    </div>
  )
}
