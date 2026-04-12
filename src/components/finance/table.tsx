type Primitive = string | number | boolean | null | undefined | Date;
type CellValue = Primitive | Record<string, unknown> | unknown[];
type RowData = Record<string, CellValue>;

type TableProps<T extends RowData = RowData> = {
  data?: T[];
  title?: string;
};

export function Table<T extends RowData>({
  data = [],
  title = "Tabela",
}: TableProps<T>) {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="card bg-base-100 border-base-200 border shadow-sm">
        <div className="card-body">
          <h2 className="card-title">{title}</h2>
          <div className="alert">
            <span>Nenhum dado disponível.</span>
          </div>
        </div>
      </div>
    );
  }

  const columns = Array.from(
    new Set(data.flatMap((item) => Object.keys(item ?? {})))
  );

  const getValueType = (value: CellValue): string => {
    if (value === null) return "null";
    if (value === undefined) return "undefined";
    if (Array.isArray(value)) return "array";
    if (value instanceof Date) return "date";
    return typeof value;
  };

  const getColumnType = (column: string): string => {
    const detectedTypes = Array.from(
      new Set(
        data
          .map((row) => row?.[column])
          .filter((value): value is CellValue => value !== undefined && value !== null)
          .map((value) => getValueType(value))
      )
    );

    if (detectedTypes.length === 0) return "undefined";
    if (detectedTypes.length === 1) return detectedTypes[0];
    return "mixed";
  };

  const formatValue = (value: CellValue) => {
    const type = getValueType(value);

    switch (type) {
      case "null":
      case "undefined":
        return <span className="opacity-50">-</span>;
      case "boolean":
        return (
          <div className={`badge ${value ? "badge-success" : "badge-ghost"}`}>
            {value ? "Sim" : "Não"}
          </div>
        );
      case "date":
        return <span>{(value as Date).toLocaleString("pt-BR")}</span>;
      case "array":
        if ((value as unknown[]).length === 0) {
          return <span className="opacity-50">[]</span>;
        }

        return (
          <div className="flex flex-wrap gap-1">
            {(value as unknown[]).map((item, index) => (
              <span key={index} className="badge badge-outline">
                {typeof item === "object" ? JSON.stringify(item) : String(item)}
              </span>
            ))}
          </div>
        );
      case "object":
        return (
          <pre className="bg-base-200 rounded-lg p-2 text-xs break-words whitespace-pre-wrap">
            {JSON.stringify(value, null, 2)}
          </pre>
        );
      case "number":
        return <span className="font-mono">{value as number}</span>;
      default:
        return <span>{String(value)}</span>;
    }
  };

  const getTypeBadgeClass = (type: string): string => {
    switch (type) {
      case "string":
        return "badge-primary";
      case "number":
        return "badge-secondary";
      case "boolean":
        return "badge-success";
      case "array":
        return "badge-accent";
      case "object":
        return "badge-info";
      case "mixed":
        return "badge-warning";
      default:
        return "badge-ghost";
    }
  };

  return (
    <div className="card bg-base-100 border-base-200 border shadow-sm">
      <div className="card-body gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="card-title">{title}</h2>
            <p className="text-sm opacity-70">
              {data.length} registro{data.length > 1 ? "s" : ""} · {columns.length} coluna{columns.length > 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="border-base-200 overflow-x-auto rounded border">
          <table className="table-zebra table-pin-rows table">
            <thead>
              <tr>
                {columns.map((column) => {
                  const columnType = getColumnType(column);
                  return (
                    <th key={column} className="align-top">
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold">{column}</span>
                        <span className={`badge badge-xs ${getTypeBadgeClass(columnType)}`}>
                          {columnType}
                        </span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {data.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {columns.map((column) => (
                    <td key={`${rowIndex}-${column}`} className="max-w-xs align-top">
                      {formatValue(row?.[column])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
