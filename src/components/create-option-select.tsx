'use client'

import {
  isTopOverlay,
  lockBodyScroll,
  pushOverlay,
  removeOverlay,
  unlockBodyScroll,
} from '@/lib/overlay'
import { slugify } from '@/lib/util'
import { ChevronDown, Loader2, Plus, Trash2, X } from 'lucide-react'
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

export type SelectOption = {
  label: string
  value: string
  eyebrow?: string
  description?: string
}

type CreateOptionSelectProps<TOption extends SelectOption> = {
  label: string
  value: string
  options: TOption[]
  onChange: (value: string) => void
  onCreate?: (option: SelectOption) => Promise<TOption | void> | TOption | void
  onDeleteOption?: (option: TOption) => Promise<boolean | void> | boolean | void
  onCreateRequest?: (search: string) => void
  createActionLabel?: string
  placeholder?: string
}

function getOptionKey(option: SelectOption, index: number) {
  if ('id' in option && typeof option.id === 'number') {
    return `option-${option.id}`
  }

  return `${option.value}-${index}`
}

export function CreateOptionSelect<TOption extends SelectOption = SelectOption>({
  label,
  value,
  options,
  onChange,
  onCreate,
  onDeleteOption,
  onCreateRequest,
  createActionLabel,
  placeholder,
}: CreateOptionSelectProps<TOption>) {
  const overlayId = `create-option-select-${useId().replace(/:/g, '')}`
  const [search, setSearch] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [deletingValue, setDeletingValue] = useState<string | null>(null)
  const [layerIndex, setLayerIndex] = useState(0)
  const panelRef = useRef<HTMLDivElement | null>(null)

  const trimmedSearch = search.trim()
  const selectedLabel = options.find((option) => option.value === value)?.label
  const filteredOptions = useMemo(() => {
    const query = search.toLowerCase()

    return options.filter((option) => option.label.toLowerCase().includes(query))
  }, [options, search])

  const canCreate = Boolean(onCreate || onCreateRequest)
  const createButtonLabel =
    createActionLabel ||
    (trimmedSearch ? `Criar "${trimmedSearch}"` : 'Criar novo item')

  function closePicker() {
    setIsOpen(false)
  }

  function openPicker() {
    setIsOpen(true)
  }

  function selectOption(nextValue: string) {
    onChange(nextValue)
    setSearch('')
    closePicker()
  }

  async function handleDelete(option: TOption) {
    if (!onDeleteOption) return

    setDeletingValue(option.value)

    try {
      const wasDeleted = await onDeleteOption(option)

      if (wasDeleted !== false && option.value === value) {
        onChange('')
      }
    } finally {
      setDeletingValue(null)
    }
  }

  async function handleCreate() {
    if (onCreateRequest) {
      onCreateRequest(trimmedSearch)
      setSearch('')
      closePicker()
      return
    }

    if (!trimmedSearch || !onCreate) return

    const option = {
      label: trimmedSearch,
      value: slugify(trimmedSearch),
    }
    const createdOption = await onCreate(option)

    onChange(createdOption?.value ?? option.value)
    setSearch('')
    closePicker()
  }

  useEffect(() => {
    if (!isOpen) return

    setLayerIndex(pushOverlay(overlayId))

    function handlePointerDown(event: MouseEvent) {
      if (
        isTopOverlay(overlayId) &&
        !panelRef.current?.contains(event.target as Node)
      ) {
        closePicker()
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape' && isTopOverlay(overlayId)) {
        event.preventDefault()
        event.stopPropagation()
        closePicker()
      }
    }

    lockBodyScroll()
    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleEscape, true)

    return () => {
      removeOverlay(overlayId)
      unlockBodyScroll()
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape, true)
    }
  }, [isOpen, overlayId])

  useEffect(() => {
    if (value && !options.some((option) => option.value === value)) {
      onChange('')
    }
  }, [onChange, options, value])

  const picker = (
    <div
      className="fixed inset-0 bg-black/30 p-3 sm:flex sm:items-center sm:justify-center sm:p-6"
      style={{ zIndex: 1000 + layerIndex * 20 }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && isTopOverlay(overlayId)) {
          closePicker()
        }
      }}
    >
      <div
        ref={panelRef}
        className="bg-base-100 fixed right-0 bottom-0 left-0 flex h-[70vh] max-h-[85vh] flex-col rounded-t-3xl p-4 shadow-2xl sm:static sm:h-128 sm:w-full sm:max-w-md sm:rounded-3xl"
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-base font-semibold">{label}</p>
            <p className="text-base-content/70 text-sm">
              Escolha uma opção ou crie uma nova
            </p>
          </div>

          <button
            type="button"
            className="btn btn-ghost btn-sm btn-circle"
            onClick={closePicker}
            aria-label={`Fechar ${label}`}
          >
            <X size={18} />
          </button>
        </div>

        <input
          autoFocus
          className="input input-bordered mb-3 w-full"
          placeholder="Digite para buscar ou criar..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              void handleCreate()
            }
          }}
        />

        <div className="min-h-0 flex-1 overflow-y-auto pb-2">
          {filteredOptions.map((option, index) => {
            const isDeleting = deletingValue === option.value

            return (
              <div
                key={getOptionKey(option, index)}
                className="hover:bg-base-200 flex items-center gap-2 rounded-2xl px-2 py-1 transition-colors"
              >
                <button
                  type="button"
                  className="flex min-w-0 flex-1 items-center justify-between rounded-2xl px-2 py-2 text-left"
                  onClick={() => selectOption(option.value)}
                >
                  <div className="min-w-0">
                    {option.eyebrow && (
                      <p className="text-base-content/60 truncate text-xs tracking-wide uppercase">
                        {option.eyebrow}
                      </p>
                    )}
                    <p className="truncate">{option.label}</p>
                    {option.description && (
                      <p className="text-base-content/60 truncate text-xs">
                        {option.description}
                      </p>
                    )}
                  </div>

                  {option.value === value && (
                    <span className="text-sm font-medium">Selecionado</span>
                  )}
                </button>

                {onDeleteOption && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm btn-circle text-error"
                    onClick={(event) => {
                      event.preventDefault()
                      event.stopPropagation()
                      void handleDelete(option)
                    }}
                    disabled={isDeleting}
                    aria-label={`Excluir ${option.label}`}
                    title={`Excluir ${option.label}`}
                  >
                    {isDeleting ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                )}
              </div>
            )
          })}

          {canCreate && (
            <button
              type="button"
              className="btn btn-primary mt-3 w-full justify-start"
              onClick={() => void handleCreate()}
              disabled={!trimmedSearch && !onCreateRequest}
            >
              <Plus size={16} />
              {createButtonLabel}
            </button>
          )}

          {!filteredOptions.length && !trimmedSearch && (
            <p className="text-base-content/70 px-4 py-6 text-sm">
              Nenhuma opção encontrada.
            </p>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="form-control w-full">
      <label className="label">
        <span className="label-text">{label}</span>
      </label>

      <button
        type="button"
        className="input input-bordered bg-base-100 flex w-full items-center justify-between font-normal"
        onClick={openPicker}
      >
        <span className="truncate">{selectedLabel || placeholder || 'Selecionar'}</span>
        <ChevronDown size={16} className="shrink-0 opacity-60" aria-hidden="true" />
      </button>

      {isOpen && createPortal(picker, document.body)}
    </div>
  )
}
