type ApiResult<T> = {
  data: T | null;
  error: { message: string } | null;
};

export async function deleteRow(rowId: string) {
  const response = await fetch(`/api/app-data/${rowId}`, {
    method: "DELETE",
  });

  return (await response.json()) as ApiResult<{ id: string }>;
}
