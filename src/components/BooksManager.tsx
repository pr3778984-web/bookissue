import React, { useState } from 'react';
import { Book } from '../types';
import {
  BookOpen,
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Layers,
  ArrowUpRight,
} from 'lucide-react';

interface BooksManagerProps {
  books: Book[];
  onAddBook: (book: Book) => void;
  onUpdateBook: (book: Book) => void;
  onDeleteBook: (id: string) => void;
  onQuickIssueBook: (book: Book) => void;
}

export const BooksManager: React.FC<BooksManagerProps> = ({
  books,
  onAddBook,
  onUpdateBook,
  onDeleteBook,
  onQuickIssueBook,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<Book>>({
    bookNo: '',
    title: '',
    author: '',
    category: 'બાળવાર્તા',
    targetStandard: 'ધોરણ ૧ થી ૮',
    copies: 3,
    availableCopies: 3,
    shelfLocation: 'કબાટ A',
    publisher: '',
    price: 80,
  });

  const categories = [
    'all',
    'બાળવાર્તા',
    'વિજ્ઞાન',
    'મહાપુરુષો',
    'સામાન્ય જ્ઞાન',
    'રમુજી વાર્તા',
    'બાળસાહિત્ય',
    'ગણિત',
    'દેશભક્તિ',
  ];

  const filteredBooks = books.filter((book) => {
    if (selectedCategory !== 'all' && book.category !== selectedCategory) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchTitle = book.title.toLowerCase().includes(q);
      const matchAuthor = book.author.toLowerCase().includes(q);
      const matchNo = book.bookNo.toLowerCase().includes(q);
      const matchCat = book.category.toLowerCase().includes(q);
      return matchTitle || matchAuthor || matchNo || matchCat;
    }
    return true;
  });

  const handleOpenAdd = () => {
    setEditingBook(null);
    const nextNo = 'LIB-' + (100 + books.length + 1);
    setFormData({
      id: 'book-' + Date.now(),
      bookNo: nextNo,
      title: '',
      author: '',
      category: 'બાળવાર્તા',
      targetStandard: 'ધોરણ ૧ થી ૫',
      copies: 4,
      availableCopies: 4,
      shelfLocation: 'કબાટ A - ખાનું ૧',
      publisher: '',
      price: 90,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (book: Book) => {
    setEditingBook(book);
    setFormData({ ...book });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim() || !formData.bookNo?.trim()) {
      alert('કૃપા કરીને પુસ્તકનું નામ અને દાખલ નંબર લખો.');
      return;
    }

    if (editingBook) {
      onUpdateBook(formData as Book);
    } else {
      const newBook: Book = {
        ...(formData as Book),
        id: 'book-' + Date.now(),
      };
      onAddBook(newBook);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Title & Action header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            પુસ્તકાલય સ્ટોક અને કેટોલોગ (Library Books Catalog)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            ધારીયા પ્રાથમિક શાળાના તમામ ઉપલબ્ધ પુસ્તકો, કબાટ વિગત અને નકલ સંખ્યા
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs sm:text-sm font-semibold shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ નવું પુસ્તક ઉમેરો (Add Book)</span>
        </button>
      </div>

      {/* Category Pills & Search */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
        {/* Category filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap cursor-pointer transition-colors ${
                selectedCategory === cat
                  ? 'bg-orange-600 text-white shadow-2xs font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'all' ? `બધા વિષય (${books.length})` : cat}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="પુસ્તકનું નામ, લેખક કે દાખલ નંબર (દા.ત. LIB-101) થી શોધો..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
          />
        </div>
      </div>

      {/* Books Grid */}
      {filteredBooks.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-800">કોઈ પુસ્તક મળ્યું નથી</h3>
          <p className="text-xs text-slate-500 mt-1">શોધ શબ્દ બદલો અથવા નવું પુસ્તક ઉમેરો.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBooks.map((book) => {
            const isOutOfStock = book.availableCopies <= 0;
            return (
              <div
                key={book.id}
                className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-semibold border border-slate-200">
                      {book.bookNo}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-orange-50 text-orange-800 font-medium">
                      {book.category}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base mt-2 line-clamp-1">
                    {book.title}
                  </h3>

                  <p className="text-xs text-slate-500 mt-0.5">
                    લેખક: <span className="font-medium text-slate-700">{book.author || '-'}</span>
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">યોગ્ય ધોરણ:</span>
                      <span className="font-medium text-slate-800">{book.targetStandard}</span>
                    </div>
                    {book.shelfLocation && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">કબાટ / સેલ્ફ:</span>
                        <span className="text-slate-800">{book.shelfLocation}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">ઉપલબ્ધ નકલો:</span>
                      <span
                        className={`font-mono font-bold ${
                          isOutOfStock ? 'text-red-600' : 'text-emerald-700'
                        }`}
                      >
                        {book.availableCopies} / {book.copies} હાજર
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card footer actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(book)}
                      title="વિગત સુધારો"
                      className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setBookToDelete(book)}
                      title="પુસ્તક દૂર કરો"
                      className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    disabled={isOutOfStock}
                    onClick={() => onQuickIssueBook(book)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                      isOutOfStock
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-orange-600 hover:bg-orange-700 text-white shadow-2xs'
                    }`}
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>{isOutOfStock ? 'સ્ટોક નથી' : 'બાળકને આપો'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ADD / EDIT BOOK MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-xl my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-lg font-bold text-slate-900">
                {editingBook ? 'પુસ્તકની માહિતી સુધારો' : 'નવું પુસ્તક ઉમેરો (Add Book)'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    પુસ્તકનું નામ * (Book Title)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="દા.ત. પંચતંત્રની બોધવાર્તાઓ"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    દાખલ / એક્સેસન નં. *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="દા.ત. LIB-115"
                    value={formData.bookNo || ''}
                    onChange={(e) => setFormData({ ...formData, bookNo: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    લેખક / રચયિતા
                  </label>
                  <input
                    type="text"
                    placeholder="દા.ત. જીવરામ જોષી"
                    value={formData.author || ''}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    વિષય / વિભાગ (Category)
                  </label>
                  <select
                    value={formData.category || 'બાળવાર્તા'}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                  >
                    <option value="બાળવાર્તા">બાળવાર્તા</option>
                    <option value="વિજ્ઞાન">વિજ્ઞાન</option>
                    <option value="મહાપુરુષો">મહાપુરુષો</option>
                    <option value="સામાન્ય જ્ઞાન">સામાન્ય જ્ઞાન</option>
                    <option value="રમુજી વાર્તા">રમુજી વાર્તા</option>
                    <option value="બાળસાહિત્ય">બાળસાહિત્ય</option>
                    <option value="ગણિત">ગણિત</option>
                    <option value="દેશભક્તિ">દેશભક્તિ</option>
                    <option value="અન્ય">અન્ય</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    યોગ્ય ધોરણ
                  </label>
                  <input
                    type="text"
                    placeholder="દા.ત. ધોરણ ૧ થી ૫"
                    value={formData.targetStandard || ''}
                    onChange={(e) => setFormData({ ...formData, targetStandard: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    કુલ નકલો (Copies)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.copies || 1}
                    onChange={(e) => {
                      const c = parseInt(e.target.value, 10) || 1;
                      setFormData({ ...formData, copies: c, availableCopies: c });
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    કબાટ / ખાના નં. (Location)
                  </label>
                  <input
                    type="text"
                    placeholder="દા.ત. કબાટ A - ખાનું ૨"
                    value={formData.shelfLocation || ''}
                    onChange={(e) => setFormData({ ...formData, shelfLocation: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  રદ કરો
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs sm:text-sm font-semibold cursor-pointer"
                >
                  {editingBook ? 'સુધારો સાચવો' : 'પુસ્તક ઉમેરો'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION */}
      {bookToDelete && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-xl">
            <h3 className="text-base font-bold text-slate-900 text-center">
              આ પુસ્તક દૂર કરવા માંગો છો?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 text-center mt-1">
              પુસ્તક: <strong>{bookToDelete.title}</strong> (નં: {bookToDelete.bookNo})
            </p>
            <div className="flex items-center justify-center gap-3 mt-4 pt-3 border-t border-slate-100">
              <button
                onClick={() => setBookToDelete(null)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs sm:text-sm font-medium text-slate-600"
              >
                રદ કરો
              </button>
              <button
                onClick={() => {
                  onDeleteBook(bookToDelete.id);
                  setBookToDelete(null);
                }}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs sm:text-sm font-semibold"
              >
                હા, દૂર કરો
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
