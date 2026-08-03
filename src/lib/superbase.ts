import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabaseUrl.trim() && supabaseAnonKey && supabaseAnonKey.trim()
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: { persistSession: false },
    })
  : null;

export type DocumentType = 'certificate_of_merit' | 'certificate_of_attendance' | 'id_card' | 'template';

export type SubmissionStatus = 'pending' | 'reviewed' | 'generated';

export interface StudentSubmission {
  id: string;
  student_name: string;
  track: string;
  grade: string | null;
  course: string | null;
  completion_date: string | null;
  coordinator: string | null;
  director: string | null;
  photo_url?: string | null;
  document_type: DocumentType;
  status: SubmissionStatus;
  serial_number: string | null;
  created_at: string;
  updated_at: string;
}

export const TRACKS = ['Music Track', 'Regular Track', 'Combined Track'] as const;
export const DOCUMENT_TYPES: { value: DocumentType; label: string }[] = [
  { value: 'certificate_of_merit', label: 'Certificate of Merit' },
  { value: 'certificate_of_attendance', label: 'Certificate of Attendance' },
  { value: 'id_card', label: 'ID Card' },
  { value: 'template', label: 'Template' },
];
