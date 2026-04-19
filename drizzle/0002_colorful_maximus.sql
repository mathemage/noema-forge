CREATE INDEX "journal_entries_body_search_idx" ON "journal_entries" USING gin (to_tsvector('simple', "body"));
