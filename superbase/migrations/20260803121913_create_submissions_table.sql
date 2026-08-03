/*
# Create student_submissions table

1. New Tables
- `student_submissions`
  - `id` (uuid, primary key)
  - `student_name` (text, not null) — full name of the student
  - `track` (text, not null) — Music Track, Regular Track, or Combined Track
  - `grade` (text) — grade/level the student completed
  - `course` (text) — course name (e.g. Piano)
  - `completion_date` (date) — date of completion
  - `coordinator` (text) — training coordinator name (optional)
  - `director` (text) — director name (optional)
  - `document_type` (text, not null) — certificate_of_merit, certificate_of_attendance, id_card, template
  - `status` (text, default 'pending') — pending, reviewed, generated
  - `serial_number` (text) — generated serial number once processed
  - `created_at` (timestamptz, default now()) — when the submission was received
  - `updated_at` (timestamptz, default now()) — last update timestamp

2. Security
- Enable RLS on `student_submissions`.
- Allow anon + authenticated CRUD because this is a no-auth app (students submit without logging in, admin views without logging in).
- All data is intentionally shared/public within this single-tenant app.
*/

CREATE TABLE IF NOT EXISTS student_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name text NOT NULL,
  track text NOT NULL DEFAULT 'Music Track',
  grade text,
  course text,
  completion_date date,
  coordinator text,
  director text,
  photo_url text,
  document_type text NOT NULL DEFAULT 'certificate_of_merit',
  status text NOT NULL DEFAULT 'pending',
  serial_number text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE student_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_submissions" ON student_submissions;
CREATE POLICY "anon_select_submissions" ON student_submissions FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_submissions" ON student_submissions;
CREATE POLICY "anon_insert_submissions" ON student_submissions FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_submissions" ON student_submissions;
CREATE POLICY "anon_update_submissions" ON student_submissions FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_submissions" ON student_submissions;
CREATE POLICY "anon_delete_submissions" ON student_submissions FOR DELETE
TO anon, authenticated USING (true);

-- Enable real-time on this table so the admin page gets live notifications
ALTER TABLE student_submissions REPLICA IDENTITY FULL;
