'use client'
import { useState } from 'react';

export function SummaryFinance() {
  const [selected, setSelected] = useState("mes");

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
        <li><label htmlFor="my-modal"  className='flex justify-between gap-4'><span>INCOME</span><strong>R$ 12.000,00</strong></label></li>
        <li><label htmlFor="my-modal" className='flex justify-between gap-4'><span>EXPENSES</span><strong>R$ 8.500,00</strong></label></li>
        <li><label htmlFor="my-modal" className='flex justify-between gap-4'><span>TOTAL</span><strong>R$ 3.500,00</strong></label></li>

        <input type="checkbox" id="my-modal" className="modal-toggle" />
        <div className="modal">
          <label htmlFor="my-modal" className="modal-backdrop" />
          <div className="modal-box">
            <h3 className="text-lg font-bold">Hello!</h3>
            <p className="py-4">This is a simple DaisyUI modal.</p>
    
            <div className="modal-action">
              <label htmlFor="my-modal" className="btn">Close</label>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
