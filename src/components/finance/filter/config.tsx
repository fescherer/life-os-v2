import { Modal } from "@/components/modal";
import { Settings } from "lucide-react";

export function FinanceConfig() {
  const title = <>
    <Settings size={20} />
    <span>Configurações</span>
  </>

  return (
    <>
      <Modal 
        triggerContent={<div className='btn btn-sm'>{title}</div>}
        modalTitle={<div className="flex items-center gap-2">{title}</div>}
      >
        <p className="py-4">Configurações</p>
      </Modal>
    </>
  )
}
