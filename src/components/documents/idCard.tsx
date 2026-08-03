import { forwardRef } from 'react';

interface IdCardProps {
  studentName: string;
  track: string;
  grade: string;
  course: string;
  completionDate: string;
  serialNumber: string;
  coordinator?: string;
  director?: string;
  studentPhoto?: string;
}

const IdCard = forwardRef<HTMLDivElement, IdCardProps>(
  ({ studentName, track, grade, course, completionDate, serialNumber, coordinator, director, studentPhoto }, ref) => {
    const formattedDate = completionDate
      ? new Date(completionDate).toLocaleDateString('en-US', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      : '—';

    return (
      <div
        ref={ref}
        className="relative w-[800px] h-[500px] bg-white border-[10px] border-[#1d4ed8] rounded-[28px] p-6 shadow-lg"
        style={{ fontFamily: 'Arial, sans-serif' }}
      >
        <div className="absolute inset-4 border-2 border-[#93c5fd] rounded-[20px]" />

        <div className="relative z-10 flex h-full">
          <div className="w-[220px] flex flex-col items-center justify-center border-r border-blue-200 pr-6">
            <div className="w-28 h-28 rounded-full border-4 border-blue-600 bg-blue-50 overflow-hidden flex items-center justify-center">
              {studentPhoto ? (
                <img src={studentPhoto} alt={studentName || 'Student'} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-blue-700">{studentName?.charAt(0)?.toUpperCase() || 'S'}</span>
              )}
            </div>
            <div className="mt-4 text-center">
              <p className="text-xs uppercase tracking-[0.3em] text-blue-500">Student</p>
              <p className="mt-2 text-lg font-bold text-gray-800">{studentName || 'Student Name'}</p>
            </div>
          </div>

          <div className="flex-1 pl-8 flex flex-col justify-center">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-blue-500">Training Center</p>
                <h1 className="mt-2 text-3xl font-black text-blue-900">TALENT CAMPUS</h1>
              </div>
              <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-right">
                <p className="text-[10px] uppercase tracking-[0.2em] text-blue-500">ID</p>
                <p className="text-sm font-bold text-blue-900">{serialNumber || '—'}</p>
              </div>
            </div>

            <div className="space-y-4 text-sm text-gray-700">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400">Track</p>
                  <p className="mt-1 font-semibold text-gray-800">{track || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400">Grade</p>
                  <p className="mt-1 font-semibold text-gray-800">{grade || '—'}</p>
                </div>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400">Course</p>
                <p className="mt-1 font-semibold text-gray-800">{course || '—'}</p>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400">Completion Date</p>
                <p className="mt-1 font-semibold text-gray-800">{formattedDate}</p>
              </div>
            </div>

            <div className="mt-8 flex items-end justify-between border-t border-blue-200 pt-4">
              <div>
                <div className="w-40 border-b border-gray-300 pb-1">
                  <span className="text-xs italic text-gray-500">{coordinator || '—'}</span>
                </div>
                <p className="mt-2 text-[10px] uppercase tracking-[0.24em] text-gray-500">Coordinator</p>
              </div>
              <div className="text-right">
                <div className="w-40 border-b border-gray-300 pb-1">
                  <span className="text-xs italic text-gray-500">{director || '—'}</span>
                </div>
                <p className="mt-2 text-[10px] uppercase tracking-[0.24em] text-gray-500">Director</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

IdCard.displayName = 'IdCard';
export default IdCard;
