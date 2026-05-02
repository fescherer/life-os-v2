export const FINANCE_FORMAT_LOCALE = "pt-BR";
export const FINANCE_CURRENCY_LOCALE = "pt-BR";
export const FINANCE_CURRENCY = "BRL";

export const financeShortDateFormat: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
};

export const financeFullDateFormat: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "long",
  year: "numeric",
};

export const financeInputDateFormat: Intl.DateTimeFormatOptions = {
  day: "2-digit",
  month: "short",
  year: "numeric",
};
