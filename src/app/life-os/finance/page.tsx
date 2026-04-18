import { Table } from '@/components/finance/table'

export default function FinancePage() {
  const data = [
    { id: 1, nome: 'Ana', idade: 28, ativo: true },
    { id: 2, nome: 'Carlos', idade: 35, ativo: false, tags: ['admin'] },
    { id: 3, nome: 'Felipe', cidade: 'Sao Paulo' },
  ]

  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <h1 className="text-2xl font-bold">Finance Page</h1>
      <Table data={data} />
    </div>
  )
}
