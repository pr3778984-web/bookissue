import { Book, CirculationRecord, SchoolInfo, Student } from '../types';
import {
  INITIAL_BOOKS,
  INITIAL_CIRCULATIONS,
  INITIAL_SCHOOL_INFO,
  INITIAL_STUDENTS,
} from '../data/initialData';

const STORAGE_KEYS = {
  STUDENTS: 'dhariya_school_students_v1',
  BOOKS: 'dhariya_school_books_v1',
  CIRCULATIONS: 'dhariya_school_circulations_v1',
  SCHOOL_INFO: 'dhariya_school_info_v1',
};

export const loadStudents = (): Student[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
      return INITIAL_STUDENTS;
    }
    const data = JSON.parse(raw);
    return Array.isArray(data) && data.length > 0 ? data : INITIAL_STUDENTS;
  } catch (e) {
    console.error('Error loading students from localStorage:', e);
    return INITIAL_STUDENTS;
  }
};

export const saveStudents = (students: Student[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  } catch (e) {
    console.error('Error saving students to localStorage:', e);
  }
};

export const loadBooks = (): Book[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BOOKS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(INITIAL_BOOKS));
      return INITIAL_BOOKS;
    }
    const data = JSON.parse(raw);
    return Array.isArray(data) && data.length > 0 ? data : INITIAL_BOOKS;
  } catch (e) {
    console.error('Error loading books from localStorage:', e);
    return INITIAL_BOOKS;
  }
};

export const saveBooks = (books: Book[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(books));
  } catch (e) {
    console.error('Error saving books to localStorage:', e);
  }
};

export const loadCirculations = (): CirculationRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CIRCULATIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CIRCULATIONS, JSON.stringify(INITIAL_CIRCULATIONS));
      return INITIAL_CIRCULATIONS;
    }
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : INITIAL_CIRCULATIONS;
  } catch (e) {
    console.error('Error loading circulations from localStorage:', e);
    return INITIAL_CIRCULATIONS;
  }
};

export const saveCirculations = (circulations: CirculationRecord[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.CIRCULATIONS, JSON.stringify(circulations));
  } catch (e) {
    console.error('Error saving circulations to localStorage:', e);
  }
};

export const loadSchoolInfo = (): SchoolInfo => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SCHOOL_INFO);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SCHOOL_INFO, JSON.stringify(INITIAL_SCHOOL_INFO));
      return INITIAL_SCHOOL_INFO;
    }
    return JSON.parse(raw) || INITIAL_SCHOOL_INFO;
  } catch (e) {
    console.error('Error loading school info:', e);
    return INITIAL_SCHOOL_INFO;
  }
};

export const saveSchoolInfo = (info: SchoolInfo): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.SCHOOL_INFO, JSON.stringify(info));
  } catch (e) {
    console.error('Error saving school info:', e);
  }
};

// Export entire system backup as JSON
export const downloadSystemBackup = (
  students: Student[],
  books: Book[],
  circulations: CirculationRecord[],
  schoolInfo: SchoolInfo
): void => {
  const data = {
    exportedAt: new Date().toISOString(),
    schoolInfo,
    students,
    books,
    circulations,
  };
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
  const downloadAnchor = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadAnchor.setAttribute('href', jsonString);
  downloadAnchor.setAttribute('download', `dhariya_primary_school_library_backup_${dateStr}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
};

// UTF-8 CSV exporter with BOM so Excel displays Gujarati text correctly!
export const exportToCSV = (
  filename: string,
  headers: string[],
  rows: (string | number | undefined | null)[][]
): void => {
  const csvContent =
    '\uFEFF' +
    [
      headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(','),
      ...rows.map((row) =>
        row
          .map((item) => {
            const str = item === undefined || item === null ? '' : String(item);
            return `"${str.replace(/"/g, '""')}"`;
          })
          .join(',')
      ),
    ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
};
