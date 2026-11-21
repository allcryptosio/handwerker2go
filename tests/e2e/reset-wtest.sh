#!/bin/sh
# Setzt die Testbuchung H2G-WTEST001 für widerruf.e2e.cjs zurück (nur Testdatenbank)
DB=${DB:-h2g_branchtest}
sudo -u postgres psql -d "$DB" -qAtc "begin; select set_config('app.role','system',true);
  delete from withdrawals where booking_id = 'cccccccc-0000-4000-8000-000000000001'; delete from email_outbox where subject like '%H2G-WTEST001%';
  update bookings set status='confirmed', refunded_cents=0, cancelled_at=null, cancel_reason=null where id='cccccccc-0000-4000-8000-000000000001'; commit;"
