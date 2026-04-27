import { Modal } from "@/components/modal";
import { Funnel } from "lucide-react";

export function FinanceAdvancedFilter() {
  const title = <>
    <Funnel size={20} />
    <span>Filtro Avançado</span>
  </>

  return (
    <>
      <Modal 
        triggerContent={<div className='btn btn-sm'>{title}</div>}
        modalTitle={<div className="flex items-center gap-2">{title}</div>}
      >
        <p className="py-4">Filtro Avançado</p>
      </Modal>
    </>
  )
}
