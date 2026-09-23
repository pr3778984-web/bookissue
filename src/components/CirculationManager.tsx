import React, { useState } from 'react';
import { Book, CirculationRecord, Student } from '../types';
import {
  ArrowLeftRight,
  Search,
  Plus,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Filter,
  RefreshCw,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { exportToCSV } from '../utils/storage';

interface CirculationManagerProps {
  circulations: CirculationRecord[];
  students: Student[];
  books: Book[];
  onIssueBook: (record: Omit<CirculationRecord, 'id'>) => void;
  onReturnBook: (recordId: string, returnDate: string, remarks?: string, condition?: 'good' | 'damaged' | 'fair') => void;
  onRenewBook: (recordId: string, newDueDate: string) => void;
  preselectedStudent?: Student | null;
  isOpenIssueModal: boolean;
  setIsOpenIssueModal: (open: boolean) => void;
}

export const CirculationManager: React.FC<CirculationManagerProps> = ({
  circulations,
  students,
  books,
  onIssueBook,
  onReturnBook,
  onRenewBook,
  preselectedStudent,
  isOpenIssueModal,
  setIsOpenIssueModal,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'issued' | 'overdue' | 'returned'>('issued');
  const [selectedStandard, setSelectedStandard] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Return modal state
  const [returnTargetRecord, setReturnTargetRecord] = useState<CirculationRecord | null>(null);
  const [returnDateInput, setReturnDateInput] = useState(new Date().toISOString().slice(0, 10));
  const [returnRemarks, setReturnRemarks] = useState('');
  const [returnCondition, setReturnCondition] = useState<'good' | 'fair' | 'damaged'>('good');

  // Issue modal state
  const [issueStandard, setIssueStandard] = useState<number>(preselectedStudent?.standard || 1);
  const [issueStudentId, setIssueStudentId] = useState<string>(preselectedStudent?.id || '');
  const [issueBookId, setIssueBookId] = useState<string>('');
  const [issueDate, setIssueDate] = useState<string>(new Date().toISOString().slice(0, 10));
  // Default due date: +7 days from now
  const defaultDue = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const [dueDate, setDueDate] = useState<string>(defaultDue);
  const [issueRemarks, setIssueRemarks] = useState<string>('');

  const today = new Date().toISOString().slice(0, 10);

  // Filter circulations
  const filteredCirculations = circulations.filter((record) => {
    // Status filter
    if (activeFilter === 'issued') {
      if (record.status !== 'issued' && record.status !== 'overdue') return false;
    } else if (activeFilter === 'overdue') {
      const isPastDue = (record.status === 'issued' || record.status === 'overdue') && record.dueDate < today;
      if (!isPastDue) return false;
    } else if (activeFilter === 'returned') {
      if (record.status !== 'returned') return false;
    }

    // Standard filter
    if (selectedStandard !== 'all' && record.studentStandard !== selectedStandard) {
      return false;
    }

    // Search query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchStudent = record.studentName.toLowerCase().includes(q);
      const matchGr = record.studentGrNo.toLowerCase().includes(q);
      const matchBook = record.bookTitle.toLowerCase().includes(q);
      const matchBookNo = record.bookNo.toLowerCase().includes(q);
      return matchStudent || matchGr || matchBook || matchBookNo;
    }

    return true;
  });

  // Open Issue Modal with reset/pre-filled values
  const handleOpenIssueModal = () => {
    if (preselectedStudent) {
      setIssueStandard(preselectedStudent.standard);
      setIssueStudentId(preselectedStudent.id);
    } else {
      const firstStd = students.length > 0 ? students[0].standard : 1;
      setIssueStandard(firstStd);
      const stdStudents = students.filter((s) => s.standard === firstStd);
      setIssueStudentId(stdStudents.length > 0 ? stdStudents[0].id : '');
    }
    const availBooks = books.filter((b) => b.availableCopies > 0);
    setIssueBookId(availBooks.length > 0 ? availBooks[0].id : '');
    setIssueDate(new Date().toISOString().slice(0, 10));
    setDueDate(defaultDue);
    setIssueRemarks('');
    setIsOpenIssueModal(true);
  };

  const handleStandardChangeInModal = (std: number) => {
    setIssueStandard(std);
    const stdStudents = students.filter((s) => s.standard === std);
    setIssueStudentId(stdStudents.length > 0 ? stdStudents[0].id : '');
  };

  const handleSubmitIssue = (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find((s) => s.id === issueStudentId);
    const book = books.find((b) => b.id === issueBookId);

    if (!student || !book) {
      alert('કૃપા કરીને વિદ્યાર્થી અને પુસ્તક બંને પસંદ કરો.');
      return;
    }

    if (book.availableCopies <= 0) {
      alert('આ પુસ્તકની કોઈ નકલ હાલ ઉપલબ્ધ નથી.');
      return;
    }

    onIssueBook({
      studentId: student.id,
      studentName: student.name,
      studentStandard: student.standard,
      studentGrNo: student.grNo,
      studentRollNo: student.rollNo,
      bookId: book.id,
      bookTitle: book.title,
      bookNo: book.bookNo,
      issueDate,
      dueDate,
      returnDate: null,
      status: 'issued',
      remarks: issueRemarks,
      condition: 'good',
    });

    setIsOpenIssueModal(false);
  };

  const handleOpenReturnModal = (record: CirculationRecord) => {
    setReturnTargetRecord(record);
    setReturnDateInput(new Date().toISOString().slice(0, 10));
    setReturnRemarks(record.remarks || '');
    setReturnCondition('good');
  };

  const handleSubmitReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (returnTargetRecord) {
      onReturnBook(returnTargetRecord.id, returnDateInput, returnRemarks, returnCondition);
      setReturnTargetRecord(null);
    }
  };

  const handleQuickRenew = (record: CirculationRecord) => {
    const current = new Date(record.dueDate);
    current.setDate(current.getDate() + 7);
    const newDueDate = current.toISOString().slice(0, 10);
    onRenewBook(record.id, newDueDate);
  };

  const handleExportCSV = () => {
    const headers = [
      'આપ-લે આઈડી',
      'વિદ્યાર્થીનું નામ',
      'ધોરણ',
      'GR નંબર',
      'પુસ્તકનું નામ',
      'પુસ્તક ક્રમાંક',
      'આપ્યાની તારીખ (Issue Date)',
      'પરત કરવાની તારીખ (Due Date)',
      'ખરેખર પરત આપ્યાની તારીખ (Return Date)',
      'સ્થિતિ (Status)',
      'શેરો / નોંધ',
    ];

    const rows = filteredCirculations.map((c) => [
      c.id,
      c.studentName,
      `ધોરણ ${c.studentStandard}`,
      c.studentGrNo,
      c.bookTitle,
      c.bookNo,
      c.issueDate,
      c.dueDate,
      c.returnDate || 'બાકી',
      c.status === 'returned' ? 'પરત જમા' : c.dueDate < today ? 'મુદત વીતી ગઈ' : 'વાંચવા આપેલ',
      c.remarks || '',
    ]);

    exportToCSV(`dhariya_school_circulation_register_${today}.csv`, headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Title & Action header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            પુસ્તક આપ-લે રજીસ્ટર (Book Circulation Register)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            બાળકોને પુસ્તક આપ્યાની તારીખ, પરત કરવાની તારીખ અને જમા લેવાનો દૈનિક વહીવટ
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs sm:text-sm font-medium cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>CSV / Excel એક્સપોર્ટ</span>
          </button>

          <button
            onClick={handleOpenIssueModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs sm:text-sm font-semibold shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ નવું પુસ્તક ઈશ્યુ કરો</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
        {/* Status Segmented Control */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs sm:text-sm overflow-x-auto">
            <button
              onClick={() => setActiveFilter('issued')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                activeFilter === 'issued'
                  ? 'bg-white text-orange-700 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              હાલ વાંચવા આપેલ (
              {circulations.filter((c) => c.status === 'issued' || c.status === 'overdue').length})
            </button>
            <button
              onClick={() => setActiveFilter('overdue')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                activeFilter === 'overdue'
                  ? 'bg-white text-red-700 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              મુદત વીતી ગયેલ (
              {
                circulations.filter(
                  (c) => (c.status === 'issued' || c.status === 'overdue') && c.dueDate < today
                ).length
              }
              )
            </button>
            <button
              onClick={() => setActiveFilter('returned')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                activeFilter === 'returned'
                  ? 'bg-white text-emerald-700 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              પરત જમા થયેલ ({circulations.filter((c) => c.status === 'returned').length})
            </button>
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              તમામ રેકોર્ડ ({circulations.length})
            </button>
          </div>

          {/* Standard Dropdown */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">ધોરણ:</span>
            <select
              value={selectedStandard}
              onChange={(e) =>
                setSelectedStandard(e.target.value === 'all' ? 'all' : parseInt(e.target.value, 10))
              }
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 focus:outline-none"
            >
              <option value="all">બધા ધોરણ (૧ થી ૮)</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={s}>
                  ધોરણ {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="વિદ્યાર્થીનું નામ, જી.આર. નં, પુસ્તકનું નામ કે પુસ્તક નં. થી શોધો..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
          />
        </div>
      </div>

      {/* Circulation Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        {filteredCirculations.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <ArrowLeftRight className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium">કોઈ આપ-લે રેકોર્ડ મળ્યો નથી.</p>
            <p className="text-xs text-slate-400 mt-1">
              નવું પુસ્તક આપવા માટે &quot;નવું પુસ્તક ઈશ્યુ કરો&quot; બટન દબાવો.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="py-3 px-3 sm:px-4">વિદ્યાર્થી વિગત</th>
                  <th className="py-3 px-3 sm:px-4">પુસ્તકની વિગત</th>
                  <th className="py-3 px-3 sm:px-4">આપ્યાની તારીખ</th>
                  <th className="py-3 px-3 sm:px-4">પરત કરવાની તારીખ</th>
                  <th className="py-3 px-3 sm:px-4">ખરેખર પરત તારીખ</th>
                  <th className="py-3 px-3 sm:px-4">સ્થિતિ</th>
                  <th className="py-3 px-3 sm:px-4 text-right">કાર્યવાહી</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCirculations.map((record) => {
                  const isOverdue =
                    (record.status === 'issued' || record.status === 'overdue') &&
                    record.dueDate < today;
                  return (
                    <tr key={record.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Student info */}
                      <td className="py-3 px-3 sm:px-4">
                        <div className="font-bold text-slate-900">{record.studentName}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                          <span className="font-medium text-orange-700">
                            ધોરણ {record.studentStandard}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono">GR: {record.studentGrNo}</span>
                          {record.studentRollNo && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="font-mono">રોલ: {record.studentRollNo}</span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Book info */}
                      <td className="py-3 px-3 sm:px-4">
                        <div className="font-medium text-slate-800">{record.bookTitle}</div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">
                          દાખલ નં: <strong className="text-slate-700">{record.bookNo}</strong>
                        </div>
                      </td>

                      {/* Issue Date */}
                      <td className="py-3 px-3 sm:px-4 font-mono text-slate-700">
                        {record.issueDate}
                      </td>

                      {/* Due Date */}
                      <td className="py-3 px-3 sm:px-4">
                        <span
                          className={`font-mono font-medium ${
                            isOverdue ? 'text-red-600 font-bold' : 'text-slate-700'
                          }`}
                        >
                          {record.dueDate}
                        </span>
                        {isOverdue && (
                          <div className="text-[11px] text-red-600 font-medium flex items-center gap-1 mt-0.5">
                            <AlertTriangle className="w-3 h-3" />
                            <span>મુદત વીતી ગયેલ</span>
                          </div>
                        )}
                      </td>

                      {/* Actual Return Date */}
                      <td className="py-3 px-3 sm:px-4 font-mono">
                        {record.returnDate ? (
                          <span className="text-emerald-700 font-medium">
                            {record.returnDate}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">બાકી છે</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 sm:px-4">
                        {record.status === 'returned' ? (
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-medium">
                            <CheckCircle2 className="w-3 h-3" />
                            જમા થયેલ
                          </span>
                        ) : isOverdue ? (
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-800 font-medium">
                            <Clock className="w-3 h-3" />
                            વિલંબિત
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 font-medium">
                            વાંચવા આપેલ
                          </span>
                        )}
                        {record.remarks && (
                          <div className="text-[11px] text-slate-400 mt-1 truncate max-w-[150px]" title={record.remarks}>
                            {record.remarks}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 sm:px-4 text-right">
                        {record.status !== 'returned' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleQuickRenew(record)}
                              title="મુદત ૭ દિવસ લંબાવો (+7 Days)"
                              className="p-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md cursor-pointer"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleOpenReturnModal(record)}
                              className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg cursor-pointer shadow-2xs"
                            >
                              પરત જમા લો
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">સંપન્ન</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ISSUE BOOK MODAL */}
      {isOpenIssueModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-xl my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-lg font-bold text-slate-900">
                બાળકને પુસ્તક આપો (Issue Book)
              </h3>
              <button
                onClick={() => setIsOpenIssueModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitIssue} className="space-y-4">
              {/* Step 1: Choose Standard 1 to 8 */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ૧. વિદ્યાર્થીનું ધોરણ પસંદ કરો * (Standard 1 to 8)
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleStandardChangeInModal(s)}
                      className={`py-2 text-xs font-semibold rounded-lg border cursor-pointer transition-colors ${
                        issueStandard === s
                          ? 'bg-orange-600 text-white border-orange-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      ધોરણ {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Choose Student in that standard */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ૨. ધોરણ {issueStandard} ના બાળકનું નામ પસંદ કરો *
                </label>
                {(() => {
                  const stdStudents = students.filter((s) => s.standard === issueStandard);
                  if (stdStudents.length === 0) {
                    return (
                      <p className="text-xs text-red-600 p-2 bg-red-50 rounded-lg">
                        આ ધોરણમાં કોઈ વિદ્યાર્થી નોંધાયેલ નથી. કૃપા કરીને પહેલા વિદ્યાર્થી ઉમેરો.
                      </p>
                    );
                  }
                  return (
                    <select
                      required
                      value={issueStudentId}
                      onChange={(e) => setIssueStudentId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    >
                      {stdStudents.map((s) => (
                        <option key={s.id} value={s.id}>
                          રોલ {s.rollNo}: {s.name} (GR: {s.grNo})
                        </option>
                      ))}
                    </select>
                  );
                })()}
              </div>

              {/* Step 3: Choose Book */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ૩. પુસ્તકાલયમાંથી પુસ્તક પસંદ કરો *
                </label>
                <select
                  required
                  value={issueBookId}
                  onChange={(e) => setIssueBookId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                >
                  {books.map((b) => (
                    <option
                      key={b.id}
                      value={b.id}
                      disabled={b.availableCopies <= 0}
                    >
                      {b.bookNo}: {b.title} ({b.category}) — ઉપલબ્ધ: {b.availableCopies} નકલ
                      {b.availableCopies <= 0 ? ' [સ્ટોક નથી]' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Step 4: Issue Date & Return Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    પુસ્તક આપ્યાની તારીખ (Issue Date) *
                  </label>
                  <input
                    type="date"
                    required
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    પરત આપવાની નિયત તારીખ (Due Date) *
                  </label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono"
                  />
                  <div className="flex items-center gap-1.5 mt-1">
                    <button
                      type="button"
                      onClick={() => {
                        const d = new Date(issueDate);
                        d.setDate(d.getDate() + 7);
                        setDueDate(d.toISOString().slice(0, 10));
                      }}
                      className="text-[11px] text-orange-700 hover:underline cursor-pointer"
                    >
                      +૭ દિવસ
                    </button>
                    <span className="text-slate-300">·</span>
                    <button
                      type="button"
                      onClick={() => {
                        const d = new Date(issueDate);
                        d.setDate(d.getDate() + 14);
                        setDueDate(d.toISOString().slice(0, 10));
                      }}
                      className="text-[11px] text-orange-700 hover:underline cursor-pointer"
                    >
                      +૧૪ દિવસ
                    </button>
                  </div>
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  શેરો / વિશેષ નોંધ (વૈકલ્પિક)
                </label>
                <input
                  type="text"
                  placeholder="દા.ત. વાચન સપ્તાહ અંતર્ગત આપેલું છે"
                  value={issueRemarks}
                  onChange={(e) => setIssueRemarks(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsOpenIssueModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  રદ કરો (Cancel)
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs sm:text-sm font-semibold shadow-xs cursor-pointer"
                >
                  પુસ્તક ઈશ્યુ કરો (Confirm Issue)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RETURN BOOK MODAL */}
      {returnTargetRecord && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-lg font-bold text-slate-900">પુસ્તક પરત જમા લો</h3>
              <button
                onClick={() => setReturnTargetRecord(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReturn} className="space-y-4">
              {/* Record Summary */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                <div>
                  <span className="text-slate-500">વિદ્યાર્થી: </span>
                  <strong className="text-slate-900">{returnTargetRecord.studentName}</strong> (ધોરણ {returnTargetRecord.studentStandard})
                </div>
                <div>
                  <span className="text-slate-500">પુસ્તક: </span>
                  <strong className="text-slate-900">{returnTargetRecord.bookTitle}</strong> (નં: {returnTargetRecord.bookNo})
                </div>
                <div>
                  <span className="text-slate-500">આપ્યાની તારીખ: </span>
                  <span className="font-mono text-slate-700">{returnTargetRecord.issueDate}</span>
                </div>
              </div>

              {/* Return Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ખરેખર પરત આપ્યાની તારીખ (Return Date) *
                </label>
                <input
                  type="date"
                  required
                  value={returnDateInput}
                  onChange={(e) => setReturnDateInput(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono"
                />
              </div>

              {/* Book Condition */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  પરત સમયે પુસ્તકની સ્થિતિ
                </label>
                <select
                  value={returnCondition}
                  onChange={(e) => setReturnCondition(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                >
                  <option value="good">ઉત્તમ / સારી સ્થિતિ (Good Condition)</option>
                  <option value="fair">સામાન્ય સ્થિતિ (Fair Condition)</option>
                  <option value="damaged">ક્ષતિગ્રસ્ત / પાનું ફાટેલ (Damaged)</option>
                </select>
              </div>

              {/* Return Remarks */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  શિક્ષકનો શેરો / અભિપ્રાય
                </label>
                <input
                  type="text"
                  placeholder="દા.ત. સંપૂર્ણ વાંચીને સમયસર પરત કર્યું"
                  value={returnRemarks}
                  onChange={(e) => setReturnRemarks(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReturnTargetRecord(null)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  રદ કરો
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs sm:text-sm font-semibold cursor-pointer"
                >
                  પરત જમા લો (Complete Return)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
