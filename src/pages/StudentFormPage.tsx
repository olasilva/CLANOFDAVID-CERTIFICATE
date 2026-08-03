import { useState, type FormEvent } from 'react';
import { supabase, type DocumentType } from '@/lib/supabase';
import schoolLogo from '../../img/IMG-20260531-WA0013 - Copy.jpg';
import { CheckCircle, Send, Loader2, AlertCircle, GraduationCap, ArrowLeft } from 'lucide-react';

const TRACKS = ['Music Track', 'Regular Track', 'Combined Track'] as const;
const DOCUMENT_TYPES: { value: DocumentType; label: string; description: string }[] = [
  { value: 'certificate_of_merit', label: 'Certificate of Merit', description: 'Awarded for successfully completing a track' },
  { value: 'certificate_of_attendance', label: 'Certificate of Attendance', description: 'Issued for attending a program' },
  { value: 'id_card', label: 'ID Card', description: 'Student identification card' },
  { value: 'template', label: 'Template', description: 'Custom certificate of achievement' },
];

export default function StudentFormPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    student_name: '',
    track: 'Music Track' as string,
    grade: '',
    course: '',
    completion_date: '',
    coordinator: '',
    director: '',
    photo_url: '',
    document_type: 'certificate_of_merit' as DocumentType,
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      setForm((prev) => ({ ...prev, photo_url: result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.student_name.trim()) {
      setError('Please enter the student name.');
      return;
    }
    if (!supabase) {
      setError('Supabase is not configured. Add the VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY values to continue.');
      return;
    }
    setSubmitting(true);
    setError(null);

    const { error: insertError } = await supabase.from('student_submissions').insert({
      student_name: form.student_name.trim(),
      track: form.track,
      grade: form.grade.trim() || null,
      course: form.course.trim() || null,
      completion_date: form.completion_date || null,
      coordinator: form.coordinator.trim() || null,
      director: form.director.trim() || null,
      photo_url: form.photo_url || null,
      document_type: form.document_type,
      status: 'pending',
    });

    setSubmitting(false);

    if (insertError) {
      setError('Something went wrong submitting the form. Please try again.');
      return;
    }

    setSuccess(true);
    setForm({
      student_name: '',
      track: 'Music Track',
      grade: '',
      course: '',
      completion_date: '',
      coordinator: '',
      director: '',
      photo_url: '',
      document_type: 'certificate_of_merit',
    });
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Submission Received!</h2>
          <p className="text-gray-600 mb-6">
            Your form has been submitted successfully. The training coordinator will review it and generate your document shortly.
          </p>
          <button
            onClick={() => setSuccess(false)}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Submit Another Form
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
          <div className="flex items-center gap-3">
            <img src={schoolLogo} alt="Clan of David logo" className="w-10 h-10 object-cover rounded-full border border-gray-200 bg-white" />
            <div>
              <div className="text-[10px] uppercase tracking-[0.24em] text-blue-600 font-semibold">Clan of David</div>
              <span className="font-bold text-gray-800">Student Form</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Information Form</h1>
          <p className="text-gray-600">
            Fill in the details below. Once submitted, the training coordinator will be notified and your document will be generated.
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-6">
          {/* Document Type Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Document Type</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {DOCUMENT_TYPES.map((doc) => (
                <button
                  key={doc.value}
                  type="button"
                  onClick={() => handleChange('document_type', doc.value)}
                  className={`text-left p-4 rounded-xl border-2 transition-all ${
                    form.document_type === doc.value
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <p className="font-semibold text-gray-800 text-sm">{doc.label}</p>
                  <p className="text-xs text-gray-500 mt-1">{doc.description}</p>
                </button>
              ))}
            </div>
          </div>

          {form.document_type === 'id_card' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Student Photo</label>
              <div className="flex items-center gap-4 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4">
                <div className="w-20 h-20 rounded-xl border border-gray-300 bg-white overflow-hidden flex items-center justify-center">
                  {form.photo_url ? (
                    <img src={form.photo_url} alt="Student preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs text-gray-400">No photo</span>
                  )}
                </div>
                <label className="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                  Upload Photo
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </label>
              </div>
            </div>
          )}

          {/* Student Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Student Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.student_name}
              onChange={(e) => handleChange('student_name', e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              required
            />
          </div>

          {/* Track */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Track</label>
            <select
              value={form.track}
              onChange={(e) => handleChange('track', e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
            >
              {TRACKS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Grade & Course */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Grade / Level</label>
              <input
                type="text"
                value={form.grade}
                onChange={(e) => handleChange('grade', e.target.value)}
                placeholder="e.g. Grade 3"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Course</label>
              <input
                type="text"
                value={form.course}
                onChange={(e) => handleChange('course', e.target.value)}
                placeholder="e.g. Piano"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Completion Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Completion Date</label>
            <input
              type="date"
              value={form.completion_date}
              onChange={(e) => handleChange('completion_date', e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          {/* Coordinator & Director */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Coordinator (optional)</label>
              <input
                type="text"
                value={form.coordinator}
                onChange={(e) => handleChange('coordinator', e.target.value)}
                placeholder="e.g. Jane Smith"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Director (optional)</label>
              <input
                type="text"
                value={form.director}
                onChange={(e) => handleChange('director', e.target.value)}
                placeholder="e.g. Robert Brown"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Submit Form
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
