import { X } from "lucide-react";

type ModalProps = {
  triggerContent?: React.ReactNode;
  modalTitle?: React.ReactNode;
  modalActionsTitle?: string;
  modalActionOnSave?: () => void;
  children?: React.ReactNode;
}

export function Modal({triggerContent, modalTitle, children, modalActionsTitle, modalActionOnSave}: ModalProps) {
  const modalId = crypto.randomUUID();

  return (
    <>
      <label htmlFor={modalId}>
        {triggerContent || (<span>Abrir Modal</span>)}
      </label>

      <input type="checkbox" id={modalId} className="modal-toggle" />
      <div className="modal">
        <label htmlFor={modalId} className="modal-backdrop" />
        <div className="modal-box">
          <div className="border-base-300 border-b pb-2">
            <h3 className="text-lg font-bold">{modalTitle}</h3>
            <label htmlFor={modalId} className="btn btn-sm btn-circle btn-ghost absolute top-2 right-2"><X /></label>
          </div>
          {children}
    
          { modalActionsTitle &&
          <div className="modal-action">
            <label htmlFor={modalId} className="btn">Fechar</label>
            <button className="btn btn-primary" onClick={modalActionOnSave}>{modalActionsTitle}</button>
          </div>
          }
        </div>
      </div>
    </>
  )
}
