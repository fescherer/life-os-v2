'use client'

import { CreateOptionSelect } from '@/components/create-option-select'
import { Modal } from '@/components/modal'
import { Layers3 } from 'lucide-react'
import { useState } from 'react'

const categoryOptions = [
  { label: 'Alimentacao', value: 'alimentacao' },
  { label: 'Passeio', value: 'passeio' },
  { label: 'Presente', value: 'presente' },
  { label: 'Salario', value: 'salario' },
]

export function ModalStackDemo() {
  const [category, setCategory] = useState('')

  return (
    <section className="bg-base-100 border-base-300 w-full max-w-2xl rounded-3xl border p-6 shadow-sm">
      <div className="mb-6 flex items-start gap-4">
        <div className="bg-base-200 rounded-2xl p-3">
          <Layers3 size={22} />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">Stacked modal example</h2>
          <p className="text-base-content/70 max-w-xl text-sm leading-6">
            Open the first modal, then open a second one from inside it. The
            inner modal also contains the picker so you can test stacking,
            backdrop clicks, and Escape behavior together.
          </p>
        </div>
      </div>

      <Modal
        triggerContent={<div className="btn btn-primary">Open first modal</div>}
        modalTitle={<span>First modal</span>}
      >
        <div className="space-y-4 py-4">
          <p className="text-base-content/80">
            This is the first layer. From here you can open another modal on
            top of it.
          </p>

          <Modal
            triggerContent={<div className="btn btn-outline">Open second modal</div>}
            modalTitle={<span>Second modal</span>}
          >
            <div className="space-y-4 py-4">
              <p className="text-base-content/80">
                This second layer includes the custom picker. Selecting an item
                should only close the picker, not this modal or the one behind
                it.
              </p>

              <CreateOptionSelect
                label="Categoria"
                value={category}
                options={categoryOptions}
                onChange={setCategory}
                onCreate={(option) => {
                  setCategory(option.value)
                }}
                placeholder="Selecionar categoria"
              />

              <div className="bg-base-200 rounded-2xl px-4 py-3 text-sm">
                Selected value: {category || 'none'}
              </div>
            </div>
          </Modal>
        </div>
      </Modal>
    </section>
  )
}
