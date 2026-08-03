import { forwardRef } from 'react';

interface CertificateOfAttendanceProps {
  studentName: string;
  track: string;
  course: string;
  completionDate: string;
  serialNumber: string;
  coordinator?: string;
  director?: string;
}

const CertificateOfAttendance = forwardRef<HTMLDivElement, CertificateOfAttendanceProps>(
  ({ studentName, track, course, completionDate, serialNumber, coordinator, director }, ref) => {
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
        className="relative w-[1000px] h-[700px] bg-white overflow-hidden"
        style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
      >
        {/* Border */}
        <div className="absolute inset-0 border-[6px] border-[#2d6a4f] m-3 rounded-[4px] pointer-events-none" />
        <div className="absolute inset-0 border-2 border-[#2d6a4f]/30 m-7 rounded-[2px] pointer-events-none" />

        {/* Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04]">
          <span className="text-[180px] font-bold text-[#2d6a4f] tracking-widest rotate-[-30deg]">ATTENDANCE</span>
        </div>

        <div className="relative h-full flex flex-col items-center justify-center px-20 text-center">
          <div className="mb-4">
            <div className="w-16 h-16 rounded-full bg-[#2d6a4f] flex items-center justify-center mx-auto">
              <svg viewBox="0 0 24 24" className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4" />
                <circle cx="12" cy="12" r="9" />
              </svg>
            </div>
          </div>

          <h1 className="text-[44px] font-bold tracking-[0.1em] text-[#2d6a4f] mb-1">
            CERTIFICATE
          </h1>
          <p className="text-[20px] tracking-[0.35em] text-[#52b788] font-semibold mb-8 uppercase">
            of Attendance
          </p>

          <p className="text-[16px] text-gray-500 mb-3 italic">This is to certify that</p>

          <h2 className="text-[38px] font-bold text-[#1a3a2c] mb-6 border-b-2 border-[#2d6a4f]/30 pb-2 min-w-[400px]">
            {studentName || 'Student Name'}
          </h2>

          <p className="text-[18px] text-gray-700 max-w-[620px] leading-relaxed mb-6">
            has attended the <span className="font-semibold text-[#2d6a4f]">{track}</span>
            {course ? <span> program in <span className="font-semibold text-[#2d6a4f]">{course}</span></span> : null}.
          </p>

          <p className="text-[16px] text-gray-600 mb-10">
            Date of Completion: <span className="font-semibold">{formattedDate}</span>
          </p>

          <div className="flex justify-between w-[600px] mt-auto mb-4">
            <div className="text-center">
              <div className="w-52 border-b border-gray-400 mb-2 pb-1">
                <span className="text-[15px] text-gray-500 italic">{coordinator || '—'}</span>
              </div>
              <p className="text-[13px] tracking-wider text-gray-600 uppercase">Coordinator</p>
            </div>
            <div className="text-center">
              <div className="w-52 border-b border-gray-400 mb-2 pb-1">
                <span className="text-[15px] text-gray-500 italic">{director || '—'}</span>
              </div>
              <p className="text-[13px] tracking-wider text-gray-600 uppercase">Director</p>
            </div>
          </div>

          <p className="absolute bottom-10 right-16 text-[12px] text-gray-400 tracking-wider">
            Serial: {serialNumber || '—'}
          </p>
        </div>
      </div>
    );
  }
);

CertificateOfAttendance.displayName = 'CertificateOfAttendance';
export default CertificateOfAttendance;
