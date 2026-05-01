'use client'
import { useState } from 'react';
import { Modal } from '../modal';

export function SummaryFinance() {
  const [selected, setSelected] = useState("mes");

  const menu_items = [
    {
      name: 'Incomes',
      value: <strong>R$ 12.000,00</strong>,
      content: <p>Graph showing incomes</p>,
      fn: () => {}
    },
    {
      name: 'Expenses',
      value: <strong>R$ 8.500,00</strong>,
      content: <p>Graph showing expenses</p>,
      fn: () => {}
    },
    {
      name: 'Total',
      value: <strong>R$ 3.500,00</strong>,
      content: <p>Graph showing total</p>,
      fn: () => {}
    }
  ]

  return (
    <div className='card bg-base-100 border-base-300 shadow-sm'>
      <div className='menu w-full'>
        <div className="menu-title flex gap-2">
          <span>Resumo</span>
          <div className="flex justify-center gap-2">
            <button
              onClick={() => setSelected("mes")}
              className={`badge cursor-pointer px-4 py-2 ${
                selected === "mes"
                  ? "badge-accent text-accent-content"
                  : "badge-outline"
              }`}
            >
              Mês
            </button>

            <button
              onClick={() => setSelected("ano")}
              className={`badge cursor-pointer px-4 py-2 ${
                selected === "ano"
                  ? "badge-accent text-accent-content"
                  : "badge-outline"
              }`}
            >
              Ano
            </button>
          </div>
        </div>

        {
          menu_items.map((menu_item) => (
            <li key={menu_item.name}>
              <Modal 
                triggerContent={<div className='flex justify-between gap-4'>
                  <span>{menu_item.name.toUpperCase()}</span>{menu_item.value}
                </div>}
                modalTitle={<div className="flex items-center gap-2">{menu_item.name}</div>}
              >
                <p className="py-4">Adicionar lançamento</p>
              </Modal></li>
          ))
        }
      </div>
    </div>
  )
}
