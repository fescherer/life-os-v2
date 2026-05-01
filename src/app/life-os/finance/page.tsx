import { FinancePageClient } from '@/components/finance/page-client'
import { getFinanceAssets } from '@/queries/finances/assets'
import {
  getFinanceAssetEntryTableRows,
  getFinanceEntryTableRows,
} from '@/queries/finances/entries'
import { getFinanceSelects } from '@/queries/finances/selects'

export default async function FinancePage() {
  const financeEntries = await getFinanceEntryTableRows()
  const financeAssetEntries = await getFinanceAssetEntryTableRows()
  const financeAssets = await getFinanceAssets()
  const financeSelects = await getFinanceSelects()

  return (
    <FinancePageClient
      initialAssetEntryData={financeAssetEntries}
      initialAssets={financeAssets}
      initialEntryData={financeEntries}
      initialSelects={financeSelects}
    />
  )
}
