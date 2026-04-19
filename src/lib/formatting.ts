const timestampFormatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function formatTimestamp(date: Date) {
  return timestampFormatter.format(date);
}

export function excerptText(text: string, maxLength = 220) {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength).trimEnd()}...`;
}
