import React, { useState } from 'react';

// ── Types ─────────────────────────────────────────────────
type TxType = 'received' | 'sent' | 'pending';
type TxStatus = 'Completed' | 'Pending';
type TabType = 'deposit' | 'withdraw' | 'transfer';

interface Transaction {
  id: number;
  type: TxType;
  amount: number;
  sender: string;
  receiver: string;
  date: string;
  status: TxStatus;
  note: string;
}

interface FormState {
  amount: string;
  recipient: string;
  note: string;
}

// ── Initial data ──────────────────────────────────────────
const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 1, type: 'received', amount: 50000, sender: 'Alex Thompson', receiver: 'You',       date: 'May 20, 2025', status: 'Completed', note: 'Series A Funding'  },
  { id: 2, type: 'sent',     amount: 2500,  sender: 'You',           receiver: 'Mark Osei',  date: 'May 18, 2025', status: 'Completed', note: 'Consulting Fee'    },
  { id: 3, type: 'pending',  amount: 15000, sender: 'Sarah Chen',    receiver: 'You',        date: 'May 22, 2025', status: 'Pending',   note: 'Investment Round 2'},
];

// ── Amount color helper ───────────────────────────────────
const amountColor: Record<TxType, string> = {
  received: '#16a34a',
  sent:     '#dc2626',
  pending:  '#d97706',
};

const amountPrefix: Record<TxType, string> = {
  received: '+',
  sent:     '-',
  pending:  '~',
};

// ── Main component ────────────────────────────────────────
const PaymentPage: React.FC = () => {
  const [activeTab, setActiveTab]       = useState<TabType>('deposit');
  const [balance, setBalance]           = useState<number>(127500);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [form, setForm]                 = useState<FormState>({ amount: '', recipient: '', note: '' });
  const [successMsg, setSuccessMsg]     = useState<string>('');
  const [errorMsg, setErrorMsg]         = useState<string>('');

  // ── Show messages ─────────────────────────────────────
  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setErrorMsg('');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const showError = (msg: string) => {
    setErrorMsg(msg);
    setSuccessMsg('');
    setTimeout(() => setErrorMsg(''), 3000);
  };

  // ── Handle transaction submit ─────────────────────────
  const handleSubmit = () => {
    const amt = parseFloat(form.amount);
    if (!form.amount || isNaN(amt) || amt <= 0) {
      showError('Please enter a valid amount.');
      return;
    }

    let newTx: Transaction;

    if (activeTab === 'deposit') {
      setBalance(b => b + amt);
      newTx = {
        id: Date.now(), type: 'received', amount: amt,
        sender: 'External', receiver: 'You',
        date: 'Today', status: 'Completed', note: form.note || 'Deposit',
      };
      showSuccess(`$${amt.toLocaleString()} deposited successfully!`);

    } else if (activeTab === 'withdraw') {
      if (amt > balance) { showError('Insufficient balance.'); return; }
      setBalance(b => b - amt);
      newTx = {
        id: Date.now(), type: 'sent', amount: amt,
        sender: 'You', receiver: 'Bank Account',
        date: 'Today', status: 'Completed', note: form.note || 'Withdrawal',
      };
      showSuccess(`$${amt.toLocaleString()} withdrawn successfully!`);

    } else {
      if (!form.recipient) { showError('Please enter a recipient.'); return; }
      if (amt > balance)   { showError('Insufficient balance.'); return; }
      setBalance(b => b - amt);
      newTx = {
        id: Date.now(), type: 'sent', amount: amt,
        sender: 'You', receiver: form.recipient,
        date: 'Today', status: 'Completed', note: form.note || 'Transfer',
      };
      showSuccess(`$${amt.toLocaleString()} sent to ${form.recipient}!`);
    }

    setTransactions(prev => [newTx, ...prev]);
    setForm({ amount: '', recipient: '', note: '' });
  };

  // ── Computed totals ───────────────────────────────────
  const totalReceived = transactions
    .filter(t => t.type === 'received')
    .reduce((s, t) => s + t.amount, 0);

  const totalSent = transactions
    .filter(t => t.type === 'sent')
    .reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">💳 Payment Center</h1>
        <p className="text-gray-600">Manage your wallet, transfers, and transaction history</p>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Wallet balance */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Wallet Balance</p>
          <p className="text-3xl font-bold text-primary-600">${balance.toLocaleString()}</p>
        </div>
        {/* Total received */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Total Received</p>
          <p className="text-3xl font-bold text-green-600">${totalReceived.toLocaleString()}</p>
        </div>
        {/* Total sent */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Total Sent</p>
          <p className="text-3xl font-bold text-red-600">${totalSent.toLocaleString()}</p>
        </div>
      </div>

      {/* ── Feedback messages ── */}
      {successMsg && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-lg text-sm font-medium">
          ✅ {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm font-medium">
          ❌ {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Transaction form ── */}
        <div className="lg:col-span-1 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Make a Transaction</h2>

          {/* Tabs */}
          <div className="flex gap-2 mb-5">
            {(['deposit', 'withdraw', 'transfer'] as TabType[]).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors capitalize ${
                  activeTab === tab
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab === 'deposit' ? '⬇️' : tab === 'withdraw' ? '⬆️' : '↔️'} {tab}
              </button>
            ))}
          </div>

          {/* Amount */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (USD)</label>
            <input
              type="number"
              placeholder="0.00"
              value={form.amount}
              onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500"
            />
          </div>

          {/* Recipient (transfer only) */}
          {activeTab === 'transfer' && (
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Recipient</label>
              <input
                type="text"
                placeholder="Name or email"
                value={form.recipient}
                onChange={e => setForm(p => ({ ...p, recipient: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500"
              />
            </div>
          )}

          {/* Note */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-1">Note (optional)</label>
            <input
              type="text"
              placeholder="e.g. Investment Round 1"
              value={form.note}
              onChange={e => setForm(p => ({ ...p, note: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500"
            />
          </div>

          <button
            onClick={handleSubmit}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-lg transition-colors text-sm"
          >
            Confirm {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </button>
        </div>

        {/* ── Transaction history ── */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Transaction History</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-3">Description</th>
                  <th className="px-6 py-3">Parties</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{tx.note}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      <p>{tx.sender}</p>
                      <p className="text-xs">→ {tx.receiver}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{tx.date}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                        tx.status === 'Completed'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold" style={{ color: amountColor[tx.type] }}>
                      {amountPrefix[tx.type]}${tx.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;