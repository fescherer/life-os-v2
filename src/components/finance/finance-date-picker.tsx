"use client";

import {
  FINANCE_FORMAT_LOCALE,
  financeFullDateFormat,
  financeInputDateFormat,
} from "@/lib/finance-format";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

type FinanceDatePickerProps = {
  disabled?: boolean;
  onChange: (value: string) => void;
  value: string;
};

function parseDateValue(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);

  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day);
}

function formatDateValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDisplayDate(date: Date, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat(FINANCE_FORMAT_LOCALE, options).format(date);
}

function isSameDay(left: Date | null, right: Date) {
  return (
    left?.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function getCalendarDays(viewDate: Date) {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startDate = new Date(year, month, 1 - firstDay.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(startDate);

    date.setDate(startDate.getDate() + index);

    return date;
  });
}

function getPopoverPosition(trigger: HTMLElement) {
  const rect = trigger.getBoundingClientRect();
  const gap = 8;
  const width = Math.min(320, window.innerWidth - 32);
  const estimatedHeight = 348;
  const left = Math.min(Math.max(16, rect.left), window.innerWidth - width - 16);
  const hasRoomBelow = rect.bottom + gap + estimatedHeight <= window.innerHeight;
  const top = hasRoomBelow
    ? rect.bottom + gap
    : Math.max(16, rect.top - estimatedHeight - gap);

  return {
    left,
    top,
    width,
  };
}

export function FinanceDatePicker({
  disabled = false,
  onChange,
  value,
}: FinanceDatePickerProps) {
  const selectedDate = parseDateValue(value);
  const [isOpen, setIsOpen] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState({
    left: 0,
    top: 0,
    width: 320,
  });
  const [viewDate, setViewDate] = useState(selectedDate ?? new Date());
  const pickerRef = useRef<HTMLDivElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  const calendarDays = useMemo(() => getCalendarDays(viewDate), [viewDate]);
  const weekdayLabels = useMemo(() => {
    const sunday = new Date(2026, 0, 4);

    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(sunday);

      date.setDate(sunday.getDate() + index);

      return new Intl.DateTimeFormat(FINANCE_FORMAT_LOCALE, {
        weekday: "short",
      }).format(date);
    });
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    function handleMouseDown(event: MouseEvent) {
      const target = event.target as Node;

      if (
        !pickerRef.current?.contains(target) &&
        !popoverRef.current?.contains(target)
      ) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    function updatePopoverPosition() {
      if (!pickerRef.current) return;

      setPopoverPosition(getPopoverPosition(pickerRef.current));
    }

    window.addEventListener("resize", updatePopoverPosition);
    window.addEventListener("scroll", updatePopoverPosition, true);

    return () => {
      window.removeEventListener("resize", updatePopoverPosition);
      window.removeEventListener("scroll", updatePopoverPosition, true);
    };
  }, [isOpen]);

  function selectDate(date: Date) {
    onChange(formatDateValue(date));
    setViewDate(date);
    setIsOpen(false);
  }

  function moveMonth(monthOffset: number) {
    setViewDate(
      (current) => new Date(current.getFullYear(), current.getMonth() + monthOffset, 1)
    );
  }

  function togglePicker() {
    if (!isOpen && selectedDate) {
      setViewDate(selectedDate);
    }

    if (!isOpen && pickerRef.current) {
      setPopoverPosition(getPopoverPosition(pickerRef.current));
    }

    setIsOpen((current) => !current);
  }

  return (
    <div ref={pickerRef} className="relative">
      <button
        type="button"
        className="input input-bordered bg-base-100 flex w-full items-center justify-between text-left font-normal"
        disabled={disabled}
        onClick={togglePicker}
      >
        <span className={selectedDate ? "" : "text-base-content/50"}>
          {selectedDate
            ? formatDisplayDate(selectedDate, financeInputDateFormat)
            : "Selecionar data"}
        </span>
        <CalendarDays size={18} className="shrink-0 opacity-60" />
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={popoverRef}
            className="card border-base-300 bg-base-100 fixed z-1200 border p-3 shadow-2xl"
            style={{
              left: popoverPosition.left,
              top: popoverPosition.top,
              width: popoverPosition.width,
            }}
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <button
                type="button"
                className="btn btn-ghost btn-sm btn-circle"
                onClick={() => moveMonth(-1)}
                aria-label="Mes anterior"
              >
                <ChevronLeft size={18} />
              </button>

              <div className="text-center">
                <p className="font-semibold capitalize">
                  {formatDisplayDate(viewDate, {
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                {selectedDate && (
                  <p className="text-base-content/60 text-xs">
                    {formatDisplayDate(selectedDate, financeFullDateFormat)}
                  </p>
                )}
              </div>

              <button
                type="button"
                className="btn btn-ghost btn-sm btn-circle"
                onClick={() => moveMonth(1)}
                aria-label="Proximo mes"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1">
              {weekdayLabels.map((label) => (
                <div
                  key={label}
                  className="text-base-content/60 flex h-8 items-center justify-center text-xs font-medium capitalize"
                >
                  {label}
                </div>
              ))}

              {calendarDays.map((date) => {
                const isCurrentMonth = date.getMonth() === viewDate.getMonth();
                const isSelected = isSameDay(selectedDate, date);
                const isToday = isSameDay(new Date(), date);

                return (
                  <button
                    key={formatDateValue(date)}
                    type="button"
                    className={`btn btn-sm h-9 min-h-9 rounded-lg border-0 px-0 ${
                      isSelected
                        ? "btn-primary"
                        : isToday
                          ? "btn-outline"
                          : "btn-ghost"
                    } ${isCurrentMonth ? "" : "text-base-content/35"}`}
                    title={formatDisplayDate(date, financeFullDateFormat)}
                    onClick={() => selectDate(date)}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>

            <div className="mt-3 flex justify-between gap-2">
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  onChange("");
                  setIsOpen(false);
                }}
              >
                Limpar
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => selectDate(new Date())}
              >
                Hoje
              </button>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
