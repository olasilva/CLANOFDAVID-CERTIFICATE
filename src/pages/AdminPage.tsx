import { useState, useEffect, useRef, useCallback } from 'react';
import html2canvas from 'html2canvas';
import { supabase, type StudentSubmission, type DocumentType } from '@/lib/supabase';
import schoolLogo from '../../img/IMG-20260531-WA0013 - Copy.jpg';
import CertificateOfMerit from '@/components/documents/CertificateOfMerit';
import CertificateOfAttendance from '@/components/documents/CertificateOfAttendance';
import IdCard from '@/components/documents/idCard';
import TemplateDoc from '@/components/documents/TemplateDoc';
import {
  Bell, CheckCircle, Clock, Download, Trash2, GraduationCap,
  ArrowLeft, FileText, CreditCard as IdCardIcon, Award, Layout,
  X, ChevronRight, Filter, Loader2,
} from 'lucide-react';

const DOC_ICONS: Record<DocumentType, typeof Award> = {
  certificate_of_merit: Award,
  certificate_of_attendance: FileText,
  id_card: IdCardIcon,
  template: Layout,
};

const DOC_LABELS: Record<DocumentType, string> = {
  certificate_of_merit: 'Certificate of Merit',
  certificate_of_attendance: 'Certificate of Attendance',
  id_card: 'ID Card',
  template: 'Template',
};

function generateSerial(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000);
  return `TC-${year}-${random}`;
}

export default function AdminPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<{ id: string; name: string; docType: string }[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'generated'>('all');
  const docRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const fetchSubmissions = useCallback(async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('student_submissions')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching submissions:', error);
      return;
    }
    setSubmissions((data || []) as StudentSubmission[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    fetchSubmissions();

    // Real-time subscription
    const channel: any = supabase.channel('student_submissions_changes');

    channel
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'student_submissions' },
        (payload: { new?: StudentSubmission }) => {
          const newSub = payload.new;
          if (!newSub) return;
          setSubmissions((prev) => [newSub, ...prev]);
          setNotifications((prev) => [
            ...prev,
            { id: newSub.id, name: newSub.student_name, docType: DOC_LABELS[newSub.document_type] },
          ]);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'student_submissions' },
        (payload: { new?: StudentSubmission }) => {
          const updated = payload.new;
          if (!updated) return;
          setSubmissions((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'student_submissions' },
        (payload: { old?: StudentSubmission }) => {
          const deleted = payload.old;
          if (!deleted) return;
          setSubmissions((prev) => prev.filter((s) => s.id !== deleted.id));
        }
      )
      .subscribe();

    return () => {
      if (supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [fetchSubmissions]);

  const handleGenerate = async (sub: StudentSubmission) => {
    if (!supabase) return;

    const serial = sub.serial_number || generateSerial();
    const { error } = await supabase
      .from('student_submissions')
      .update({ status: 'generated', serial_number: serial, updated_at: new Date().toISOString() })
      .eq('id', sub.id);
    if (error) {
      console.error('Error updating submission:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!supabase) return;

    const { error } = await supabase.from('student_submissions').delete().eq('id', id);
    if (error) {
      console.error('Error deleting submission:', error);
    }
    if (selectedId === id) setSelectedId(null);
  };

  const handleDownload = async (sub: StudentSubmission) => {
    const ref = docRefs.current[sub.id];
    if (!ref) return;
    try {
      const canvas = await html2canvas(ref, { scale: 2, backgroundColor: '#ffffff' });
      const link = document.createElement('a');
      const safeName = sub.student_name.replace(/[^a-zA-Z0-9]/g, '_');
      link.download = `${DOC_LABELS[sub.document_type].replace(/\s+/g, '_')}_${safeName}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const filtered = submissions.filter((s) => {
    if (filter === 'pending') return s.status !== 'generated';
    if (filter === 'generated') return s.status === 'generated';
    return true;
  });

  const selected = submissions.find((s) => s.id === selectedId) || null;
  const pendingCount = submissions.filter((s) => s.status !== 'generated').length;

  const renderDoc = (sub: StudentSubmission) => {
    const props = {
      studentName: sub.student_name,
      track: sub.track,
      grade: sub.grade || '',
      course: sub.course || '',
      completionDate: sub.completion_date || '',
      serialNumber: sub.serial_number || '',
      coordinator: sub.coordinator || '',
      director: sub.director || '',
      studentPhoto: sub.photo_url || '',
    };
    switch (sub.document_type) {
      case 'certificate_of_merit':
        return <CertificateOfMerit {...props} ref={(el: HTMLDivElement | null) => { docRefs.current[sub.id] = el; }} />;
      case 'certificate_of_attendance':
        return <CertificateOfAttendance {...props} ref={(el: HTMLDivElement | null) => { docRefs.current[sub.id] = el; }} />;
      case 'id_card':
        return <IdCard {...props} ref={(el: HTMLDivElement | null) => { docRefs.current[sub.id] = el; }} />;
      case 'template':
        return <TemplateDoc {...props} ref={(el: HTMLDivElement | null) => { docRefs.current[sub.id] = el; }} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <div className="w-px h-6 bg-gray-200" />
            <img src={schoolLogo} alt="Clan of David logo" className="w-10 h-10 object-cover rounded-full border border-gray-200 bg-white" />
            <div>
              <h1 className="font-bold text-gray-900">Clan of David</h1>
              <p className="text-xs text-gray-500">Admin Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg">
              <Clock className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-700">{pendingCount} Pending</span>
            </div>
            <button
              onClick={() => onNavigate('form')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Open Student Form
            </button>
          </div>
        </div>
      </header>

      {/* Real-time notifications */}
      {notifications.length > 0 && (
        <div className="fixed top-20 right-6 z-30 space-y-2 max-w-sm">
          {notifications.slice(-3).map((n) => (
            <div
              key={n.id}
              className="flex items-start gap-3 p-4 bg-white rounded-xl shadow-lg border border-gray-200 animate-in slide-in-from-right"
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Bell className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">New Submission!</p>
                <p className="text-xs text-gray-600 truncate">
                  {n.name} requested a {n.docType}
                </p>
              </div>
              <button
                onClick={() => dismissNotification(n.id)}
                className="text-gray-400 hover:text-gray-600 flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Submissions', value: submissions.length, icon: FileText, color: 'blue' },
            { label: 'Pending', value: pendingCount, icon: Clock, color: 'amber' },
            { label: 'Generated', value: submissions.filter((s) => s.status === 'generated').length, icon: CheckCircle, color: 'green' },
            { label: 'Document Types', value: 4, icon: Layout, color: 'purple' },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg bg-${stat.color}-100 flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 text-${stat.color}-600`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-gray-400" />
          {(['all', 'pending', 'generated'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
                filter === f
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" />
            Loading submissions...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No submissions yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Share the student form link — new submissions will appear here in real time.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Submission list */}
            <div className="space-y-3">
              {filtered.map((sub) => {
                const DocIcon = DOC_ICONS[sub.document_type];
                const isGenerated = sub.status === 'generated';
                return (
                  <div
                    key={sub.id}
                    className={`bg-white rounded-xl border p-4 transition-all cursor-pointer ${
                      selectedId === sub.id ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedId(sub.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isGenerated ? 'bg-green-100' : 'bg-blue-100'
                      }`}>
                        <DocIcon className={`w-5 h-5 ${isGenerated ? 'text-green-600' : 'text-blue-600'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-semibold text-gray-900 truncate">{sub.student_name}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                            isGenerated ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {isGenerated ? 'Generated' : 'Pending'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5">{DOC_LABELS[sub.document_type]}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                          <span>{sub.track}</span>
                          {sub.course && <span>· {sub.course}</span>}
                          <span>· {new Date(sub.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-300 flex-shrink-0" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Preview panel */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              {selected ? (
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-gray-900">{selected.student_name}</h3>
                      <p className="text-sm text-gray-500">{DOC_LABELS[selected.document_type]}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {selected.status !== 'generated' && (
                        <button
                          onClick={() => handleGenerate(selected)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Generate
                        </button>
                      )}
                      <button
                        onClick={() => handleDownload(selected)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                      <button
                        onClick={() => handleDelete(selected.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Document preview - scaled down */}
                  <div className="bg-gray-100 rounded-lg p-4 overflow-auto max-h-[500px] flex items-center justify-center">
                    <div style={{ transform: 'scale(0.45)', transformOrigin: 'center top' }}>
                      {renderDoc(selected)}
                    </div>
                  </div>

                  {/* Hidden full-size render for download */}
                  <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
                    {renderDoc(selected)}
                  </div>

                  {/* Details */}
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-400 text-xs">Track</p>
                      <p className="text-gray-700 font-medium">{selected.track}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Grade</p>
                      <p className="text-gray-700 font-medium">{selected.grade || '—'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Course</p>
                      <p className="text-gray-700 font-medium">{selected.course || '—'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Serial Number</p>
                      <p className="text-gray-700 font-medium">{selected.serial_number || '—'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Coordinator</p>
                      <p className="text-gray-700 font-medium">{selected.coordinator || '—'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Director</p>
                      <p className="text-gray-700 font-medium">{selected.director || '—'}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">Select a submission to preview</p>
                  <p className="text-sm text-gray-400 mt-1">Click any submission on the left to view and generate the document.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
