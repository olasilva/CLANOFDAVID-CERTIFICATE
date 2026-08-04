import { forwardRef } from 'react';

interface IdCardFrontProps {
  studentName?: string;
  course?: string;
  grade?: string;
  studentId?: string;
  studentPhoto?: string;
  logoSrc?: string;
}

const IdCardFront = forwardRef<HTMLDivElement, IdCardFrontProps>(
  ({ studentName, course, grade, studentId, studentPhoto, logoSrc = '/logo.png' }, ref) => {
    return (
      <div
        ref={ref}
        className="relative w-[340px] h-[500px] bg-white rounded-[18px] overflow-hidden shadow-xl border border-gray-200"
        style={{ fontFamily: 'Poppins, Arial, sans-serif' }}
      >
        {/* Header */}
        <div className="relative bg-[#0b1a4a] pt-6 pb-8 px-4 text-center">
          <img src={logoSrc} alt="Clan of David logo" className="w-14 h-14 mx-auto mb-2 object-contain" />
          <h1 className="text-white font-extrabold text-2xl tracking-tight leading-none">CLAN OF DAVID</h1>
          <p className="text-white text-[11px] font-semibold tracking-wide mt-1">
            ART AND MUSIC ACADEMY
          </p>
          <p className="text-[#f8b6d8] italic text-xs mt-1">Skillfully Educated</p>
        </div>

        {/* Photo circle, straddling the header/body seam like the physical card */}
        <div className="flex justify-center -mt-10 relative z-10">
          <div
            className="w-40 h-40 rounded-full p-[4px]"
            style={{
              backgroundImage: 'linear-gradient(135deg, #7c3aed, #e6197f)',
            }}
          >
            <div className="w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center">
              {studentPhoto ? (
                <img
                  src={studentPhoto}
                  alt={studentName || 'Student'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-4xl font-bold text-gray-200">
                  {studentName?.charAt(0)?.toUpperCase() || ''}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Fields */}
        <div className="px-8 mt-9 space-y-5">
          <FieldLine label="Name" value={studentName} />
          <FieldLine label="Course" value={course} />
          <FieldLine label="Grade" value={grade} />
          <FieldLine label="Student ID" value={studentId} />
        </div>

        {/* Wavy footer, navy fading to pink like the printed card */}
        <div className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none">
          <svg viewBox="0 0 340 48" preserveAspectRatio="none" className="w-full h-full">
            <defs>
              <linearGradient id="footerGradFront" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#0b1a4a" />
                <stop offset="100%" stopColor="#e6197f" />
              </linearGradient>
            </defs>
            <path d="M0,20 C90,0 250,42 340,12 L340,48 L0,48 Z" fill="url(#footerGradFront)" />
          </svg>
        </div>
      </div>
    );
  }
);
IdCardFront.displayName = 'IdCardFront';

function FieldLine({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-[#0b1a4a] font-bold text-sm shrink-0">{label}:</span>
      <span className="flex-1 border-b border-gray-400 text-sm text-gray-800 pb-0.5 truncate">
        {value || '\u00A0'}
      </span>
    </div>
  );
}

export default IdCardFront;