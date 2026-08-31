/**
 * Fills the structured reflection columns of v1 entries by parsing the text
 * `composeJournalEntryBody()` produced.
 *
 * Dry run by default. It never writes `body`, `source`, or either timestamp,
 * and it leaves every entry it cannot parse exactly as a raw capture.
 *
 *   npm run db:backfill-reflections            # print the plan
 *   npm run db:backfill-reflections -- --apply # write it
 *
 * The plan is newline-delimited JSON on stdout and the summary is on stderr,
 * so a run against a copy of production can be diffed before it is trusted,
 * and a second run after `--apply` prints an identical plan.
 */
import { config as loadEnv } from "dotenv";
import postgres from "postgres";
import { parseJournalEntryBody } from "../src/lib/journal/reflection.ts";

// `quiet` keeps dotenv's banner out of the plan on stdout.
loadEnv({ path: ".env.local", override: false, quiet: true });
loadEnv({ path: ".env", override: false, quiet: true });

type StoredEntry = {
  assistance_source: string | null;
  body: string;
  feeling: string | null;
  follow_up_question: string | null;
  id: string;
  next_step: string | null;
  raw_body: string;
  root_issue: string | null;
  suggestions: string[];
};

type ReflectionColumns = {
  assistance_source: string | null;
  feeling: string | null;
  follow_up_question: string | null;
  next_step: string | null;
  raw_body: string;
  root_issue: string | null;
  suggestions: string[];
};

const connectionString =
  process.env.DATABASE_URL_NON_POOLING ?? process.env.DATABASE_URL;

if (!connectionString) {
  console.error("Set DATABASE_URL before running the reflection backfill.");
  process.exit(1);
}

const apply = process.argv.includes("--apply");
const sql = postgres(connectionString, { max: 1, prepare: false });

function columnsFor(entry: StoredEntry): ReflectionColumns | null {
  const reflection = parseJournalEntryBody(entry.body);

  if (!reflection) {
    return null;
  }

  return {
    assistance_source: reflection.assistanceSource ?? null,
    feeling: reflection.feeling ?? null,
    follow_up_question: reflection.followUpQuestion ?? null,
    next_step: reflection.nextStep ?? null,
    raw_body: reflection.body,
    root_issue: reflection.rootIssue ?? null,
    suggestions: reflection.suggestions ?? [],
  };
}

function sameSuggestions(a: string[], b: string[]) {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

function alreadyStored(entry: StoredEntry, columns: ReflectionColumns) {
  return (
    entry.assistance_source === columns.assistance_source &&
    entry.feeling === columns.feeling &&
    entry.follow_up_question === columns.follow_up_question &&
    entry.next_step === columns.next_step &&
    entry.raw_body === columns.raw_body &&
    entry.root_issue === columns.root_issue &&
    sameSuggestions(entry.suggestions, columns.suggestions)
  );
}

const entries = await sql<StoredEntry[]>`
  SELECT assistance_source, body, feeling, follow_up_question, id, next_step,
         raw_body, root_issue, suggestions
  FROM journal_entries
  ORDER BY created_at, id
`;

let rawCaptures = 0;
let pending = 0;
let settled = 0;

for (const entry of entries) {
  const columns = columnsFor(entry);

  if (!columns) {
    rawCaptures += 1;
    process.stdout.write(`${JSON.stringify({ action: "raw-capture", id: entry.id })}\n`);
    continue;
  }

  if (alreadyStored(entry, columns)) {
    settled += 1;
    process.stdout.write(`${JSON.stringify({ action: "settled", id: entry.id })}\n`);
    continue;
  }

  pending += 1;
  process.stdout.write(
    `${JSON.stringify({ action: "reflection", id: entry.id, ...columns })}\n`,
  );

  if (apply) {
    await sql`
      UPDATE journal_entries
      SET assistance_source = ${columns.assistance_source}::assistance_source,
          feeling = ${columns.feeling},
          follow_up_question = ${columns.follow_up_question},
          next_step = ${columns.next_step},
          raw_body = ${columns.raw_body},
          root_issue = ${columns.root_issue},
          suggestions = ${columns.suggestions}::text[]
      WHERE id = ${entry.id}
    `;
  }
}

console.error(
  [
    `entries: ${entries.length}`,
    `reflections ${apply ? "written" : "to write"}: ${pending}`,
    `reflections already stored: ${settled}`,
    `kept as raw captures: ${rawCaptures}`,
    apply ? "applied" : "dry run, pass --apply to write",
  ].join("\n"),
);

await sql.end();
