import type { JournalEntryRecord } from "@/lib/journal/service";
import { formatTimestamp } from "@/lib/formatting";
import { formatCaptureSource } from "@/lib/journal/capture-source";

type EntryMetadataProps = Pick<JournalEntryRecord, "createdAt" | "source" | "updatedAt">;

export function EntryMetadata({
  createdAt,
  source,
  updatedAt,
}: EntryMetadataProps) {
  const showUpdated = createdAt.getTime() !== updatedAt.getTime();

  return (
    <dl className="grid gap-2 text-sm text-muted sm:grid-cols-3">
      <div className="rounded-xl border border-border/80 bg-card/65 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
        <dt className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-accent-strong">
          Created
        </dt>
        <dd className="mt-1.5 font-medium text-foreground">
          {formatTimestamp(createdAt)}
        </dd>
      </div>
      <div className="rounded-xl border border-border/80 bg-card/65 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
        <dt className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-accent-strong">
          Updated
        </dt>
        <dd className="mt-1.5 font-medium text-foreground">
          {showUpdated ? formatTimestamp(updatedAt) : "Not edited yet"}
        </dd>
      </div>
      <div className="rounded-xl border border-border/80 bg-card/65 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
        <dt className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-accent-strong">
          Source
        </dt>
        <dd className="mt-1.5 font-medium text-foreground">
          {formatCaptureSource(source)}
        </dd>
      </div>
    </dl>
  );
}
