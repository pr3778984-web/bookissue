import React from 'react';
import { Book, CirculationRecord, Student } from '../types';
import {
  Users,
  BookOpen,
  ArrowUpRight,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Clock,
  Plus,
} from 'lucide-react';

interface DashboardViewProps {
  students: Student[];
  books: Book[];
  circulations: CirculationRecord[];
  onSelectStandard: (std: number) => void;
  onOpenIssueModal: () => void;
  onOpenAddStudent: () => void;
  onOpenAddBook: () => void;
  onReturnBook: (record: CirculationRecord) => void;
  onViewStudent: (student: Student) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  students,
  books,
  circulations,
  onSelectStandard,
  onOpenIssueModal,
  onOpenAddStudent,
  onOpenAddBook,
  onReturnBook,
  onViewStudent,
}) => {
  // Calculations
  const activeIssues = circulations.filter((c) => c.status === 'issued' || c.status === 'overdue');
  const today = new Date().toISOString().slice(0, 10);
  const overdueIssues = circulations.filter(
    (c) => (c.status === 'issued' || c.status === 'overdue') && c.dueDate < today
  );
  const returnedIssues = circulations.filter((c) => c.status === 'returned');

  const totalCopies = books.reduce((sum, b) => sum + (b.copies || 0), 0);
  const availableCopies = books.reduce((sum, b) => sum + (b.availableCopies || 0), 0);

  // Standard-wise student count
  const standards = [1, 2, 3, 4, 5, 6, 7, 8];
  const countByStandard = standards.map((std) => ({
    std,
    count: students.filter((s) => s.standard === std).length,
    activeIssuedCount: activeIssues.filter((c) => c.studentStandard === std).length,
  }));

  return (
    <div className="space-y-6">
      {/* Top Banner Notice for Dhariya Primary School */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-amber-950">
            ધારીયા પ્રાથમિક શાળા પુસ્તકાલય વ્યવસ્થાપન પેનલ
          </h2>
          <p className="text-xs sm:text-sm text-amber-800 mt-1">
            ડાયસ કોડ: <strong>24170302303</strong> · તા. હાલોલ, જિ. પંચમહાલ | ધોરણ ૧ થી ૮ ના બાળકોના પુસ્તક આપ-લે અને રેકોર્ડ માટે.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenIssueModal}
            className="px-3.5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>પુસ્તક ઈશ્યુ કરો</span>
          </button>
          <button
            onClick={onOpenAddStudent}
            className="px-3.5 py-2 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Users className="w-4 h-4 text-amber-700" />
            <span>બાળક ઉમેરો</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Students */}
        <div className="bg-white border border-slate-200 rounded-xl p-4.5 shadow-2xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">કુલ વિદ્યાર્થીઓ (૧ થી ૮)</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-slate-900 tabular-nums">
              {students.length}
            </span>
            <span className="text-xs text-slate-500">બાળકો નોંધાયેલ</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
            <span>ધોરણ ૧ થી ૮ માં વહેંચાયેલા</span>
          </div>
        </div>

        {/* Card 2: Books */}
        <div className="bg-white border border-slate-200 rounded-xl p-4.5 shadow-2xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">પુસ્તકાલય સ્ટોક</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-slate-900 tabular-nums">
              {totalCopies}
            </span>
            <span className="text-xs text-slate-500">કુલ પુસ્તકો ({books.length} ટાઇટલ)</span>
          </div>
          <div className="mt-2 text-xs text-emerald-700 flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{availableCopies} પુસ્તકો હાલ ઉપલબ્ધ</span>
          </div>
        </div>

        {/* Card 3: Active Issued */}
        <div className="bg-white border border-slate-200 rounded-xl p-4.5 shadow-2xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">હાલ વાંચવા આપેલા પુસ્તકો</span>
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-700 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-orange-600 tabular-nums">
              {activeIssues.length}
            </span>
            <span className="text-xs text-slate-500">બાળકો પાસે છે</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            કુલ જમા થયેલા: <strong className="text-slate-700 font-mono">{returnedIssues.length}</strong>
          </div>
        </div>

        {/* Card 4: Overdue */}
        <div className="bg-white border border-slate-200 rounded-xl p-4.5 shadow-2xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">મુદત વીતી ગયેલ (બાકી)</span>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-red-600 tabular-nums">
              {overdueIssues.length}
            </span>
            <span className="text-xs text-slate-500">પરત કરવાના બાકી</span>
          </div>
          <div className="mt-2 text-xs text-red-700 font-medium">
            {overdueIssues.length > 0 ? 'તાત્કાલિક જમા લેવા જરૂરી' : 'કોઈ વિલંબ નથી'}
          </div>
        </div>
      </div>

      {/* Standard-wise Distribution Grid (ધોરણ ૧ થી ૮) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              ધોરણ વાઈઝ બાળકો અને પુસ્તક વિતરણ (ધોરણ ૧ થી ૮)
            </h3>
            <p className="text-xs text-slate-500">
              કોઈપણ ધોરણ પર ક્લિક કરીને તે ધોરણના તમામ બાળકો જોઈ શકો છો
            </p>
          </div>
          <button
            onClick={onOpenAddStudent}
            className="text-xs font-semibold text-orange-700 hover:text-orange-800 flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>નવો વિદ્યાર્થી ઉમેરો</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {countByStandard.map(({ std, count, activeIssuedCount }) => (
            <button
              key={std}
              onClick={() => onSelectStandard(std)}
              className="text-left p-3.5 rounded-lg border border-slate-200 hover:border-orange-400 hover:bg-orange-50/50 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600 group-hover:text-orange-700">
                  ધોરણ {std}
                </span>
                <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 group-hover:bg-orange-100 group-hover:text-orange-800">
                  {count}
                </span>
              </div>
              <div className="mt-2 text-xs text-slate-500">
                <span>ઉધાર પુસ્તક: </span>
                <strong className={`font-mono ${activeIssuedCount > 0 ? 'text-orange-600 font-bold' : 'text-slate-600'}`}>
                  {activeIssuedCount}
                </strong>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Two-Column Section: Active Issued Books & Quick Action Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Active Circulation List (2 Columns) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                હાલ વાંચવા આપેલા પુસ્તકોની યાદી
              </h3>
              <p className="text-xs text-slate-500">
                વિદ્યાર્થી પાસેથી પુસ્તક પરત આવે ત્યારે &quot;પરત જમા લો&quot; બટન દબાવો
              </p>
            </div>
            <span className="text-xs font-mono bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md">
              કુલ: {activeIssues.length}
            </span>
          </div>

          {activeIssues.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <BookOpen className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-medium">હાલ કોઈ પુસ્તક ઉધાર આપેલું નથી.</p>
              <button
                onClick={onOpenIssueModal}
                className="mt-3 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold rounded-lg cursor-pointer"
              >
                + પુસ્તક ઈશ્યુ કરો
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/70">
                    <th className="py-2.5 px-3 font-semibold">બાળકનું નામ / ધોરણ</th>
                    <th className="py-2.5 px-3 font-semibold">પુસ્તકનું નામ</th>
                    <th className="py-2.5 px-3 font-semibold">આપ્યા તારીખ</th>
                    <th className="py-2.5 px-3 font-semibold">પરત તારીખ</th>
                    <th className="py-2.5 px-3 font-semibold text-right">કાર્યવાહી</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeIssues.slice(0, 6).map((record) => {
                    const isOverdue = record.dueDate < today;
                    return (
                      <tr key={record.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3">
                          <button
                            onClick={() => {
                              const s = students.find((st) => st.id === record.studentId);
                              if (s) onViewStudent(s);
                            }}
                            className="text-left font-medium text-slate-900 hover:text-orange-700 cursor-pointer"
                          >
                            <div>{record.studentName}</div>
                            <div className="text-[11px] text-slate-500 font-mono">
                              ધોરણ {record.studentStandard} · GR: {record.studentGrNo}
                            </div>
                          </button>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-medium text-slate-800">{record.bookTitle}</div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            નં: {record.bookNo}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-600">
                          {record.issueDate}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`font-mono font-medium ${
                              isOverdue ? 'text-red-600 font-bold' : 'text-slate-700'
                            }`}
                          >
                            {record.dueDate}
                          </span>
                          {isOverdue && (
                            <span className="block text-[10px] text-red-600 font-medium">
                              મુદત પૂરી
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => onReturnBook(record)}
                            className="px-2.5 py-1 text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-md font-medium cursor-pointer"
                          >
                            પરત જમા લો
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right: Quick Action & Guidance Panel */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
            <h3 className="text-base font-bold text-slate-900 mb-3">ઝડપી કાર્યો (Quick Actions)</h3>
            <div className="space-y-2.5">
              <button
                onClick={onOpenIssueModal}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-orange-200 bg-orange-50/50 hover:bg-orange-100 text-left text-orange-950 font-medium text-xs sm:text-sm cursor-pointer transition-colors"
              >
                <span className="flex items-center gap-2">
                  <ArrowUpRight className="w-4 h-4 text-orange-700" />
                  <span>નવું પુસ્તક ઈશ્યુ કરો</span>
                </span>
                <span className="text-xs text-orange-700">શરૂ કરો →</span>
              </button>

              <button
                onClick={onOpenAddStudent}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left text-slate-800 font-medium text-xs sm:text-sm cursor-pointer transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-600" />
                  <span>નવો વિદ્યાર્થી ઉમેરો</span>
                </span>
                <span className="text-xs text-slate-500">ઉમેરો →</span>
              </button>

              <button
                onClick={onOpenAddBook}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left text-slate-800 font-medium text-xs sm:text-sm cursor-pointer transition-colors"
              >
                <span className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-slate-600" />
                  <span>નવું પુસ્તક લાયબ્રેરીમાં ઉમેરો</span>
                </span>
                <span className="text-xs text-slate-500">ઉમેરો →</span>
              </button>
            </div>
          </div>

          {/* School Details Card */}
          <div className="bg-slate-900 text-white rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Clock className="w-3.5 h-3.5" />
              <span>શાળા વિગત</span>
            </div>
            <h4 className="text-base font-bold text-white">ધારીયા પ્રાથમિક શાળા</h4>
            <div className="mt-2 text-xs text-slate-300 space-y-1">
              <div>ડાયસ કોડ: <span className="font-mono text-amber-300 font-semibold">24170302303</span></div>
              <div>તાલુકો: હાલોલ · જિલ્લો: પંચમહાલ</div>
              <div>ધોરણ: ૧ થી ૮ (પ્રાથમિક શાળા)</div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>તારીખ: {today}</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                સિસ્ટમ સક્રિય
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
