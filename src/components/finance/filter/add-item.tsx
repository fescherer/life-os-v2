import { Modal } from "@/components/modal";
import { DiamondPlus } from "lucide-react";

export function FinanceAddItem() {
  const title = <>
    <DiamondPlus size={20} />
    <span>Adicionar Lançamento</span>
  </>

  return (
    <>
      <Modal 
        triggerContent={<div className='btn btn-sm'>{title}</div>}
        modalTitle={<div className="flex items-center gap-2">{title}</div>}
      >
        <p className="py-4">Adicionar lançamento</p>
      </Modal>
    </>
  )
}
