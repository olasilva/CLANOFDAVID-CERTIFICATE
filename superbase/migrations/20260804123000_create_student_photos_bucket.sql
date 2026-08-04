-- Create public storage bucket for student ID photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('student-photos', 'student-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anonymous uploads and reads for this project
CREATE POLICY IF NOT EXISTS "student_photos_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'student-photos');

CREATE POLICY IF NOT EXISTS "student_photos_public_insert"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'student-photos');
