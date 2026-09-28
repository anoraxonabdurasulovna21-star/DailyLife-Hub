import React, { useState } from 'react';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  Download,
  Trash2,
  Calendar,
  CreditCard,
  PieChart,
  DollarSign,
  Plus,
  Delete,
} from 'lucide-react';
import { Transaction, FinanceCategory, TransactionType } from '../types';
import {
  getTransactions,
  addTransaction,
  deleteTransaction,
  exportTransactionsCSV,
} from '../services/storage';
import {
  formatUzbekDate,
  getTodayString,
  getCurrentTimeString,
  getCurrentWeekRange,
} from '../utils/dateUtils';
import { calculateFinanceStats } from '../services/analyticsEngine';

type PeriodFilter = 'today' | 'week' | 'month' | 'all';

export const FinanceView: React.FC = () => {
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [prevVal, setPrevVal] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [resetDisplayOnNextDigit, setResetDisplayOnNextDigit] = useState(false);

  // Form state
  const today = getTodayString();
  const currentTime = getCurrentTimeString();
  const [txType, setTxType] = useState<TransactionType>('xarajat');
  const [category, setCategory] = useState<FinanceCategory>('Oziq-ovqat');
  const [description, setDescription] = useState('');
  const [txDate, setTxDate] = useState(today);
  const [paymentMethod, setPaymentMethod] = useState<'Karta' | 'Naqd' | 'Bank'>('Karta');

  // Filter
  const [period, setPeriod] = useState<PeriodFilter>('month');
  const [searchQuery, setSearchQuery] = useState('');

  const transactions = getTransactions();
  const weekRange = getCurrentWeekRange();

  // Calculator Logic
  const handleDigit = (digit: string) => {
    if (resetDisplayOnNextDigit || calcDisplay === '0') {
      setCalcDisplay(digit);
      setResetDisplayOnNextDigit(false);
    } else {
      if (calcDisplay.length < 12) {
        setCalcDisplay(calcDisplay + digit);
      }
    }
  };

  const handleDecimal = () => {
    if (resetDisplayOnNextDigit) {
      setCalcDisplay('0.');
      setResetDisplayOnNextDigit(false);
      return;
    }
    if (!calcDisplay.includes('.')) {
      setCalcDisplay(calcDisplay + '.');
    }
  };

  const handleOp = (op: string) => {
    setPrevVal(parseFloat(calcDisplay));
    setOperation(op);
    setResetDisplayOnNextDigit(true);
  };

  const handleEquals = () => {
    if (prevVal === null || !operation) return;
    const current = parseFloat(calcDisplay);
    let result = 0;
    if (operation === '+') result = prevVal + current;
    else if (operation === '−') result = prevVal - current;
    else if (operation === '×') result = prevVal * current;
    else if (operation === '÷') result = current !== 0 ? prevVal / current : 0;

    setCalcDisplay(String(Number(result.toFixed(2))));
    setPrevVal(null);
    setOperation(null);
    setResetDisplayOnNextDigit(true);
  };

  const handleClear = () => {
    setCalcDisplay('0');
    setPrevVal(null);
    setOperation(null);
    setResetDisplayOnNextDigit(false);
  };

  const handleBackspace = () => {
    if (calcDisplay.length > 1) {
      setCalcDisplay(calcDisplay.slice(0, -1));
    } else {
      setCalcDisplay('0');
    }
  };

  // Quick fill amount from calculator to form
  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(calcDisplay);
    if (!amount || amount <= 0) return;

    addTransaction({
      type: txType,
      amount,
      category,
      description: description.trim() || (txType === 'daromad' ? 'Daromad' : 'Xarajat'),
      date: txDate || today,
      time: currentTime,
      paymentMethod,
    });

    setDescription('');
    handleClear();
  };

  // Date filtering for analytics
  const thisMonthPrefix = today.slice(0, 7); // YYYY-MM
  const filteredTxs = transactions.filter((t) => {
    if (period === 'today') return t.date === today;
    if (period === 'week') return t.date >= weekRange.start && t.date <= weekRange.end;
    if (period === 'month') return t.date.startsWith(thisMonthPrefix);
    return true;
  });

  const searchFilteredTxs = filteredTxs.filter((t) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.description.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      t.amount.toString().includes(q)
    );
  });

  const stats = calculateFinanceStats(
    transactions,
    period === 'today' ? today : period === 'week' ? weekRange.start : undefined,
    period === 'today' ? today : period === 'week' ? weekRange.end : undefined
  );

  // CSV Export
  const handleDownloadCSV = () => {
    const csvContent = exportTransactionsCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `dailylife-moliya-${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-[#0D1424] border border-emerald-500/20 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold text-white flex items-center gap-2">
            <Wallet className="w-5 h-5 text-emerald-400" />
            <span>Shaxsiy moliya va xarajatlar tahlili</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Har bir so‘m hisobda: tezkor kalkulyator, xarajatlar strukturasi va oylik balans
          </p>
        </div>
        <button
          onClick={handleDownloadCSV}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 transition-all flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>CSV yuklab olish</span>
        </button>
      </div>

      {/* TWO MAJOR AREAS: LEFT CALCULATOR & RIGHT FINANCIAL DASHBOARD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT AREA: FUNCTIONAL CALCULATOR & SAVE TRANSACTION */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-panel p-5 rounded-3xl border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Hisob-kitob kalkulyatori
              </span>
              <span className="text-[10px] font-mono text-emerald-400 font-semibold px-2 py-0.5 bg-emerald-500/10 rounded-full">
                UZS (so‘m)
              </span>
            </div>

            {/* Calculator Display */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-right mb-4">
              <div className="text-[11px] font-mono text-slate-400 h-4">
                {prevVal !== null ? `${prevVal} ${operation || ''}` : ''}
              </div>
              <div className="text-2xl sm:text-3xl font-mono font-extrabold text-white tracking-tight overflow-x-auto">
                {calcDisplay}
              </div>
            </div>

            {/* Calculator Keypad */}
            <div className="grid grid-cols-4 gap-2 mb-5">
              <button
                onClick={handleClear}
                className="p-3 rounded-xl bg-rose-500/20 text-rose-400 font-bold text-sm hover:bg-rose-500/30 transition-colors"
              >
                C
              </button>
              <button
                onClick={handleBackspace}
                className="p-3 rounded-xl bg-slate-800 text-slate-300 font-bold text-sm hover:bg-slate-700 transition-colors flex items-center justify-center"
              >
                <Delete className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleOp('÷')}
                className="p-3 rounded-xl bg-slate-800 text-[#00E5FF] font-bold text-base hover:bg-slate-700 transition-colors"
              >
                ÷
              </button>
              <button
                onClick={() => handleOp('×')}
                className="p-3 rounded-xl bg-slate-800 text-[#00E5FF] font-bold text-base hover:bg-slate-700 transition-colors"
              >
                ×
              </button>

              <button
                onClick={() => handleDigit('7')}
                className="p-3 rounded-xl bg-slate-900 text-white font-bold text-base hover:bg-slate-800 transition-colors"
              >
                7
              </button>
              <button
                onClick={() => handleDigit('8')}
                className="p-3 rounded-xl bg-slate-900 text-white font-bold text-base hover:bg-slate-800 transition-colors"
              >
                8
              </button>
              <button
                onClick={() => handleDigit('9')}
                className="p-3 rounded-xl bg-slate-900 text-white font-bold text-base hover:bg-slate-800 transition-colors"
              >
                9
              </button>
              <button
                onClick={() => handleOp('−')}
                className="p-3 rounded-xl bg-slate-800 text-[#00E5FF] font-bold text-base hover:bg-slate-700 transition-colors"
              >
                −
              </button>

              <button
                onClick={() => handleDigit('4')}
                className="p-3 rounded-xl bg-slate-900 text-white font-bold text-base hover:bg-slate-800 transition-colors"
              >
                4
              </button>
              <button
                onClick={() => handleDigit('5')}
                className="p-3 rounded-xl bg-slate-900 text-white font-bold text-base hover:bg-slate-800 transition-colors"
              >
                5
              </button>
              <button
                onClick={() => handleDigit('6')}
                className="p-3 rounded-xl bg-slate-900 text-white font-bold text-base hover:bg-slate-800 transition-colors"
              >
                6
              </button>
              <button
                onClick={() => handleOp('+')}
                className="p-3 rounded-xl bg-slate-800 text-[#00E5FF] font-bold text-base hover:bg-slate-700 transition-colors"
              >
                +
              </button>

              <button
                onClick={() => handleDigit('1')}
                className="p-3 rounded-xl bg-slate-900 text-white font-bold text-base hover:bg-slate-800 transition-colors"
              >
                1
              </button>
              <button
                onClick={() => handleDigit('2')}
                className="p-3 rounded-xl bg-slate-900 text-white font-bold text-base hover:bg-slate-800 transition-colors"
              >
                2
              </button>
              <button
                onClick={() => handleDigit('3')}
                className="p-3 rounded-xl bg-slate-900 text-white font-bold text-base hover:bg-slate-800 transition-colors"
              >
                3
              </button>
              <button
                onClick={handleEquals}
                className="p-3 rounded-xl bg-gradient-to-r from-[#00E5FF] to-emerald-400 text-slate-950 font-bold text-base hover:opacity-90 transition-all row-span-2 flex items-center justify-center"
              >
                =
              </button>

              <button
                onClick={() => handleDigit('0')}
                className="p-3 rounded-xl bg-slate-900 text-white font-bold text-base hover:bg-slate-800 transition-colors col-span-2"
              >
                0
              </button>
              <button
                onClick={handleDecimal}
                className="p-3 rounded-xl bg-slate-900 text-white font-bold text-base hover:bg-slate-800 transition-colors"
              >
                .
              </button>
            </div>

            {/* Quick Save Form attached to Calculator */}
            <form onSubmit={handleSaveTransaction} className="space-y-3 pt-3 border-t border-slate-800">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTxType('xarajat')}
                  className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    txType === 'xarajat'
                      ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25'
                      : 'bg-slate-900 text-slate-400 border border-slate-800'
                  }`}
                >
                  − Xarajat
                </button>
                <button
                  type="button"
                  onClick={() => setTxType('daromad')}
                  className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    txType === 'daromad'
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25'
                      : 'bg-slate-900 text-slate-400 border border-slate-800'
                  }`}
                >
                  + Daromad
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Kategoriya
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as FinanceCategory)}
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-emerald-400 focus:outline-none"
                  >
                    <option value="Oziq-ovqat">Oziq-ovqat</option>
                    <option value="Transport">Transport</option>
                    <option value="Ta'lim">Ta'lim</option>
                    <option value="Sog‘liq">Sog‘liq</option>
                    <option value="Xarid">Xarid</option>
                    <option value="Ko‘ngilochar">Ko‘ngilochar</option>
                    <option value="Uy-joy">Uy-joy</option>
                    <option value="Aloqa">Aloqa</option>
                    <option value="Boshqa">Boshqa</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    To‘lov turi
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-emerald-400 focus:outline-none"
                  >
                    <option value="Karta">Plastik karta</option>
                    <option value="Naqd">Naqd pul</option>
                    <option value="Bank">Bank o‘tkazmasi</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Izoh</label>
                <input
                  type="text"
                  placeholder="Masalan: Tushlik yoki darslik"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={parseFloat(calcDisplay) <= 0}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-[#00E5FF] text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/20 hover:opacity-95 active:scale-[0.98] transition-all disabled:opacity-40 cursor-pointer"
              >
                Tranzaksiyani saqlash ({parseFloat(calcDisplay).toLocaleString()} so‘m)
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT AREA: FINANCIAL DASHBOARD & HISTORY */}
        <div className="lg:col-span-7 space-y-4">
          {/* Period selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {[
              { id: 'today' as PeriodFilter, label: 'Bugun' },
              { id: 'week' as PeriodFilter, label: 'Bu hafta' },
              { id: 'month' as PeriodFilter, label: 'Bu oy' },
              { id: 'all' as PeriodFilter, label: 'Barcha davr' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  period === p.id
                    ? 'bg-emerald-400 text-slate-950 font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Stats Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-[#0D1424] border border-slate-800">
              <span className="text-[11px] font-bold text-emerald-400 uppercase flex items-center gap-1">
                <ArrowDownLeft className="w-3.5 h-3.5" />
                Daromad
              </span>
              <div className="text-xl font-mono font-extrabold text-emerald-400 mt-1">
                +{stats.totalIncome.toLocaleString()}
              </div>
              <span className="text-[10px] text-slate-400">Jami tushum</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#0D1424] border border-slate-800">
              <span className="text-[11px] font-bold text-rose-400 uppercase flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5" />
                Xarajatlar
              </span>
              <div className="text-xl font-mono font-extrabold text-rose-400 mt-1">
                -{stats.totalExpenses.toLocaleString()}
              </div>
              <span className="text-[10px] text-slate-400">Jami chiqim</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#0D1424] border border-slate-800">
              <span className="text-[11px] font-bold text-[#00E5FF] uppercase">Balans (Qoldiq)</span>
              <div
                className={`text-xl font-mono font-extrabold mt-1 ${
                  stats.balance >= 0 ? 'text-[#00E5FF]' : 'text-rose-400'
                }`}
              >
                {stats.balance >= 0 ? '+' : ''}
                {stats.balance.toLocaleString()}
              </div>
              <span className="text-[10px] text-slate-400">Sof moliyaviy farq</span>
            </div>
          </div>

          {/* Category Distribution Breakdown */}
          {stats.categoryDistribution.length > 0 && (
            <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Xarajatlar kategoriyalari taqsimoti
              </h3>
              <div className="space-y-2">
                {stats.categoryDistribution.map((cat) => (
                  <div key={cat.category} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300">{cat.category}</span>
                      <span className="font-mono text-slate-400">
                        {cat.amount.toLocaleString()} so‘m ({cat.percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-400 to-[#00E5FF] rounded-full"
                        style={{ width: `${cat.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Historical Transactions List */}
          <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Tranzaksiyalar tarixi ({searchFilteredTxs.length})
              </h3>
              <input
                type="text"
                placeholder="Qidirish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 w-32 sm:w-44 focus:outline-none"
              />
            </div>

            <div className="divide-y divide-slate-800/60 max-h-80 overflow-y-auto">
              {searchFilteredTxs.length === 0 ? (
                <div className="py-10 text-center text-xs text-slate-400">
                  Ushbu davr uchun operatsiyalar mavjud emas.
                </div>
              ) : (
                searchFilteredTxs.map((t) => (
                  <div
                    key={t.id}
                    className="py-2.5 flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          t.type === 'daromad'
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : 'bg-rose-500/15 text-rose-400'
                        }`}
                      >
                        {t.type === 'daromad' ? (
                          <ArrowDownLeft className="w-4 h-4" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{t.description}</div>
                        <div className="text-[11px] text-slate-400">
                          {t.category} • {formatUzbekDate(t.date, false)} {t.time} • {t.paymentMethod}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div
                        className={`font-mono text-xs font-bold ${
                          t.type === 'daromad' ? 'text-emerald-400' : 'text-white'
                        }`}
                      >
                        {t.type === 'daromad' ? '+' : '-'}
                        {t.amount.toLocaleString()} so‘m
                      </div>
                      <button
                        onClick={() => deleteTransaction(t.id)}
                        className="p-1 rounded text-slate-600 hover:text-rose-400 transition-colors"
                        title="O‘chirish"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
