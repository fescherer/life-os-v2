export const REMINDER_FREQUENCIES = [
  "annual",
  "monthly",
  "weekly",
  "daily",
] as const;

export type ReminderFrequency = (typeof REMINDER_FREQUENCIES)[number];

export type ReminderEntry = {
  date: string;
  description: string;
  reminder_type: number;
  notification_frequency: ReminderFrequency;
};
