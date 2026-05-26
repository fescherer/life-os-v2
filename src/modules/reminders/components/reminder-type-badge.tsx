import { SelectOption } from "@/types/select-option";

function getReminderTypeOption(
  reminderType: number,
  selectOptions: SelectOption[],
) {
  return selectOptions.find(
    (option) =>
      option.select_identifier === "reminder_type" &&
      option.id === reminderType,
  );
}

function getBadgeTextColor(color: string) {
  const hex = color.replace("#", "");

  if (hex.length !== 6) {
    return "currentColor";
  }

  const red = parseInt(hex.slice(0, 2), 16);
  const green = parseInt(hex.slice(2, 4), 16);
  const blue = parseInt(hex.slice(4, 6), 16);
  const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;

  return luminance > 0.6 ? "#18181b" : "#fafafa";
}

export function ReminderTypeBadge({
  reminderType,
  selectOptions,
}: {
  reminderType: number;
  selectOptions: SelectOption[];
}) {
  const option = getReminderTypeOption(reminderType, selectOptions);

  if (!option) {
    return null;
  }

  return (
    <span
      className="inline-flex h-6 max-w-full items-center rounded-4xl px-2.5 text-xs font-medium"
      style={{
        backgroundColor: option.color,
        color: getBadgeTextColor(option.color),
      }}
    >
      <span className="truncate">{option.value}</span>
    </span>
  );
}
