import { forwardRef } from 'react';

interface TemplateDocProps {
  studentName: string;
  track: string;
  grade: string;
  course: string;
  completionDate: string;
  serialNumber: string;
  coordinator?: string;
  director?: string;
}

const TemplateDoc = forwardRef<HTMLDivElement, TemplateDocProps>(
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
        {/* Modern geometric border */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#ec4899]" />
        <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-[#ec4899] via-[#8b5cf6] to-[#6366f1]" />
        <div className="absolute top-2 left-0 w-2 h-full bg-gradient-to-b from-[#6366f1] to-[#ec4899]" />
        <div className="absolute top-2 right-0 w-2 h-full bg-gradient-to-b from-[#ec4899] to-[#6366f1]" />

        {/* Decorative circles */}
        <div className="absolute top-12 right-12 w-32 h-32 rounded-full border-4 border-[#8b5cf6]/20" />
        <div className="absolute top-20 right-20 w-20 h-20 rounded-full bg-[#8b5cf6]/5" />
        <div className="absolute bottom-16 left-12 w-24 h-24 rounded-full border-4 border-[#ec4899]/15" />

        <div className="relative h-full flex flex-col items-center justify-center px-20 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6366f1] to-[#ec4899] flex items-center justify-center mx-auto">
              <svg viewBox="0 0 24 24" className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6" />
                <path d="M9 13h6M9 17h6" />
              </svg>
            </div>
          </div>

          <h1 className="text-[48px] font-bold tracking-[0.12em] bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#ec4899] bg-clip-text text-transparent mb-2">
            CERTIFICATE
          </h1>
          <p className="text-[18px] tracking-[0.3em] text-gray-400 font-semibold mb-8 uppercase">
            of Achievement
          </p>

          <p className="text-[16px] text-gray-500 mb-3 italic">This document is presented to</p>

          <h2 className="text-[38px] font-bold text-gray-800 mb-6 border-b-2 border-[#8b5cf6]/30 pb-2 min-w-[400px]">
            {studentName || 'Student Name'}
          </h2>

          <p className="text-[18px] text-gray-700 max-w-[600px] leading-relaxed mb-6">
            for outstanding performance in the <span className="font-semibold bg-gradient-to-r from-[#6366f1] to-[#ec4899] bg-clip-text text-transparent">{track}</span>
            {grade ? <span>, Grade <span className="font-semibold text-gray-800">{grade}</span></span> : null}
            {course ? <span>, <span className="font-semibold text-gray-800">{course}</span></span> : null}.
          </p>

          <p className="text-[16px] text-gray-500 mb-10">
            {formattedDate}
          </p>

          <div className="flex justify-between w-[600px] mt-auto mb-4">
            <div className="text-center">
              <div className="w-52 border-b-2 border-[#8b5cf6]/30 mb-2 pb-1">
                <span className="text-[15px] text-gray-500 italic">{coordinator || '—'}</span>
              </div>
              <p className="text-[13px] tracking-wider text-gray-500 uppercase">Coordinator</p>
            </div>
            <div className="text-center">
              <div className="w-52 border-b-2 border-[#ec4899]/30 mb-2 pb-1">
                <span className="text-[15px] text-gray-500 italic">{director || '—'}</span>
              </div>
              <p className="text-[13px] tracking-wider text-gray-500 uppercase">Director</p>
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

TemplateDoc.displayName = 'TemplateDoc';
export default TemplateDoc;
