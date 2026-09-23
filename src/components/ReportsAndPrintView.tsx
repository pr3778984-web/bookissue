import React, { useState } from 'react';
import { Book, CirculationRecord, SchoolInfo, Student } from '../types';
import {
  Printer,
  FileSpreadsheet,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Users,
  FileText,
} from 'lucide-react';
import { exportToCSV, downloadSystemBackup } from '../utils/storage';

interface ReportsAndPrintViewProps {
  students: Student[];
  books: Book[];
  circulations: CirculationRecord[];
  schoolInfo: SchoolInfo;
  onRestoreData: (importedData: any) => void;
  onResetData: () => void;
}

export const ReportsAndPrintView: React.FC<ReportsAndPrintViewProps> = ({
  students,
  books,
  circulations,
  schoolInfo,
  onRestoreData,
  onResetData,
}) => {
  const [activeReport, setActiveReport] = useState<'circulation' | 'students' | 'overdue' | 'stock'>(
    'circulation'
  );
  const [selectedStandard, setSelectedStandard] = useState<number | 'all'>('all');

  const today = new Date().toISOString().slice(0, 10);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCurrentReportCSV = () => {
    if (activeReport === 'circulation') {
      const headers = [
        'ક્રમ',
        'તારીખ (આપ્યાની)',
        'વિદ્યાર્થીનું નામ',
        'ધોરણ',
        'GR નંબર',
        'પુસ્તકનું નામ',
        'પુસ્તક દાખલ નં.',
        'પરત કરવાની તારીખ',
        'ખરેખર પરત તારીખ',
        'સ્થિતિ',
        'શેરો',
      ];
      const rows = circulations.map((c, idx) => [
        idx + 1,
        c.issueDate,
        c.studentName,
        `ધોરણ ${c.studentStandard}`,
        c.studentGrNo,
        c.bookTitle,
        c.bookNo,
        c.dueDate,
        c.returnDate || 'બાકી',
        c.status === 'returned' ? 'પરત મળેલ' : c.dueDate < today ? 'મુદત વીતી ગયેલ' : 'વાંચવા આપેલ',
        c.remarks || '',
      ]);
      exportToCSV(`dhariya_circulation_register_${today}.csv`, headers, rows);
    } else if (activeReport === 'students') {
      const filtered =
        selectedStandard === 'all'
          ? students
          : students.filter((s) => s.standard === selectedStandard);

      const headers = [
        'ક્રમ',
        'GR નંબર',
        'રોલ નં',
        'વિદ્યાર્થીનું નામ',
        'ધોરણ',
        'વર્ગ',
        'જાતિ',
        'જન્મ તારીખ',
        'વાલીનું નામ',
        'મોબાઈલ',
        'સરનામું/ગામ',
        'વાંચેલા પુસ્તકો',
      ];
      const rows = filtered.map((s, idx) => {
        const readCount = circulations.filter(
          (c) => c.studentId === s.id && c.status === 'returned'
        ).length;
        return [
          idx + 1,
          s.grNo,
          s.rollNo,
          s.name,
          `ધોરણ ${s.standard}`,
          s.division,
          s.gender === 'boy' ? 'કુમાર' : 'કન્યા',
          s.dob,
          s.parentName,
          s.mobile,
          s.address,
          readCount,
        ];
      });
      exportToCSV(`dhariya_students_list_${today}.csv`, headers, rows);
    } else if (activeReport === 'overdue') {
      const overdues = circulations.filter(
        (c) => (c.status === 'issued' || c.status === 'overdue') && c.dueDate < today
      );
      const headers = [
        'ક્રમ',
        'વિદ્યાર્થીનું નામ',
        'ધોરણ',
        'GR નં',
        'મોબાઈલ',
        'પુસ્તકનું નામ',
        'આપ્યા તારીખ',
        'નિયત પરત તારીખ',
        'શેરો',
      ];
      const rows = overdues.map((c, idx) => {
        const st = students.find((s) => s.id === c.studentId);
        return [
          idx + 1,
          c.studentName,
          `ધોરણ ${c.studentStandard}`,
          c.studentGrNo,
          st?.mobile || '',
          c.bookTitle,
          c.issueDate,
          c.dueDate,
          c.remarks || '',
        ];
      });
      exportToCSV(`dhariya_overdue_books_${today}.csv`, headers, rows);
    } else if (activeReport === 'stock') {
      const headers = [
        'ક્રમ',
        'દાખલ નં',
        'પુસ્તકનું નામ',
        'લેખક',
        'વિભાગ',
        'યોગ્ય ધોરણ',
        'કુલ નકલો',
        'હાજર નકલો',
        'કબાટ સ્થળ',
      ];
      const rows = books.map((b, idx) => [
        idx + 1,
        b.bookNo,
        b.title,
        b.author,
        b.category,
        b.targetStandard,
        b.copies,
        b.availableCopies,
        b.shelfLocation || '',
      ]);
      exportToCSV(`dhariya_books_stock_${today}.csv`, headers, rows);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed && (parsed.students || parsed.books)) {
            onRestoreData(parsed);
            alert('ડેટા સફળતાપૂર્વક રિસ્ટોર કરવામાં આવ્યો છે!');
          } else {
            alert('અમાન્ય બેકઅપ ફાઈલ.');
          }
        } catch (err) {
          alert('ફાઈલ વાંચવામાં ભૂલ આવી.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top action row (hidden in print) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            અહેવાલો અને પ્રિન્ટ પત્રકો (Reports & School Registers)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            શાળા ઇન્સ્પેક્શન અને દૈનિક રેકોર્ડ માટે સત્તાવાર રજીસ્ટર પ્રિન્ટ કરો
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportCurrentReportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs sm:text-sm font-medium cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Excel / CSV ડાઉનલોડ</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs sm:text-sm font-semibold shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>પત્રક પ્રિન્ટ કરો (Print)</span>
          </button>
        </div>
      </div>

      {/* Report Selection Tabs (no-print) */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs no-print">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              onClick={() => setActiveReport('circulation')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap cursor-pointer transition-colors ${
                activeReport === 'circulation'
                  ? 'bg-orange-600 text-white shadow-2xs font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              ૧. પુસ્તક આપ-લે રજીસ્ટર
            </button>

            <button
              onClick={() => setActiveReport('students')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap cursor-pointer transition-colors ${
                activeReport === 'students'
                  ? 'bg-orange-600 text-white shadow-2xs font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              ૨. ધોરણવાર વિદ્યાર્થી પત્રક
            </button>

            <button
              onClick={() => setActiveReport('overdue')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap cursor-pointer transition-colors ${
                activeReport === 'overdue'
                  ? 'bg-orange-600 text-white shadow-2xs font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              ૩. બાકી પુસ્તકોની યાદી
            </button>

            <button
              onClick={() => setActiveReport('stock')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap cursor-pointer transition-colors ${
                activeReport === 'stock'
                  ? 'bg-orange-600 text-white shadow-2xs font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              ૪. પુસ્તક સ્ટોક રજીસ્ટર
            </button>
          </div>

          {activeReport === 'students' && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium">ધોરણ પસંદ કરો:</span>
              <select
                value={selectedStandard}
                onChange={(e) =>
                  setSelectedStandard(
                    e.target.value === 'all' ? 'all' : parseInt(e.target.value, 10)
                  )
                }
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700"
              >
                <option value="all">તમામ ધોરણ (૧ થી ૮)</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    ધોરણ {s}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* PRINTABLE OFFICIAL REGISTER SHEET */}
      <div className="bg-white border border-slate-300 rounded-2xl p-6 sm:p-8 shadow-xs print:p-0 print:border-none print:shadow-none">
        {/* Official Gujarat Government School Header */}
        <div className="text-center border-b-2 border-slate-900 pb-4 mb-5">
          <p className="text-xs text-slate-600 uppercase tracking-widest font-semibold">
            શિક્ષણ વિભાગ · ગુજરાત રાજ્ય · તાલુકો: {schoolInfo.taluka}, જિલ્લો: {schoolInfo.district}
          </p>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-950 mt-1">
            {schoolInfo.name}
          </h2>
          <div className="text-xs font-mono text-slate-700 mt-1 flex items-center justify-center gap-4 flex-wrap">
            <span>શાળા ડાયસ કોડ: <strong>{schoolInfo.diseCode}</strong></span>
            <span>·</span>
            <span>સરનામું: {schoolInfo.address}</span>
            <span>·</span>
            <span>તારીખ: {today}</span>
          </div>

          {/* Subtitle of specific register */}
          <div className="mt-3">
            <span className="inline-block px-4 py-1 bg-slate-900 text-white text-xs sm:text-sm font-bold rounded">
              {activeReport === 'circulation' && 'પુસ્તકાલય દૈનિક આપ-લે રજીસ્ટર પત્રક'}
              {activeReport === 'students' &&
                `ધોરણવાર વિદ્યાર્થી પુસ્તકાલય નોંધણી પત્રક ${
                  selectedStandard === 'all' ? '(ધોરણ ૧ થી ૮)' : `(ધોરણ ${selectedStandard})`
                }`}
              {activeReport === 'overdue' && 'પરત કરવાના બાકી રહેલા પુસ્તકોની વિગત પત્રક'}
              {activeReport === 'stock' && 'પુસ્તકાલય પુસ્તક ભંડાર (સ્ટોક) રજીસ્ટર'}
            </span>
          </div>
        </div>

        {/* 1. CIRCULATION REGISTER TABLE */}
        {activeReport === 'circulation' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse border border-slate-300">
              <thead className="bg-slate-100 text-slate-800">
                <tr className="border-b border-slate-300 font-bold">
                  <th className="py-2 px-2 border-r border-slate-300 w-10 text-center">ક્રમ</th>
                  <th className="py-2 px-2.5 border-r border-slate-300">વિદ્યાર્થીનું નામ</th>
                  <th className="py-2 px-2 border-r border-slate-300 w-20 text-center">ધોરણ/GR</th>
                  <th className="py-2 px-2.5 border-r border-slate-300">પુસ્તકનું નામ</th>
                  <th className="py-2 px-2 border-r border-slate-300 text-center">પુસ્તક નં.</th>
                  <th className="py-2 px-2 border-r border-slate-300 text-center">આપ્યા તારીખ</th>
                  <th className="py-2 px-2 border-r border-slate-300 text-center">નિયત તારીખ</th>
                  <th className="py-2 px-2 border-r border-slate-300 text-center">પરત તારીખ</th>
                  <th className="py-2 px-2 border-r border-slate-300 text-center">સ્થિતિ</th>
                  <th className="py-2 px-2.5">નોંધ / શેરો</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {circulations.map((rec, idx) => (
                  <tr key={rec.id} className="hover:bg-slate-50">
                    <td className="py-2 px-2 border-r border-slate-300 text-center font-mono">{idx + 1}</td>
                    <td className="py-2 px-2.5 border-r border-slate-300 font-medium text-slate-900">{rec.studentName}</td>
                    <td className="py-2 px-2 border-r border-slate-300 text-center font-mono">
                      ધોરણ {rec.studentStandard} <br />
                      <span className="text-[10px] text-slate-500">GR: {rec.studentGrNo}</span>
                    </td>
                    <td className="py-2 px-2.5 border-r border-slate-300 text-slate-800">{rec.bookTitle}</td>
                    <td className="py-2 px-2 border-r border-slate-300 text-center font-mono font-medium">{rec.bookNo}</td>
                    <td className="py-2 px-2 border-r border-slate-300 text-center font-mono">{rec.issueDate}</td>
                    <td className="py-2 px-2 border-r border-slate-300 text-center font-mono">{rec.dueDate}</td>
                    <td className="py-2 px-2 border-r border-slate-300 text-center font-mono font-medium">
                      {rec.returnDate || '-'}
                    </td>
                    <td className="py-2 px-2 border-r border-slate-300 text-center">
                      {rec.status === 'returned' ? (
                        <span className="text-[10px] px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                          જમા
                        </span>
                      ) : rec.dueDate < today ? (
                        <span className="text-[10px] px-1.5 py-0.5 bg-red-100 text-red-800 rounded font-bold">
                          વિલંબ
                        </span>
                      ) : (
                        <span className="text-[10px] px-1.5 py-0.5 bg-orange-100 text-orange-800 rounded">
                          ઉધાર
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-2.5 text-slate-600 text-[11px]">{rec.remarks || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 2. CLASS-WISE STUDENT REGISTER TABLE */}
        {activeReport === 'students' && (
          <div className="overflow-x-auto">
            {(() => {
              const filtered =
                selectedStandard === 'all'
                  ? students
                  : students.filter((s) => s.standard === selectedStandard);
              return (
                <table className="w-full text-left text-xs border-collapse border border-slate-300">
                  <thead className="bg-slate-100 text-slate-800">
                    <tr className="border-b border-slate-300 font-bold">
                      <th className="py-2 px-2 border-r border-slate-300 w-10 text-center">ક્રમ</th>
                      <th className="py-2 px-2 border-r border-slate-300 text-center">GR નં</th>
                      <th className="py-2 px-2 border-r border-slate-300 text-center">રોલ નં</th>
                      <th className="py-2 px-2.5 border-r border-slate-300">વિદ્યાર્થીનું પૂરું નામ</th>
                      <th className="py-2 px-2 border-r border-slate-300 text-center">ધોરણ</th>
                      <th className="py-2 px-2 border-r border-slate-300 text-center">જાતિ</th>
                      <th className="py-2 px-2 border-r border-slate-300 text-center">જન્મ તારીખ</th>
                      <th className="py-2 px-2.5 border-r border-slate-300">પિતા/વાલીનું નામ</th>
                      <th className="py-2 px-2 border-r border-slate-300 text-center">મોબાઈલ</th>
                      <th className="py-2 px-2.5 border-r border-slate-300">ગામ/ફળિયું</th>
                      <th className="py-2 px-2 text-center">વાંચેલા પુસ્તકો</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filtered.map((s, idx) => {
                      const readCount = circulations.filter(
                        (c) => c.studentId === s.id && c.status === 'returned'
                      ).length;
                      return (
                        <tr key={s.id} className="hover:bg-slate-50">
                          <td className="py-2 px-2 border-r border-slate-300 text-center font-mono">{idx + 1}</td>
                          <td className="py-2 px-2 border-r border-slate-300 text-center font-mono font-medium">{s.grNo}</td>
                          <td className="py-2 px-2 border-r border-slate-300 text-center font-mono">{s.rollNo}</td>
                          <td className="py-2 px-2.5 border-r border-slate-300 font-medium text-slate-900">{s.name}</td>
                          <td className="py-2 px-2 border-r border-slate-300 text-center font-mono">
                            ધોરણ {s.standard} ({s.division})
                          </td>
                          <td className="py-2 px-2 border-r border-slate-300 text-center">
                            {s.gender === 'boy' ? 'કુમાર' : 'કન્યા'}
                          </td>
                          <td className="py-2 px-2 border-r border-slate-300 text-center font-mono">{s.dob || '-'}</td>
                          <td className="py-2 px-2.5 border-r border-slate-300">{s.parentName || '-'}</td>
                          <td className="py-2 px-2 border-r border-slate-300 text-center font-mono">{s.mobile || '-'}</td>
                          <td className="py-2 px-2.5 border-r border-slate-300">{s.address || '-'}</td>
                          <td className="py-2 px-2 text-center font-mono font-bold text-orange-700">{readCount}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              );
            })()}
          </div>
        )}

        {/* 3. OVERDUE REGISTER TABLE */}
        {activeReport === 'overdue' && (
          <div className="overflow-x-auto">
            {(() => {
              const overdues = circulations.filter(
                (c) => (c.status === 'issued' || c.status === 'overdue') && c.dueDate < today
              );
              if (overdues.length === 0) {
                return (
                  <div className="py-8 text-center text-slate-500">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                    <p className="font-medium text-sm">હાલ કોઈ પુસ્તક વિલંબિત (બાકી) નથી.</p>
                  </div>
                );
              }
              return (
                <table className="w-full text-left text-xs border-collapse border border-slate-300">
                  <thead className="bg-red-50 text-red-950 font-bold">
                    <tr className="border-b border-slate-300">
                      <th className="py-2 px-2 border-r border-slate-300 w-10 text-center">ક્રમ</th>
                      <th className="py-2 px-2.5 border-r border-slate-300">વિદ્યાર્થીનું નામ</th>
                      <th className="py-2 px-2 border-r border-slate-300 text-center">ધોરણ</th>
                      <th className="py-2 px-2 border-r border-slate-300 text-center">GR નં</th>
                      <th className="py-2 px-2.5 border-r border-slate-300">પુસ્તકનું નામ (નંબર)</th>
                      <th className="py-2 px-2 border-r border-slate-300 text-center">આપ્યા તારીખ</th>
                      <th className="py-2 px-2 border-r border-slate-300 text-center">પરત કરવાની તારીખ</th>
                      <th className="py-2 px-2 border-r border-slate-300 text-center">વિલંબ દિવસો</th>
                      <th className="py-2 px-2.5">નોંધ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {overdues.map((rec, idx) => {
                      const diffTime = Math.abs(
                        new Date(today).getTime() - new Date(rec.dueDate).getTime()
                      );
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                      return (
                        <tr key={rec.id} className="hover:bg-slate-50">
                          <td className="py-2 px-2 border-r border-slate-300 text-center font-mono">{idx + 1}</td>
                          <td className="py-2 px-2.5 border-r border-slate-300 font-bold text-slate-900">{rec.studentName}</td>
                          <td className="py-2 px-2 border-r border-slate-300 text-center font-mono">ધોરણ {rec.studentStandard}</td>
                          <td className="py-2 px-2 border-r border-slate-300 text-center font-mono">{rec.studentGrNo}</td>
                          <td className="py-2 px-2.5 border-r border-slate-300 font-medium">
                            {rec.bookTitle} <span className="text-slate-500 font-mono">({rec.bookNo})</span>
                          </td>
                          <td className="py-2 px-2 border-r border-slate-300 text-center font-mono">{rec.issueDate}</td>
                          <td className="py-2 px-2 border-r border-slate-300 text-center font-mono text-red-600 font-bold">
                            {rec.dueDate}
                          </td>
                          <td className="py-2 px-2 border-r border-slate-300 text-center font-mono font-bold text-red-600">
                            +{diffDays} દિવસ
                          </td>
                          <td className="py-2 px-2.5 text-slate-600 text-[11px]">{rec.remarks || 'તાકીદ કરવી'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              );
            })()}
          </div>
        )}

        {/* 4. STOCK REGISTER TABLE */}
        {activeReport === 'stock' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse border border-slate-300">
              <thead className="bg-slate-100 text-slate-800 font-bold">
                <tr className="border-b border-slate-300">
                  <th className="py-2 px-2 border-r border-slate-300 w-10 text-center">ક્રમ</th>
                  <th className="py-2 px-2 border-r border-slate-300 text-center">દાખલ નં</th>
                  <th className="py-2 px-2.5 border-r border-slate-300">પુસ્તકનું નામ</th>
                  <th className="py-2 px-2.5 border-r border-slate-300">લેખક</th>
                  <th className="py-2 px-2 border-r border-slate-300 text-center">વિભાગ</th>
                  <th className="py-2 px-2 border-r border-slate-300 text-center">યોગ્ય ધોરણ</th>
                  <th className="py-2 px-2 border-r border-slate-300 text-center">કુલ નકલો</th>
                  <th className="py-2 px-2 border-r border-slate-300 text-center">ઉપલબ્ધ નકલો</th>
                  <th className="py-2 px-2.5">કબાટ / સેલ્ફ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {books.map((b, idx) => (
                  <tr key={b.id} className="hover:bg-slate-50">
                    <td className="py-2 px-2 border-r border-slate-300 text-center font-mono">{idx + 1}</td>
                    <td className="py-2 px-2 border-r border-slate-300 text-center font-mono font-semibold">{b.bookNo}</td>
                    <td className="py-2 px-2.5 border-r border-slate-300 font-medium text-slate-900">{b.title}</td>
                    <td className="py-2 px-2.5 border-r border-slate-300 text-slate-700">{b.author}</td>
                    <td className="py-2 px-2 border-r border-slate-300 text-center">{b.category}</td>
                    <td className="py-2 px-2 border-r border-slate-300 text-center">{b.targetStandard}</td>
                    <td className="py-2 px-2 border-r border-slate-300 text-center font-mono">{b.copies}</td>
                    <td className="py-2 px-2 border-r border-slate-300 text-center font-mono font-bold text-emerald-700">
                      {b.availableCopies}
                    </td>
                    <td className="py-2 px-2.5 text-slate-600">{b.shelfLocation || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Official Signature Lines at the bottom of printed page */}
        <div className="mt-12 pt-8 flex items-end justify-between text-xs text-slate-800">
          <div className="text-center">
            <div className="w-40 border-b border-slate-800 mb-1"></div>
            <p className="font-semibold">{schoolInfo.librarianName || 'પુસ્તકાલય પ્રભારી'}</p>
            <p className="text-[11px] text-slate-500">ધારીયા પ્રાથમિક શાળા</p>
          </div>

          <div className="text-center">
            <div className="w-40 border-b border-slate-800 mb-1"></div>
            <p className="font-semibold">{schoolInfo.principalName || 'મુખ્ય શિક્ષક / આચાર્યશ્રી'}</p>
            <p className="text-[11px] text-slate-500">ધારીયા પ્રાથમિક શાળા (કોડ: {schoolInfo.diseCode})</p>
          </div>
        </div>
      </div>

      {/* System Data Management & Backup Card (no-print) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4 no-print">
        <h3 className="text-base font-bold text-slate-900">
          સંપૂર્ણ ડેટા સુરક્ષા અને બેકઅપ (System Backup & Restore)
        </h3>
        <p className="text-xs text-slate-500">
          કમ્પ્યુટર બદલતી વખતે અથવા રેકોર્ડ સાચવી રાખવા માટે ફાઇલ ડાઉનલોડ કરી રાખો.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={() => downloadSystemBackup(students, books, circulations, schoolInfo)}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
          >
            <Download className="w-4 h-4 text-amber-300" />
            <span>બેકઅપ ફાઈલ ડાઉનલોડ કરો (.JSON)</span>
          </button>

          <label className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-medium cursor-pointer">
            <Upload className="w-4 h-4 text-blue-600" />
            <span>બેકઅપ ફાઈલ રિસ્ટોર કરો</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          <button
            onClick={() => {
              if (
                window.confirm(
                  'શું તમે ખરેખર સિસ્ટમને મૂળ ડેમો ડેટા પર રીસેટ કરવા માંગો છો?'
                )
              ) {
                onResetData();
              }
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-slate-500 hover:text-red-700 hover:bg-red-50 rounded-lg text-xs font-medium cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>મૂળ નમૂના ડેટા રીસેટ કરો</span>
          </button>
        </div>
      </div>
    </div>
  );
};
