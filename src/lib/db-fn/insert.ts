type ApiResult<T> = {
  data: T | null;
  error: { message: string } | null;
};

export async function insertRow(
  tableId: string,
  data: Record<string, unknown>
) {
  const response = await fetch("/api/app-data", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ tableId, data }),
  });

  return (await response.json()) as ApiResult<{
    id: string;
    table_id: string;
    data: Record<string, unknown>;
    created_at: string;
    updated_at: string;
  }>;
}
