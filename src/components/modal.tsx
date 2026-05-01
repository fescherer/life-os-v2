'use client'

import {
  isTopOverlay,
  lockBodyScroll,
  pushOverlay,
  removeOverlay,
  unlockBodyScroll,
} from '@/lib/overlay'
import { X } from 'lucide-react'
import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

type ModalProps = {
  children?: React.ReactNode
  isLocked?: boolean
  modalActionOnSave?: () => Promise<boolean | void> | boolean | void
  modalActionsTitle?: string
  triggerContent?: React.ReactNode
  modalTitle?: React.ReactNode
  onOpenChange?: (isOpen: boolean) => void
  open?: boolean
}

export function Modal({
  children,
  isLocked = false,
  modalActionOnSave,
  modalActionsTitle,
  triggerContent,
  modalTitle,
  onOpenChange,
  open,
}: ModalProps) {
  const reactId = useId()
  const cleanId = reactId.replace(/:/g, '')
  const titleId = `modal-title-${cleanId}`
  const overlayId = `modal-${cleanId}`
  const [internalIsOpen, setInternalIsOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const isControlled = typeof open === 'boolean'
  const isOpen = isControlled ? open : internalIsOpen
  const isBusy = isLocked || isSaving

  const setOpenState = useCallback((nextIsOpen: boolean) => {
    if (!isControlled) {
      setInternalIsOpen(nextIsOpen)
    }

    onOpenChange?.(nextIsOpen)
  }, [isControlled, onOpenChange])

  const openModal = useCallback(() => {
    if (isBusy) return

    setOpenState(true)
  }, [isBusy, setOpenState])

  const closeModal = useCallback(() => {
    if (isBusy) return

    setOpenState(false)
  }, [isBusy, setOpenState])

  async function handleModalAction() {
    setIsSaving(true)

    try {
      const shouldClose = await modalActionOnSave?.()

      if (shouldClose !== false) {
        setOpenState(false)
      }
    } finally {
      setIsSaving(false)
    }
  }

  useEffect(() => {
    if (!isOpen) return

    pushOverlay(overlayId)
    lockBodyScroll()

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape' && isTopOverlay(overlayId) && !isBusy) {
        closeModal()
      }
    }

    document.addEventListener('keydown', handleEscape)

    return () => {
      removeOverlay(overlayId)
      unlockBodyScroll()
      document.removeEventListener('keydown', handleEscape)
    }
  }, [closeModal, isBusy, isOpen, overlayId])

  return (
    <>
      <span
        role="button"
        tabIndex={0}
        onClick={openModal}
        onKeyDown={(event) => {
          if (isBusy) return

          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            openModal()
          }
        }}
      >
        {triggerContent || <span>Open Modal</span>}
      </span>

      {isOpen &&
        createPortal(
          <div
            className="fixed inset-0 bg-black/30 p-2 sm:flex sm:items-center sm:justify-center sm:p-4"
            style={{ zIndex: 900 }}
            onMouseDown={(event) => {
              if (
                event.target === event.currentTarget &&
                isTopOverlay(overlayId) &&
                !isBusy
              ) {
                closeModal()
              }
            }}
          >
            <div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              className="bg-base-100 fixed right-0 bottom-0 left-0 flex max-h-[92vh] flex-col rounded-t-3xl shadow-2xl sm:static sm:max-h-[min(40rem,92vh)] sm:w-full sm:max-w-xl sm:rounded-3xl"
            >
              <div className="border-base-300 relative border-b px-4 pt-4 pb-3 sm:px-5">
                <h3 id={titleId} className="pr-12 text-base font-bold sm:text-lg">
                  {modalTitle}
                </h3>
                <button
                  type="button"
                  className="btn btn-sm btn-circle btn-ghost absolute top-3 right-3"
                  onClick={closeModal}
                  aria-label="Close modal"
                  disabled={isBusy}
                >
                  <X />
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-4 sm:px-5">
                {children}
              </div>

              {modalActionsTitle && (
                <div className="modal-action border-base-300 m-0 border-t px-4 py-3 sm:px-5">
                  <button
                    type="button"
                    className="btn"
                    onClick={closeModal}
                    disabled={isBusy}
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => void handleModalAction()}
                    disabled={isBusy}
                  >
                    {isSaving ? 'Saving...' : modalActionsTitle}
                  </button>
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  )
}
