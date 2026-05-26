import { ReminderEntry } from "@/modules/reminders/types";
import { RowWithId } from "@/types/table";

const DAY_MS = 86_400_000;

function getUtcDateOnly(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

function getTodayUtc() {
  const now = new Date();

  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

function isSameUtcDay(left: Date, right: Date) {
  return left.getTime() === right.getTime();
}

function hasStarted(reminderDate: Date, today: Date) {
  return reminderDate.getTime() <= today.getTime();
}

function isMonthlyMatch(reminderDate: Date, today: Date) {
  return reminderDate.getUTCDate() === today.getUTCDate();
}

function isAnnualMatch(reminderDate: Date, today: Date) {
  return (
    reminderDate.getUTCMonth() === today.getUTCMonth() &&
    reminderDate.getUTCDate() === today.getUTCDate()
  );
}

function isWeeklyMatch(reminderDate: Date, today: Date) {
  const daysSinceReminder = Math.floor(
    (today.getTime() - reminderDate.getTime()) / DAY_MS,
  );

  return daysSinceReminder % 7 === 0;
}

export function isReminderDueToday(
  reminder: ReminderEntry,
  today = getTodayUtc(),
) {
  const reminderDate = getUtcDateOnly(reminder.date);

  if (!reminderDate || !hasStarted(reminderDate, today)) {
    return false;
  }

  switch (reminder.notification_frequency) {
    case "daily":
      return true;
    case "weekly":
      return isWeeklyMatch(reminderDate, today);
    case "monthly":
      return isMonthlyMatch(reminderDate, today);
    case "annual":
      return isAnnualMatch(reminderDate, today);
    default:
      return false;
  }
}

export function getDueReminders(
  reminders: RowWithId<ReminderEntry>[],
  today = getTodayUtc(),
) {
  return reminders.filter((reminder) => isReminderDueToday(reminder, today));
}

export function getReminderOccurrenceLabel(reminder: ReminderEntry) {
  const reminderDate = getUtcDateOnly(reminder.date);
  const today = getTodayUtc();

  if (!reminderDate) {
    return "Invalid date";
  }

  if (isSameUtcDay(reminderDate, today)) {
    return "Starts today";
  }

  return `Started ${new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(reminderDate)}`;
}
