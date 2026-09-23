import React from 'react';
import { SchoolInfo } from '../types';
import { BookOpen, Users, ArrowLeftRight, FileText, Plus, Landmark, Database } from 'lucide-react';

interface HeaderProps {
  activeTab: 'dashboard' | 'students' | 'books' | 'circulation' | 'reports';
  setActiveTab: (tab: 'dashboard' | 'students' | 'books' | 'circulation' | 'reports') => void;
  schoolInfo: SchoolInfo;
  onQuickIssue: () => void;
  onBackup: () => void;
  issuedCount: number;
  overdueCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  schoolInfo,
  onQuickIssue,
  onBackup,
  issuedCount,
  overdueCount,
}) => {
  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs no-print">
      {/* Top Government School Header Banner */}
      <div className="bg-gradient-to-r from-amber-700 via-orange-700 to-amber-800 text-white px-4 sm:px-6 py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-amber-400/20 flex items-center justify-center border border-amber-300/40 text-amber-200">
              <Landmark className="w-3.5 h-3.5" />
            </div>
            <span className="font-medium tracking-wide">
              ગુજરાત સરકાર શિક્ષણ વિભાગ · તા. હાલોલ, જિ. પંચમહાલ
            </span>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <span className="bg-amber-950/40 px-2.5 py-0.5 rounded border border-amber-500/30">
              શાળા ડાયસ કોડ: <strong className="text-amber-200 font-semibold">{schoolInfo.diseCode}</strong>
            </span>
            <button
              onClick={onBackup}
              title="સંપૂર્ણ ડેટા બેકઅપ ડાઉનલોડ કરો"
              className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-white/10 hover:bg-white/20 transition-colors text-white cursor-pointer"
            >
              <Database className="w-3.5 h-3.5 text-amber-300" />
              <span>બેકઅપ લો</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main School Title & Action Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* School Logo & Title */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-md shadow-orange-600/20 shrink-0">
            <BookOpen className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {schoolInfo.name}
              </h1>
              <span className="text-xs px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-medium">
                પુસ્તકાલય વ્યવસ્થાપન
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 flex items-center gap-2 mt-0.5">
              <span>ધોરણ ૧ થી ૮</span>
              <span aria-hidden="true">·</span>
              <span>{schoolInfo.taluka}</span>
              <span aria-hidden="true">·</span>
              <span>જિ. {schoolInfo.district}</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-600 font-mono">કોડ: {schoolInfo.diseCode}</span>
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button
            onClick={onQuickIssue}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>પુસ્તક આપો (ઈશ્યુ કરો)</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <nav className="flex space-x-1 sm:space-x-2 border-t border-slate-100 overflow-x-auto py-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-orange-50 text-orange-700 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>મુખ્ય ડેશબોર્ડ</span>
          </button>

          <button
            onClick={() => setActiveTab('students')}
            className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'students'
                ? 'bg-orange-50 text-orange-700 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>બાળકો (ધોરણ ૧ થી ૮)</span>
          </button>

          <button
            onClick={() => setActiveTab('books')}
            className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'books'
                ? 'bg-orange-50 text-orange-700 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>પુસ્તક ભંડાર (સ્ટોક)</span>
          </button>

          <button
            onClick={() => setActiveTab('circulation')}
            className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'circulation'
                ? 'bg-orange-50 text-orange-700 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span>પુસ્તક આપ-લે રજીસ્ટર</span>
            {issuedCount > 0 && (
              <span className="ml-1 text-xs px-1.5 py-0.2 bg-orange-200 text-orange-800 rounded-full font-mono">
                {issuedCount}
              </span>
            )}
            {overdueCount > 0 && (
              <span className="text-xs px-1.5 py-0.2 bg-red-100 text-red-700 rounded-full font-mono">
                {overdueCount} બાકી
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'reports'
                ? 'bg-orange-50 text-orange-700 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>અહેવાલો અને પ્રિન્ટ પત્રકો</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
