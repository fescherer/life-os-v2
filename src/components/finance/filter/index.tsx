import {X } from "lucide-react"
import { FinanceAddItem } from "./add-item"
import { FinanceConfig } from "./config"
import { FinanceAdvancedFilter } from "./advanced-filter"

export function FilterFinance() {
  const filters = [
    'data 01/2026 - 30/04/2026',
    'categoria: alimentação',
    'valor: > R$ 100,00',

  ]    
  // const filters = []    

  return (
    <div className='flex flex-col'>
      <div className="flex justify-between">
        <span>Mostrando resultados de <strong>Abril de 2026</strong></span>

        <div className="flex gap-2">
          <FinanceAddItem />
          <FinanceConfig />
          <FinanceAdvancedFilter />
        </div>
      </div>
      <div className="flex min-h-8 max-w-full items-center gap-2 overflow-x-auto overflow-y-hidden whitespace-nowrap">
        {filters.length ? (
          filters.map((filter, index) => (
            <button key={index} className="group btn btn-sm shrink-0 rounded-full py-0! text-xs">
              <span>{filter}</span>
              <span className="flex translate-x-0 items-center opacity-100 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 [@media(hover:hover)]:-translate-x-1 [@media(hover:hover)]:opacity-0">
                <X size={12} className="opacity-70 hover:opacity-100" />
              </span>
            </button>
          ))
        ) : (
          <p className="text-xs opacity-60">Sem filtros selecionados</p>
        )}
      </div>
    </div>
  )
}
