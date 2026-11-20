-- Bewertungen: Bitte um Bewertung per E-Mail (nie doppelt) und Moderation durch den Admin
alter table bookings add column if not exists review_request_sent_at timestamptz;
alter table reviews add column if not exists hidden_reason text;
alter table reviews add column if not exists hidden_at timestamptz;
create index if not exists bookings_review_request_idx on bookings (ends_at) where review_request_sent_at is null and status in ('confirmed', 'completed');

-- Widerspruch gegen Bewertungsanfragen per E-Mail (§ 7 Abs. 3 UWG)
alter table customer_profiles add column if not exists review_mails_opt_out_at timestamptz;
