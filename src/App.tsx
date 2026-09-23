import React, { useEffect, useState } from 'react';
import { Book, CirculationRecord, SchoolInfo, Student } from './types';
import {
  loadBooks,
  loadCirculations,
  loadSchoolInfo,
  loadStudents,
  saveBooks,
  saveCirculations,
  saveSchoolInfo,
  saveStudents,
  downloadSystemBackup,
} from './utils/storage';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { StudentsManager } from './components/StudentsManager';
import { BooksManager } from './components/BooksManager';
import { CirculationManager } from './components/CirculationManager';
import { ReportsAndPrintView } from './components/ReportsAndPrintView';
import { StudentLibraryCardModal } from './components/StudentLibraryCardModal';
import { INITIAL_BOOKS, INITIAL_CIRCULATIONS, INITIAL_SCHOOL_INFO, INITIAL_STUDENTS } from './data/initialData';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'students' | 'books' | 'circulation' | 'reports'>('dashboard');
  const [students, setStudents] = useState<Student[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [circulations, setCirculations] = useState<CirculationRecord[]>([]);
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo>(INITIAL_SCHOOL_INFO);

  // Filter state for students
  const [selectedStandard, setSelectedStandard] = useState<number | null>(null);

  // Issue modal controller
  const [isOpenIssueModal, setIsOpenIssueModal] = useState(false);
  const [preselectedStudent, setPreselectedStudent] = useState<Student | null>(null);

  // Library Card modal
  const [cardModalStudent, setCardModalStudent] = useState<Student | null>(null);

  // Initial load
  useEffect(() => {
    setStudents(loadStudents());
    setBooks(loadBooks());
    setCirculations(loadCirculations());
    setSchoolInfo(loadSchoolInfo());
  }, []);

  // Save changes to local storage
  const handleUpdateStudents = (newStudents: Student[]) => {
    setStudents(newStudents);
    saveStudents(newStudents);
  };

  const handleUpdateBooks = (newBooks: Book[]) => {
    setBooks(newBooks);
    saveBooks(newBooks);
  };

  const handleUpdateCirculations = (newCirculations: CirculationRecord[]) => {
    setCirculations(newCirculations);
    saveCirculations(newCirculations);
  };

  // Student CRUD actions
  const handleAddStudent = (newStudent: Student) => {
    const updated = [newStudent, ...students];
    handleUpdateStudents(updated);
  };

  const handleEditStudent = (updatedStudent: Student) => {
    const updated = students.map((s) => (s.id === updatedStudent.id ? updatedStudent : s));
    handleUpdateStudents(updated);
  };

  const handleDeleteStudent = (studentId: string) => {
    const updated = students.filter((s) => s.id !== studentId);
    handleUpdateStudents(updated);
  };

  // Book CRUD actions
  const handleAddBook = (newBook: Book) => {
    const updated = [newBook, ...books];
    handleUpdateBooks(updated);
  };

  const handleEditBook = (updatedBook: Book) => {
    const updated = books.map((b) => (b.id === updatedBook.id ? updatedBook : b));
    handleUpdateBooks(updated);
  };

  const handleDeleteBook = (bookId: string) => {
    const updated = books.filter((b) => b.id !== bookId);
    handleUpdateBooks(updated);
  };

  // Circulation Actions
  const handleIssueBook = (recordData: Omit<CirculationRecord, 'id'>) => {
    const newRecord: CirculationRecord = {
      ...recordData,
      id: 'circ-' + Date.now(),
    };

    // Decrement available copy
    const updatedBooks = books.map((b) => {
      if (b.id === recordData.bookId) {
        return {
          ...b,
          availableCopies: Math.max(0, b.availableCopies - 1),
        };
      }
      return b;
    });

    handleUpdateBooks(updatedBooks);
    handleUpdateCirculations([newRecord, ...circulations]);
  };

  const handleReturnBook = (
    recordId: string,
    returnDate: string,
    remarks?: string,
    condition?: 'good' | 'damaged' | 'fair'
  ) => {
    let returnedBookId: string | null = null;

    const updatedCirculations = circulations.map((c) => {
      if (c.id === recordId) {
        returnedBookId = c.bookId;
        return {
          ...c,
          returnDate,
          status: 'returned' as const,
          remarks: remarks || c.remarks,
          condition: condition || c.condition,
        };
      }
      return c;
    });

    // Increment available copy
    if (returnedBookId) {
      const updatedBooks = books.map((b) => {
        if (b.id === returnedBookId) {
          return {
            ...b,
            availableCopies: Math.min(b.copies, b.availableCopies + 1),
          };
        }
        return b;
      });
      handleUpdateBooks(updatedBooks);
    }

    handleUpdateCirculations(updatedCirculations);
  };

  const handleRenewBook = (recordId: string, newDueDate: string) => {
    const updated = circulations.map((c) => {
      if (c.id === recordId) {
        return {
          ...c,
          dueDate: newDueDate,
          status: 'issued' as const,
          remarks: (c.remarks ? c.remarks + ' | ' : '') + 'મુદત લંબાવી',
        };
      }
      return c;
    });
    handleUpdateCirculations(updated);
  };

  // Quick Issue handlers
  const handleOpenQuickIssueModal = (student?: Student) => {
    if (student) {
      setPreselectedStudent(student);
    } else {
      setPreselectedStudent(null);
    }
    setIsOpenIssueModal(true);
  };

  const handleQuickIssueBook = (book: Book) => {
    setActiveTab('circulation');
    setIsOpenIssueModal(true);
  };

  // System Backup & Reset
  const handleBackup = () => {
    downloadSystemBackup(students, books, circulations, schoolInfo);
  };

  const handleRestoreData = (data: any) => {
    if (Array.isArray(data.students)) handleUpdateStudents(data.students);
    if (Array.isArray(data.books)) handleUpdateBooks(data.books);
    if (Array.isArray(data.circulations)) handleUpdateCirculations(data.circulations);
    if (data.schoolInfo) {
      setSchoolInfo(data.schoolInfo);
      saveSchoolInfo(data.schoolInfo);
    }
  };

  const handleResetData = () => {
    handleUpdateStudents(INITIAL_STUDENTS);
    handleUpdateBooks(INITIAL_BOOKS);
    handleUpdateCirculations(INITIAL_CIRCULATIONS);
    setSchoolInfo(INITIAL_SCHOOL_INFO);
    saveSchoolInfo(INITIAL_SCHOOL_INFO);
  };

  // Stats calculation
  const today = new Date().toISOString().slice(0, 10);
  const issuedCount = circulations.filter((c) => c.status === 'issued' || c.status === 'overdue').length;
  const overdueCount = circulations.filter(
    (c) => (c.status === 'issued' || c.status === 'overdue') && c.dueDate < today
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* School Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        schoolInfo={schoolInfo}
        onQuickIssue={() => handleOpenQuickIssueModal()}
        onBackup={handleBackup}
        issuedCount={issuedCount}
        overdueCount={overdueCount}
      />

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            students={students}
            books={books}
            circulations={circulations}
            onSelectStandard={(std) => {
              setSelectedStandard(std);
              setActiveTab('students');
            }}
            onOpenIssueModal={() => handleOpenQuickIssueModal()}
            onOpenAddStudent={() => {
              setActiveTab('students');
            }}
            onOpenAddBook={() => {
              setActiveTab('books');
            }}
            onReturnBook={(record) => {
              handleReturnBook(record.id, today);
            }}
            onViewStudent={(student) => {
              setSelectedStandard(student.standard);
              setActiveTab('students');
            }}
          />
        )}

        {activeTab === 'students' && (
          <StudentsManager
            students={students}
            circulations={circulations}
            selectedStandard={selectedStandard}
            onSelectStandard={setSelectedStandard}
            onAddStudent={handleAddStudent}
            onUpdateStudent={handleEditStudent}
            onDeleteStudent={handleDeleteStudent}
            onIssueBookToStudent={(student) => handleOpenQuickIssueModal(student)}
            onReturnBook={(record) => handleReturnBook(record.id, today)}
            onPrintStudentCard={(student) => setCardModalStudent(student)}
          />
        )}

        {activeTab === 'books' && (
          <BooksManager
            books={books}
            onAddBook={handleAddBook}
            onUpdateBook={handleEditBook}
            onDeleteBook={handleDeleteBook}
            onQuickIssueBook={handleQuickIssueBook}
          />
        )}

        {activeTab === 'circulation' && (
          <CirculationManager
            circulations={circulations}
            students={students}
            books={books}
            onIssueBook={handleIssueBook}
            onReturnBook={handleReturnBook}
            onRenewBook={handleRenewBook}
            preselectedStudent={preselectedStudent}
            isOpenIssueModal={isOpenIssueModal}
            setIsOpenIssueModal={setIsOpenIssueModal}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsAndPrintView
            students={students}
            books={books}
            circulations={circulations}
            schoolInfo={schoolInfo}
            onRestoreData={handleRestoreData}
            onResetData={handleResetData}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 px-4 sm:px-6 text-center text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong className="text-slate-700">{schoolInfo.name}</strong> · તાલુકો: {schoolInfo.taluka}, જિલ્લો: {schoolInfo.district} (શાળા કોડ: <span className="font-mono">{schoolInfo.diseCode}</span>)
          </div>
          <div className="flex items-center gap-3">
            <span>ધોરણ ૧ થી ૮ લાયબ્રેરી રજીસ્ટર</span>
            <span aria-hidden="true">·</span>
            <span>સત્ર ૨૦૨૬-૨૭</span>
          </div>
        </div>
      </footer>

      {/* Printable Student Library Card Modal */}
      <StudentLibraryCardModal
        student={cardModalStudent}
        schoolInfo={schoolInfo}
        onClose={() => setCardModalStudent(null)}
      />
    </div>
  );
}
