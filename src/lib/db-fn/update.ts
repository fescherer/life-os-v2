type ApiResult<T> = {
  data: T | null;
  error: { message: string } | null;
};

export async function updateRow(
  rowId: string,
  data: Record<string, unknown>
) {
  const response = await fetch(`/api/app-data/${rowId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ data }),
  });

  return (await response.json()) as ApiResult<{
    id: string;
    table_id: string;
    data: Record<string, unknown>;
    created_at: string;
    updated_at: string;
  }>;
}
