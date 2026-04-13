import { formatTimestamp } from "@/lib/formatting";

type EntryMetadataProps = {
  createdAt: Date;
  source: string;
  updatedAt: Date;
};

export function EntryMetadata({
  createdAt,
  source,
  updatedAt,
}: EntryMetadataProps) {
  const showUpdated = createdAt.getTime() !== updatedAt.getTime();

  return (
    <dl className="grid gap-3 text-sm text-muted sm:grid-cols-3">
      <div className="rounded-2xl border border-border bg-slate-50/70 p-3">
        <dt className="font-medium text-foreground">Created</dt>
        <dd className="mt-1">{formatTimestamp(createdAt)}</dd>
      </div>
      <div className="rounded-2xl border border-border bg-slate-50/70 p-3">
        <dt className="font-medium text-foreground">Updated</dt>
        <dd className="mt-1">
          {showUpdated ? formatTimestamp(updatedAt) : "Not edited yet"}
        </dd>
      </div>
      <div className="rounded-2xl border border-border bg-slate-50/70 p-3">
        <dt className="font-medium text-foreground">Source</dt>
        <dd className="mt-1 capitalize">{source}</dd>
      </div>
    </dl>
  );
}
