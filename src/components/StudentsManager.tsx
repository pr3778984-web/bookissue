import React, { useState } from 'react';
import { CirculationRecord, Student } from '../types';
import { generateAvatar } from '../data/initialData';
import {
  Users,
  Search,
  Plus,
  Trash2,
  Edit2,
  Eye,
  Camera,
  BookOpen,
  Phone,
  MapPin,
  Calendar,
  IdCard,
  CheckCircle,
  AlertCircle,
  X,
  Upload,
} from 'lucide-react';

interface StudentsManagerProps {
  students: Student[];
  circulations: CirculationRecord[];
  selectedStandard: number | null;
  onSelectStandard: (std: number | null) => void;
  onAddStudent: (student: Student) => void;
  onUpdateStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
  onIssueBookToStudent: (student: Student) => void;
  onReturnBook: (record: CirculationRecord) => void;
  onPrintStudentCard: (student: Student) => void;
}

export const StudentsManager: React.FC<StudentsManagerProps> = ({
  students,
  circulations,
  selectedStandard,
  onSelectStandard,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onIssueBookToStudent,
  onReturnBook,
  onPrintStudentCard,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState<'all' | 'boy' | 'girl'>('all');

  // Modal states
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [detailStudent, setDetailStudent] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<Student>>({
    name: '',
    grNo: '',
    rollNo: 1,
    standard: 1,
    division: 'A',
    gender: 'boy',
    dob: '2018-01-01',
    parentName: '',
    mobile: '',
    address: 'ધારીયા ગામ',
    category: 'SEBC',
    photoUrl: generateAvatar('boy', 1),
    notes: '',
  });

  // Filter students
  const filteredStudents = students.filter((s) => {
    if (selectedStandard !== null && s.standard !== selectedStandard) return false;
    if (genderFilter !== 'all' && s.gender !== genderFilter) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchName = s.name.toLowerCase().includes(q);
      const matchGr = s.grNo.toLowerCase().includes(q);
      const matchRoll = String(s.rollNo).includes(q);
      const matchMobile = s.mobile.toLowerCase().includes(q);
      const matchAddress = s.address.toLowerCase().includes(q);
      return matchName || matchGr || matchRoll || matchMobile || matchAddress;
    }
    return true;
  });

  const handleOpenAdd = () => {
    setEditingStudent(null);
    const initialStd = selectedStandard || 1;
    setFormData({
      id: 'std-' + Date.now(),
      grNo: String(1400 + students.length + 1),
      rollNo: students.filter((s) => s.standard === initialStd).length + 1,
      name: '',
      standard: initialStd,
      division: 'A',
      gender: 'boy',
      dob: '2017-06-01',
      parentName: '',
      mobile: '',
      address: 'ધારીયા',
      category: 'SEBC',
      photoUrl: generateAvatar('boy', Math.floor(Math.random() * 20)),
      notes: '',
    });
    setIsAddEditModalOpen(true);
  };

  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({ ...student });
    setIsAddEditModalOpen(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim() || !formData.grNo?.trim()) {
      alert('કૃપા કરીને વિદ્યાર્થીનું નામ અને જનરલ રજીસ્ટર (GR) નંબર દાખલ કરો.');
      return;
    }

    if (editingStudent) {
      onUpdateStudent(formData as Student);
    } else {
      const newStudent: Student = {
        ...(formData as Student),
        id: 'std-' + Date.now(),
      };
      onAddStudent(newStudent);
    }
    setIsAddEditModalOpen(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('ફોટો સાઈઝ 2MB કરતાં ઓછી હોવી જોઈએ.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, photoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRegenerateAvatar = () => {
    const g = formData.gender || 'boy';
    const newAvatar = generateAvatar(g, Math.floor(Math.random() * 50));
    setFormData((prev) => ({ ...prev, photoUrl: newAvatar }));
  };

  return (
    <div className="space-y-6">
      {/* Header & Title bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            ધોરણ ૧ થી ૮ વિદ્યાર્થી વ્યવસ્થાપન (Students Directory)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            બાળકોના ફોટા સાથે સંપૂર્ણ માહિતી, પુસ્તક આપ્યા/પરત આપ્યાની તારીખ અને લાઇબ્રેરી કાર્ડ
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs sm:text-sm font-semibold shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>નવું બાળક ઉમેરો (Add Student)</span>
          </button>
        </div>
      </div>

      {/* Standard-wise Filter Tabs (ધોરણ ૧ થી ૮) */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => onSelectStandard(null)}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap cursor-pointer transition-colors ${
              selectedStandard === null
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            તમામ ધોરણ ({students.length})
          </button>

          {[1, 2, 3, 4, 5, 6, 7, 8].map((std) => {
            const count = students.filter((s) => s.standard === std).length;
            const isSelected = selectedStandard === std;
            return (
              <button
                key={std}
                onClick={() => onSelectStandard(std)}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-orange-600 text-white shadow-xs font-semibold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                ધોરણ {std} <span className="font-mono text-xs opacity-90">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search and Secondary Filter Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="વિદ્યાર્થીનું નામ, જી.આર. નં, મોબાઈલ કે ફળિયું શોધો..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Gender Filter */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs">
            <button
              onClick={() => setGenderFilter('all')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                genderFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs font-medium'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              બધા
            </button>
            <button
              onClick={() => setGenderFilter('boy')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                genderFilter === 'boy'
                  ? 'bg-white text-blue-700 shadow-2xs font-medium'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              કુમાર
            </button>
            <button
              onClick={() => setGenderFilter('girl')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                genderFilter === 'girl'
                  ? 'bg-white text-pink-700 shadow-2xs font-medium'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              કન્યા
            </button>
          </div>

          <span className="text-xs text-slate-500 font-mono">
            મળ્યા: {filteredStudents.length}
          </span>
        </div>
      </div>

      {/* Students Card / Grid View */}
      {filteredStudents.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-800">કોઈ વિદ્યાર્થી મળ્યા નથી</h3>
          <p className="text-xs text-slate-500 mt-1">
            શોધ માપદંડ બદલો અથવા આ ધોરણમાં નવો વિદ્યાર્થી ઉમેરો.
          </p>
          <button
            onClick={handleOpenAdd}
            className="mt-4 px-3.5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-semibold"
          >
            + વિદ્યાર્થી ઉમેરો
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((student) => {
            // Find active book issue for this student
            const activeBook = circulations.find(
              (c) => c.studentId === student.id && (c.status === 'issued' || c.status === 'overdue')
            );
            const totalReadCount = circulations.filter(
              (c) => c.studentId === student.id && c.status === 'returned'
            ).length;

            return (
              <div
                key={student.id}
                className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top card row: photo + main info */}
                  <div className="flex items-start gap-3.5">
                    <div className="relative shrink-0">
                      <img
                        src={student.photoUrl}
                        alt={student.name}
                        className="w-16 h-16 rounded-xl object-cover border border-slate-200 bg-slate-100 shadow-2xs"
                        referrerPolicy="no-referrer"
                      />
                      <span
                        className={`absolute -bottom-1 -right-1 text-[10px] px-1.5 py-0.2 rounded font-mono font-medium ${
                          student.gender === 'boy'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-pink-100 text-pink-800'
                        }`}
                      >
                        {student.gender === 'boy' ? 'કુમાર' : 'કન્યા'}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-orange-100 text-orange-800">
                          ધોરણ {student.standard} ({student.division})
                        </span>
                        <span className="text-xs font-mono text-slate-500">
                          રોલ: {student.rollNo}
                        </span>
                      </div>

                      <h3 className="font-bold text-slate-900 text-sm mt-1 line-clamp-1">
                        {student.name}
                      </h3>

                      <div className="text-xs text-slate-500 font-mono mt-0.5">
                        GR નં: <strong>{student.grNo}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Student Details / Meta */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">વાલીનું નામ:</span>
                      <span className="font-medium truncate max-w-[170px]">{student.parentName || '-'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">મોબાઈલ:</span>
                      <span className="font-mono">{student.mobile || '-'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">ફળિયું/ગામ:</span>
                      <span className="truncate max-w-[170px]">{student.address || '-'}</span>
                    </div>
                  </div>

                  {/* Active Book Status (પુસ્તક આપ્યાની / પરત આપ્યાની વિગત) */}
                  <div className="mt-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                    {activeBook ? (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-orange-800 flex items-center gap-1">
                            <BookOpen className="w-3.5 h-3.5 text-orange-600" />
                            હાલ ઉધાર પુસ્તક:
                          </span>
                          <span className="font-mono text-[10px] bg-orange-200 text-orange-900 px-1 rounded">
                            {activeBook.bookNo}
                          </span>
                        </div>
                        <div className="font-medium text-slate-900 line-clamp-1">
                          {activeBook.bookTitle}
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-600 font-mono pt-1">
                          <span>આપ્યા: {activeBook.issueDate}</span>
                          <span
                            className={
                              activeBook.dueDate < new Date().toISOString().slice(0, 10)
                                ? 'text-red-600 font-bold'
                                : 'text-slate-700'
                            }
                          >
                            પરત: {activeBook.dueDate}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-slate-500">
                        <span className="flex items-center gap-1 text-[11px]">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          હાલ કોઈ પુસ્તક બાકી નથી
                        </span>
                        <span className="text-[11px] font-mono">
                          વાંચ્યા: {totalReadCount}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setDetailStudent(student)}
                      title="સંપૂર્ણ માહિતી જુઓ"
                      className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 hover:text-slate-900 cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onPrintStudentCard(student)}
                      title="લાઇબ્રેરી કાર્ડ પ્રિન્ટ કરો"
                      className="p-1.5 rounded-md hover:bg-amber-50 text-amber-700 hover:text-amber-800 cursor-pointer"
                    >
                      <IdCard className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(student)}
                      title="વિગત સુધારો"
                      className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 hover:text-slate-900 cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setStudentToDelete(student)}
                      title="વિદ્યાર્થી દૂર કરો (Delete)"
                      className="p-1.5 rounded-md hover:bg-red-50 text-red-600 hover:text-red-700 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    {activeBook ? (
                      <button
                        onClick={() => onReturnBook(activeBook)}
                        className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-md cursor-pointer"
                      >
                        પરત જમા લો
                      </button>
                    ) : (
                      <button
                        onClick={() => onIssueBookToStudent(student)}
                        className="px-2.5 py-1 text-xs font-semibold bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 rounded-md cursor-pointer"
                      >
                        + પુસ્તક આપો
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ADD / EDIT STUDENT MODAL */}
      {isAddEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-xl my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-lg font-bold text-slate-900">
                {editingStudent ? 'વિદ્યાર્થીની માહિતી સુધારો' : 'નવો વિદ્યાર્થી ઉમેરો (Add Student)'}
              </h3>
              <button
                onClick={() => setIsAddEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="space-y-4">
              {/* Photo section */}
              <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <img
                  src={formData.photoUrl}
                  alt="Student Avatar"
                  className="w-16 h-16 rounded-xl object-cover border border-slate-300 bg-white"
                />
                <div className="space-y-1.5 flex-1">
                  <div className="text-xs font-semibold text-slate-800">
                    બાળકનો ફોટો (Photo)
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <label className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-medium cursor-pointer">
                      <Upload className="w-3.5 h-3.5" />
                      <span>ફોટો અપલોડ કરો</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={handleRegenerateAvatar}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-medium cursor-pointer"
                    >
                      અવતાર બદલો
                    </button>
                  </div>
                </div>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Full Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    વિદ્યાર્થીનું પૂરું નામ * (અટક નામ પિતાનું નામ)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="દા.ત. બારિયા રોહિતકુમાર રમેશભાઈ"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>

                {/* GR Number */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    જનરલ રજીસ્ટર (GR) નં. *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="દા.ત. 1420"
                    value={formData.grNo || ''}
                    onChange={(e) => setFormData({ ...formData, grNo: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>

                {/* Standard (ધોરણ ૧ થી ૮) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ધોરણ * (Standard 1 to 8)
                  </label>
                  <select
                    value={formData.standard || 1}
                    onChange={(e) =>
                      setFormData({ ...formData, standard: parseInt(e.target.value, 10) })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>
                        ધોરણ {s}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Roll No */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    હાજરી / રોલ નંબર *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    required
                    value={formData.rollNo || 1}
                    onChange={(e) =>
                      setFormData({ ...formData, rollNo: parseInt(e.target.value, 10) || 1 })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>

                {/* Division */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    વર્ગ (Division)
                  </label>
                  <select
                    value={formData.division || 'A'}
                    onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                  >
                    <option value="A">વર્ગ A</option>
                    <option value="B">વર્ગ B</option>
                  </select>
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    જાતિ (Gender) *
                  </label>
                  <select
                    value={formData.gender || 'boy'}
                    onChange={(e) => {
                      const g = e.target.value as 'boy' | 'girl';
                      setFormData({
                        ...formData,
                        gender: g,
                        photoUrl: generateAvatar(g, Math.floor(Math.random() * 20)),
                      });
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                  >
                    <option value="boy">કુમાર (Boy)</option>
                    <option value="girl">કન્યા (Girl)</option>
                  </select>
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    જન્મ તારીખ (Date of Birth)
                  </label>
                  <input
                    type="date"
                    value={formData.dob || ''}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono"
                  />
                </div>

                {/* Parent / Guardian Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    વાલીનું / પિતાનું નામ
                  </label>
                  <input
                    type="text"
                    placeholder="દા.ત. રમેશભાઈ બારિયા"
                    value={formData.parentName || ''}
                    onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>

                {/* Mobile */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    મોબાઈલ નંબર
                  </label>
                  <input
                    type="tel"
                    placeholder="દા.ત. 98791 23411"
                    value={formData.mobile || ''}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono"
                  />
                </div>

                {/* Address / Faliya */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    સરનામું / ફળિયું
                  </label>
                  <input
                    type="text"
                    placeholder="દા.ત. ધારીયા ગામ, નિશાળ ફળિયું"
                    value={formData.address || ''}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    જાતિ વર્ગ (Category)
                  </label>
                  <select
                    value={formData.category || 'SEBC'}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                  >
                    <option value="SEBC">SEBC / OBC (બક્ષીપંચ)</option>
                    <option value="ST">ST (અનુસૂચિત જનજાતિ)</option>
                    <option value="SC">SC (અનુસૂચિત જાતિ)</option>
                    <option value="General">સામાન્ય (General)</option>
                  </select>
                </div>

                {/* Special Notes */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    વિશેષ નોંધ (વાંચન શોખ વગેરે)
                  </label>
                  <input
                    type="text"
                    placeholder="દા.ત. વાર્તા પુસ્તકો વાંચે છે"
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddEditModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  રદ કરો (Cancel)
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs sm:text-sm font-semibold shadow-xs cursor-pointer"
                >
                  {editingStudent ? 'સુધારો સાચવો' : 'બાળક ઉમેરો'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STUDENT FULL DETAILS DRAWER / MODAL */}
      {detailStudent && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-xl my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-lg font-bold text-slate-900">
                બાળકની સંપૂર્ણ માહિતી પત્રક
              </h3>
              <button
                onClick={() => setDetailStudent(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Header */}
            <div className="flex items-center gap-4 p-4 bg-orange-50/60 border border-orange-200 rounded-xl">
              <img
                src={detailStudent.photoUrl}
                alt={detailStudent.name}
                className="w-20 h-20 rounded-xl object-cover border border-orange-200 bg-white shadow-2xs"
              />
              <div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-orange-200 text-orange-900 font-mono">
                  GR: {detailStudent.grNo} · રોલ નં: {detailStudent.rollNo}
                </span>
                <h4 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
                  {detailStudent.name}
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  ધારીયા પ્રાથમિક શાળા · <strong>ધોરણ {detailStudent.standard} (વર્ગ {detailStudent.division})</strong>
                </p>
              </div>
            </div>

            {/* Detailed Table */}
            <div className="mt-4 border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs sm:text-sm">
              <div className="grid grid-cols-2 p-2.5 bg-slate-50">
                <span className="text-slate-500 font-medium">જાતિ:</span>
                <span className="font-semibold text-slate-800">
                  {detailStudent.gender === 'boy' ? 'કુમાર (Boy)' : 'કન્યા (Girl)'}
                </span>
              </div>
              <div className="grid grid-cols-2 p-2.5">
                <span className="text-slate-500 font-medium">જન્મ તારીખ:</span>
                <span className="font-mono text-slate-800">{detailStudent.dob || '-'}</span>
              </div>
              <div className="grid grid-cols-2 p-2.5 bg-slate-50">
                <span className="text-slate-500 font-medium">પિતા / વાલીનું નામ:</span>
                <span className="text-slate-800">{detailStudent.parentName || '-'}</span>
              </div>
              <div className="grid grid-cols-2 p-2.5">
                <span className="text-slate-500 font-medium">મોબાઈલ નંબર:</span>
                <span className="font-mono text-slate-800">{detailStudent.mobile || '-'}</span>
              </div>
              <div className="grid grid-cols-2 p-2.5 bg-slate-50">
                <span className="text-slate-500 font-medium">સરનામું / ફળિયું:</span>
                <span className="text-slate-800">{detailStudent.address || '-'}</span>
              </div>
              <div className="grid grid-cols-2 p-2.5">
                <span className="text-slate-500 font-medium">જાતિ વર્ગ (Category):</span>
                <span className="text-slate-800">{detailStudent.category || '-'}</span>
              </div>
              {detailStudent.notes && (
                <div className="grid grid-cols-2 p-2.5 bg-slate-50">
                  <span className="text-slate-500 font-medium">વિશેષ નોંધ:</span>
                  <span className="text-slate-800">{detailStudent.notes}</span>
                </div>
              )}
            </div>

            {/* Reading and Circulation History for this student */}
            <div className="mt-5">
              <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                પુસ્તક આપ-લે ઇતિહાસ (આપ્યા તારીખ / પરત તારીખ)
              </h5>
              {(() => {
                const history = circulations.filter((c) => c.studentId === detailStudent.id);
                if (history.length === 0) {
                  return (
                    <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-lg">
                      હજુ સુધી કોઈ પુસ્તક ઈશ્યુ થયેલ નથી.
                    </p>
                  );
                }
                return (
                  <div className="border border-slate-200 rounded-lg overflow-x-auto text-xs max-h-48 overflow-y-auto">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 sticky top-0">
                        <tr>
                          <th className="py-2 px-2.5">પુસ્તકનું નામ</th>
                          <th className="py-2 px-2.5">આપ્યા તારીખ</th>
                          <th className="py-2 px-2.5">પરત તારીખ</th>
                          <th className="py-2 px-2.5">સ્થિતિ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {history.map((h) => (
                          <tr key={h.id}>
                            <td className="py-2 px-2.5 font-medium text-slate-800">
                              {h.bookTitle}
                              <span className="block text-[10px] text-slate-400 font-mono">
                                નં: {h.bookNo}
                              </span>
                            </td>
                            <td className="py-2 px-2.5 font-mono text-slate-600">{h.issueDate}</td>
                            <td className="py-2 px-2.5 font-mono text-slate-600">
                              {h.returnDate ? (
                                <span className="text-emerald-700">{h.returnDate}</span>
                              ) : (
                                <span className="text-orange-700 font-medium">
                                  બાકી (નિયત: {h.dueDate})
                                </span>
                              )}
                            </td>
                            <td className="py-2 px-2.5">
                              {h.status === 'returned' ? (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium">
                                  જમા થયેલ
                                </span>
                              ) : (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-100 text-orange-800 font-medium">
                                  વાંચવા આપેલ
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>

            {/* Bottom Actions */}
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => {
                  onPrintStudentCard(detailStudent);
                }}
                className="px-3.5 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <IdCard className="w-4 h-4" />
                <span>લાઇબ્રેરી કાર્ડ પ્રિન્ટ કરો</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setDetailStudent(null);
                    handleOpenEdit(detailStudent);
                  }}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  સુધારો (Edit)
                </button>
                <button
                  onClick={() => {
                    setDetailStudent(null);
                    onIssueBookToStudent(detailStudent);
                  }}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  + પુસ્તક ઈશ્યુ કરો
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 text-center">
              વિદ્યાર્થીને યાદીમાંથી દૂર કરવા માંગો છો?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 text-center mt-1">
              વિદ્યાર્થી: <strong>{studentToDelete.name}</strong> (ધોરણ {studentToDelete.standard}, GR: {studentToDelete.grNo})
            </p>
            <p className="text-xs text-red-600 text-center mt-2">
              આ પ્રક્રિયાથી વિદ્યાર્થીનો રેકોર્ડ કાયમ માટે હટી જશે.
            </p>

            <div className="flex items-center justify-center gap-3 mt-5 pt-3 border-t border-slate-100">
              <button
                onClick={() => setStudentToDelete(null)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                રદ કરો (Cancel)
              </button>
              <button
                onClick={() => {
                  onDeleteStudent(studentToDelete.id);
                  setStudentToDelete(null);
                }}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs sm:text-sm font-semibold cursor-pointer"
              >
                હા, દૂર કરો (Delete)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
