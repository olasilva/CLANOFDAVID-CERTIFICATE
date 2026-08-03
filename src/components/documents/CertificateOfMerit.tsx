import { forwardRef } from 'react';

interface CertificateOfMeritProps {
  studentName: string;
  track: string;
  grade: string;
  course: string;
  completionDate: string;
  serialNumber: string;
  coordinator?: string;
  director?: string;
}

const CertificateOfMerit = forwardRef<HTMLDivElement, CertificateOfMeritProps>(
  ({ studentName, track, grade, course, completionDate, serialNumber, coordinator, director }, ref) => {
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
        {/* Outer ornamental border */}
        <div className="absolute inset-0 border-[8px] border-[#c8a44d] m-3 rounded-[4px] pointer-events-none" />
        {/* Inner border */}
        <div className="absolute inset-0 border-2 border-[#c8a44d]/40 m-7 rounded-[2px] pointer-events-none" />

        {/* Corner ornaments */}
        <div className="absolute top-6 left-6 w-16 h-16 border-l-4 border-t-4 border-[#c8a44d] rounded-tl-lg" />
        <div className="absolute top-6 right-6 w-16 h-16 border-r-4 border-t-4 border-[#c8a44d] rounded-tr-lg" />
        <div className="absolute bottom-6 left-6 w-16 h-16 border-l-4 border-b-4 border-[#c8a44d] rounded-bl-lg" />
        <div className="absolute bottom-6 right-6 w-16 h-16 border-r-4 border-b-4 border-[#c8a44d] rounded-br-lg" />

        {/* Decorative top flourish */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 flex items-center gap-3">
          <div className="w-32 h-px bg-[#c8a44d]" />
          <div className="w-3 h-3 rounded-full border-2 border-[#c8a44d]" />
          <div className="w-2 h-2 rounded-full bg-[#c8a44d]" />
          <div className="w-3 h-3 rounded-full border-2 border-[#c8a44d]" />
          <div className="w-32 h-px bg-[#c8a44d]" />
        </div>

        <div className="relative h-full flex flex-col items-center justify-center px-20 text-center">
          {/* Logo placeholder */}
          <div className="mb-4">
            <div className="w-20 h-20 rounded-full border-4 border-[#c8a44d] flex items-center justify-center mx-auto">
              <svg viewBox="0 0 24 24" className="w-10 h-10 text-[#c8a44d]" fill="currentColor">
                <path d="M12 2L9 7L3 8L7.5 12.5L6 19L12 16L18 19L16.5 12.5L21 8L15 7L12 2Z" />
              </svg>
            </div>
          </div>

          <h1 className="text-[52px] font-bold tracking-[0.15em] text-[#1a3a5c] mb-1">
            CERTIFICATE
          </h1>
          <p className="text-[22px] tracking-[0.4em] text-[#c8a44d] font-semibold mb-8 uppercase">
            of Merit
          </p>

          <p className="text-[16px] text-gray-500 mb-3 italic">This certificate is proudly presented to</p>

          <h2 className="text-[40px] font-bold text-[#1a3a5c] mb-6 border-b-2 border-[#c8a44d]/30 pb-2 min-w-[400px]">
            {studentName || 'Student Name'}
          </h2>

          <p className="text-[18px] text-gray-700 max-w-[600px] leading-relaxed mb-6">
            for successfully completing the <span className="font-semibold text-[#1a3a5c]">{track}</span>
            {grade ? <span> at the <span className="font-semibold text-[#1a3a5c]">{grade}</span> level</span> : null}
            {course ? <span> in <span className="font-semibold text-[#1a3a5c]">{course}</span></span> : null}.
          </p>

          <p className="text-[16px] text-gray-600 mb-10">
            Awarded on <span className="font-semibold">{formattedDate}</span>
          </p>

          {/* Signatures */}
          <div className="flex justify-between w-[640px] mt-auto mb-4">
            <div className="text-center">
              <div className="w-56 border-b border-gray-400 mb-2 pb-1">
                <span className="text-[15px] text-gray-500 italic">{coordinator || '—'}</span>
              </div>
              <p className="text-[13px] tracking-wider text-gray-600 uppercase">Training Coordinator</p>
            </div>

            <div className="text-center">
              <div className="w-24 h-24 rounded-full border-2 border-[#c8a44d]/50 flex items-center justify-center mx-auto -mt-4">
                <svg viewBox="0 0 24 24" className="w-12 h-12 text-[#c8a44d]/60" fill="currentColor">
                  <path d="M12 2L9 7L3 8L7.5 12.5L6 19L12 16L18 19L16.5 12.5L21 8L15 7L12 2Z" />
                </svg>
              </div>
            </div>

            <div className="text-center">
              <div className="w-56 border-b border-gray-400 mb-2 pb-1">
                <span className="text-[15px] text-gray-500 italic">{director || '—'}</span>
              </div>
              <p className="text-[13px] tracking-wider text-gray-600 uppercase">Director</p>
            </div>
          </div>

          {/* Serial number */}
          <p className="absolute bottom-10 right-16 text-[12px] text-gray-400 tracking-wider">
            Serial: {serialNumber || '—'}
          </p>
        </div>
      </div>
    );
  }
);

CertificateOfMerit.displayName = 'CertificateOfMerit';
export default CertificateOfMerit;
