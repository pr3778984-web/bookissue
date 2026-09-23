import React from 'react';
import { SchoolInfo, Student } from '../types';
import { Printer, X, BookOpen, ShieldCheck } from 'lucide-react';

interface StudentLibraryCardModalProps {
  student: Student | null;
  schoolInfo: SchoolInfo;
  onClose: () => void;
}

export const StudentLibraryCardModal: React.FC<StudentLibraryCardModalProps> = ({
  student,
  schoolInfo,
  onClose,
}) => {
  if (!student) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl my-8">
        {/* Modal Toolbar (hidden during print) */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 no-print">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              બાળકનું પુસ્તકાલય કાર્ડ (Student Library ID Card)
            </h3>
            <p className="text-xs text-slate-500">
              પ્રિન્ટ કાઢીને વિદ્યાર્થીને આપવા માટે તૈયાર
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>પ્રિન્ટ કરો (Print)</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE CARD CONTAINER */}
        <div className="print-area bg-white border-2 border-amber-600/40 rounded-2xl p-5 shadow-sm space-y-4">
          {/* Card Front */}
          <div className="border border-slate-300 rounded-xl p-4 bg-gradient-to-b from-amber-50/40 via-white to-orange-50/30">
            {/* Header */}
            <div className="text-center border-b border-amber-300/60 pb-3">
              <div className="flex items-center justify-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-orange-600 text-white flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h4 className="text-base sm:text-lg font-bold text-slate-900">
                  {schoolInfo.name}
                </h4>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                તા. {schoolInfo.taluka}, જિ. {schoolInfo.district} · ડાયસ કોડ:{' '}
                <strong className="font-mono text-slate-900">{schoolInfo.diseCode}</strong>
              </p>
              <div className="inline-block mt-1 px-3 py-0.5 bg-orange-600 text-white text-[11px] font-semibold rounded-full tracking-wider uppercase">
                વિદ્યાર્થી પુસ્તકાલય કાર્ડ
              </div>
            </div>

            {/* Body */}
            <div className="mt-4 flex items-center gap-4">
              <div className="shrink-0 text-center">
                <img
                  src={student.photoUrl}
                  alt={student.name}
                  className="w-20 h-20 rounded-xl object-cover border-2 border-amber-600/40 bg-white shadow-2xs"
                />
                <span className="block text-[10px] text-slate-500 font-mono mt-1">
                  રોલ નં: {student.rollNo}
                </span>
              </div>

              <div className="flex-1 min-w-0 space-y-1 text-xs">
                <div>
                  <span className="text-slate-500">નામ: </span>
                  <span className="font-bold text-slate-900 text-sm">{student.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-slate-500">ધોરણ: </span>
                    <strong className="text-orange-700">ધોરણ {student.standard} ({student.division})</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">GR નં: </span>
                    <strong className="font-mono text-slate-900">{student.grNo}</strong>
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">વાલીનું નામ: </span>
                  <span className="text-slate-800">{student.parentName || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-500">સરનામું: </span>
                  <span className="text-slate-700 truncate block">{student.address || '-'}</span>
                </div>
              </div>
            </div>

            {/* Card Barcode simulation and Signatures */}
            <div className="mt-4 pt-3 border-t border-slate-200 flex items-end justify-between text-[11px] text-slate-500">
              <div>
                <div className="font-mono tracking-widest text-slate-800 text-[10px] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  ||||| | |||| ||| ||||||| {student.grNo}
                </div>
                <span className="text-[10px] text-slate-400">કાર્ડ માન્ય સત્ર: ૨૦૨૬-૨૭</span>
              </div>

              <div className="text-right">
                <div className="w-24 border-b border-slate-400 mb-1"></div>
                <span className="text-[10px]">આચાર્ય / પ્રભારી સહી</span>
              </div>
            </div>
          </div>

          {/* Card Back / Circulation Entry Slip */}
          <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 text-xs">
            <div className="font-semibold text-slate-800 text-[11px] mb-1.5 flex items-center justify-between">
              <span>પુસ્તક નોંધણી સ્લિપ (Book Issue Log)</span>
              <span className="text-[10px] text-slate-500 font-normal">નિયમ: પુસ્તક સમયસર પરત કરવું</span>
            </div>
            <table className="w-full text-left border border-slate-200 text-[10px] bg-white">
              <thead className="bg-slate-100 border-b border-slate-200 font-semibold text-slate-600">
                <tr>
                  <th className="py-1 px-1.5 border-r border-slate-200">ક્રમ</th>
                  <th className="py-1 px-1.5 border-r border-slate-200">પુસ્તકનું નામ</th>
                  <th className="py-1 px-1.5 border-r border-slate-200">આપ્યા તારીખ</th>
                  <th className="py-1 px-1.5 border-r border-slate-200">પરત તારીખ</th>
                  <th className="py-1 px-1.5">સહી</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[1, 2, 3, 4].map((i) => (
                  <tr key={i} className="h-6">
                    <td className="py-1 px-1.5 border-r border-slate-200 text-center font-mono">{i}</td>
                    <td className="py-1 px-1.5 border-r border-slate-200"></td>
                    <td className="py-1 px-1.5 border-r border-slate-200"></td>
                    <td className="py-1 px-1.5 border-r border-slate-200"></td>
                    <td className="py-1 px-1.5"></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Button at bottom (no-print) */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2 no-print">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
          >
            બંધ કરો
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>કાર્ડ પ્રિન્ટ કરો (Print Card)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
