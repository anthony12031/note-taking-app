function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function formatRelativeDate(dateString: string): string {
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return "";

  const today = startOfDay(new Date());
  const target = startOfDay(d);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (isSameDay(target, today)) return "today";
  if (isSameDay(target, yesterday)) return "yesterday";

  return d.toLocaleDateString("en-US", { month: "long", day: "numeric" });
}

export function formatLastEdited(dateString: string): string {
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return "";

  const datePart = d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  let hours = d.getHours();
  const minutes = d.getMinutes();
  const ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  if (hours === 0) hours = 12;
  const minStr = minutes.toString().padStart(2, "0");
  const timePart = `${hours}:${minStr}${ampm}`;

  return `Last Edited: ${datePart} at ${timePart}`;
}
