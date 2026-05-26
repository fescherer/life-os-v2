"use client";

import { DataTable } from "@/components/data-table";
import { openAssetEntryRowEdit } from "@/modules/assets/components/asset-entry-row-actions";
import { getAssetEntryColumns } from "@/modules/assets/table-columns";
import { Asset, AssetEntry } from "@/modules/assets/types";
import { SelectOption } from "@/types/select-option";
import { RowWithId } from "@/types/table";
import { useMemo } from "react";

type AssetsTableProps = {
  assets: RowWithId<Asset>[];
  entries: RowWithId<AssetEntry>[];
  selectOptions: SelectOption[];
};

export function AssetsTable({
  assets,
  entries,
  selectOptions,
}: AssetsTableProps) {
  const columns = useMemo(
    () => getAssetEntryColumns(assets, selectOptions),
    [assets, selectOptions],
  );

  return (
    <DataTable
      columns={columns}
      data={entries}
      filterColumn="asset_ticker"
      filterPlaceholder="Filter tickers..."
      onRowDoubleClick={(entry) => openAssetEntryRowEdit(entry.id)}
    />
  );
}
