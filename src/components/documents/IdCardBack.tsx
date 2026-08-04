import { forwardRef } from 'react';
import schoolLogo from '../../../img/IMG-20260531-WA0013 - Copy.jpg';

interface IdCardBackProps {
  refNumber?: string;
  address?: string;
  phones?: string[];
}

const IdCardBack = forwardRef<HTMLDivElement, IdCardBackProps>(
  (
    {
      refNumber = 'No 1 (H) 21',
      address = 'Environmental off Chuma Okafor Street, behind Premier Academy, FHA Lugbe, Abuja.',
      // NOTE: the middle phone number was partly obscured by glare in the source
      // photo — double-check this digit string before printing.
      phones = ['+234 706 809 8651', '+234 813 596 176', '+234 818 497 7448'],
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className="relative w-[340px] h-[500px] bg-white rounded-[18px] overflow-hidden shadow-xl border border-gray-200 flex flex-col"
        style={{ fontFamily: 'Poppins, Arial, sans-serif' }}
      >
        {/* thin top wave */}
        <div className="h-6 w-full">
          <svg viewBox="0 0 340 24" preserveAspectRatio="none" className="w-full h-full">
            <path d="M0,0 L340,0 L340,10 C250,22 90,2 0,14 Z" fill="#0b1a4a" />
          </svg>
        </div>

        <div className="flex-1 px-7 pt-4 text-center flex flex-col items-center">
          <img
            src={schoolLogo}
            alt="Clan of David logo"
            className="mb-3 h-14 w-14 rounded-full border-2 border-[#0b1a4a] bg-white object-cover p-1 shadow-sm"
          />

          <p className="text-[12.5px] text-gray-700 leading-snug max-w-[260px]">
            This is to certify that the person whose name and photo appears on
            the overleaf is a student of
          </p>

          <h2 className="mt-4 text-2xl font-extrabold text-[#0b1a4a] tracking-tight leading-none">
            CLAN OF DAVID
          </h2>
          <p className="text-[11px] font-semibold text-[#0b1a4a] tracking-wide mt-1">
            ART AND MUSIC ACADEMY
          </p>

          <p className="mt-4 text-[12.5px] text-gray-700">{refNumber}</p>

          <p className="mt-2 text-[12.5px] text-gray-700 leading-snug max-w-[260px]">
            {address}
          </p>

          <div className="mt-3 text-[12.5px] font-semibold text-gray-800 space-y-0.5">
            {phones.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>

          <p className="mt-5 text-[12.5px] text-gray-700 leading-snug max-w-[250px]">
            This card must be surrendered at the end of student session.
          </p>
          <p className="mt-3 text-[12.5px] text-gray-700 leading-snug max-w-[250px]">
            If found please return to the address above or to the nearest
            police station.
          </p>
        </div>

        {/* Wavy footer, pink fading to navy — mirrored from the front */}
        <div className="h-12 w-full pointer-events-none">
          <svg viewBox="0 0 340 48" preserveAspectRatio="none" className="w-full h-full">
            <defs>
              <linearGradient id="footerGradBack" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#e6197f" />
                <stop offset="100%" stopColor="#0b1a4a" />
              </linearGradient>
            </defs>
            <path d="M0,12 C90,40 250,2 340,20 L340,48 L0,48 Z" fill="url(#footerGradBack)" />
          </svg>
        </div>
      </div>
    );
  }
);
IdCardBack.displayName = 'IdCardBack';

export default IdCardBack;