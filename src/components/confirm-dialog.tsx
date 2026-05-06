'use client'

import {
  isTopOverlay,
  lockBodyScroll,
  pushOverlay,
  removeOverlay,
  unlockBodyScroll,
} from '@/lib/overlay'
import { X } from 'lucide-react'
import { useEffect, useId } from 'react'
import { createPortal } from 'react-dom'

type ConfirmDialogProps = {
  cancelLabel?: string | null
  children?: React.ReactNode
  confirmLabel: string
  confirmDisabled?: boolean
  confirmVariant?: 'danger' | 'primary'
  isOpen: boolean
  isSubmitting?: boolean
  onClose: () => void
  onConfirm?: () => void
  title: React.ReactNode
}

export function ConfirmDialog({
  cancelLabel = 'Cancelar',
  children,
  confirmLabel,
  confirmDisabled = false,
  confirmVariant = 'primary',
  isOpen,
  isSubmitting = false,
  onClose,
  onConfirm,
  title,
}: ConfirmDialogProps) {
  const reactId = useId()
  const cleanId = reactId.replace(/:/g, '')
  const titleId = `confirm-dialog-title-${cleanId}`
  const overlayId = `confirm-dialog-${cleanId}`

  useEffect(() => {
    if (!isOpen) return

    pushOverlay(overlayId)
    lockBodyScroll()

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape' && isTopOverlay(overlayId) && !isSubmitting) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)

    return () => {
      removeOverlay(overlayId)
      unlockBodyScroll()
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, isSubmitting, onClose, overlayId])

  if (!isOpen) return null

  return createPortal(
    <div
      className="fixed inset-0 bg-black/30 p-2 sm:flex sm:items-center sm:justify-center sm:p-4"
      style={{ zIndex: 1100 }}
      onMouseDown={(event) => {
        event.stopPropagation()

        if (
          event.target === event.currentTarget &&
          isTopOverlay(overlayId) &&
          !isSubmitting
        ) {
          onClose()
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="bg-base-100 fixed right-0 bottom-0 left-0 flex max-h-[92vh] flex-col rounded-t-3xl shadow-2xl sm:static sm:w-full sm:max-w-md sm:rounded-3xl"
      >
        <div className="border-base-300 relative border-b px-4 pt-4 pb-3 sm:px-5">
          <h3 id={titleId} className="pr-12 text-base font-bold sm:text-lg">
            {title}
          </h3>
          <button
            type="button"
            className="btn btn-sm btn-circle btn-ghost absolute top-3 right-3"
            onClick={onClose}
            aria-label="Fechar modal"
            disabled={isSubmitting}
          >
            <X />
          </button>
        </div>

        <div className="px-4 py-4 sm:px-5">{children}</div>

        <div className="border-base-300 flex gap-3 border-t px-4 py-3 sm:px-5">
          {cancelLabel && (
            <button
              type="button"
              className="btn flex-1"
              onClick={onClose}
              disabled={isSubmitting}
            >
              {cancelLabel}
            </button>
          )}
          <button
            type="button"
            className={`btn ${cancelLabel ? 'flex-1' : 'w-full'} ${
              confirmVariant === 'danger' ? 'btn-error' : 'btn-primary'
            }`}
            onClick={onConfirm}
            disabled={isSubmitting || confirmDisabled}
          >
            {isSubmitting ? 'Carregando...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
