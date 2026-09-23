export interface Student {
  id: string;
  grNo: string; // જનરલ રજીસ્ટર નંબર
  rollNo: number; // રોલ નંબર
  name: string; // વિદ્યાર્થીનું પૂરું નામ
  standard: number; // ધોરણ ૧ થી ૮ (1 to 8)
  division: string; // વર્ગ (A, B)
  gender: 'boy' | 'girl'; // કુમાર / કન્યા
  dob: string; // જન્મ તારીખ (YYYY-MM-DD)
  parentName: string; // પિતા / વાલીનું નામ
  mobile: string; // મોબાઈલ નંબર
  address: string; // ગામ / ફળિયું
  photoUrl: string; // ફોટો (Base64 અથવા અવતાર)
  category?: string; // જાતિ વર્ગ (ST, SC, SEBC/OBC, General)
  admissionDate?: string; // પ્રવેશ તારીખ
  aadharNo?: string; // આધાર નંબર
  notes?: string; // વિશેષ નોંધ
}

export interface Book {
  id: string;
  bookNo: string; // પુસ્તક ક્રમાંક / એક્સેસન નં.
  title: string; // પુસ્તકનું નામ
  author: string; // લેખક / રચયિતા
  category: string; // વિષય / વિભાગ (બાળવાર્તા, વિજ્ઞાન, મહાપુરુષો, સામાન્ય જ્ઞાન, વગેરે)
  targetStandard: string; // યોગ્ય ધોરણ (દા.ત. ધોરણ ૧ થી ૫, ધોરણ ૬ થી ૮, તમામ)
  copies: number; // કુલ નકલો
  availableCopies: number; // હાલ ઉપલબ્ધ નકલો
  shelfLocation?: string; // કબાટ / સેલ્ફ નં.
  publisher?: string; // પ્રકાશક
  price?: number; // કિંમત
}

export interface CirculationRecord {
  id: string;
  studentId: string;
  studentName: string;
  studentStandard: number;
  studentGrNo: string;
  studentRollNo?: number;
  bookId: string;
  bookTitle: string;
  bookNo: string;
  issueDate: string; // પુસ્તક આપ્યાની તારીખ (YYYY-MM-DD)
  dueDate: string; // પરત આપવાની નિયત તારીખ (YYYY-MM-DD)
  returnDate?: string | null; // ખરેખર પરત જમા કરાવ્યાની તારીખ
  status: 'issued' | 'returned' | 'overdue';
  remarks?: string; // શિક્ષકનો શેરો / નોંધ
  condition?: 'good' | 'damaged' | 'fair';
}

export interface SchoolInfo {
  name: string;
  englishName: string;
  diseCode: string;
  taluka: string;
  district: string;
  state: string;
  cluster: string;
  address: string;
  contactNumber?: string;
  principalName?: string;
  librarianName?: string;
}
