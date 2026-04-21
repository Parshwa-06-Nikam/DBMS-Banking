import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, Terminal, ArrowRightLeft, Database, RefreshCw, CreditCard, Bell, Briefcase, PlayCircle } from 'lucide-react';

const API_BASE = 'http://localhost:5005/api';
const DEMO_CUSTOMER_ID = 1; // Simulating Rahul's login

export default function App() {
  const [accounts, setAccounts] = useState([]);
  const [dashboardData, setDashboardData] = useState({ beneficiaries: [], notifications: [], loans: [] });
  const [logs, setLogs] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isProcessingEmi, setIsProcessingEmi] = useState(false);

  const fetchData = async () => {
    setIsRefreshing(true);
    try {
      const accRes = await axios.get(`${API_BASE}/accounts`);
      setAccounts(accRes.data);
      const dashRes = await axios.get(`${API_BASE}/user-dashboard/${DEMO_CUSTOMER_ID}`);
      setDashboardData(dashRes.data);
    } catch (err) {
      addLog(`Error fetching data: ${err.message}`, 'error');
    }
    setIsRefreshing(false);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [{ timestamp, message, type }, ...prev]);
  };

  const handleEmiBatch = async () => {
    setIsProcessingEmi(true);
    addLog('[SYSTEM] Starting End-of-Day EMI Batch Processing (SERIALIZABLE)...', 'info');
    try {
      const res = await axios.post(`${API_BASE}/process-emis`);
      addLog(`[SYSTEM] ✅ BATCH SUCCESS: ${res.data.message}`, 'success');
      fetchData();
    } catch (err) {
      addLog(`[SYSTEM] ❌ BATCH FAILED: ${err.response?.data?.error || err.message}`, 'error');
    }
    setIsProcessingEmi(false);
  };

  return (
    <div className="min-h-screen p-8 text-slate-800 font-sans selection:bg-indigo-100">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
            <Database className="text-indigo-600" size={32} />
            Enterprise Banking & Concurrency Lab
          </h1>
          <p className="text-slate-500 mt-1"> Transfers, ATMs, Loans, and Batch Processing.</p>
        </div>
        <div className="flex gap-4 items-center">
          {/* Notification Bell */}
          <div className="relative p-2 bg-white rounded-full shadow-sm border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
            <Bell size={24} className="text-slate-600" />
            {dashboardData.notifications.length > 0 && (
              <span className="absolute top-0 right-0 h-3 w-3 bg-rose-500 rounded-full ring-2 ring-white animate-pulse"></span>
            )}
          </div>
          <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 font-medium text-slate-600 transition-all">
            <RefreshCw size={18} className={isRefreshing ? "animate-spin text-indigo-500" : ""} /> Refresh
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* LEFT COLUMN: Data & Alerts */}
        <div className="lg:col-span-1 space-y-6">
          {/* Balances */}
          <div className="bg-white rounded-xl shadow-md border border-slate-100 p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500"></div>
            <h2 className="font-bold flex items-center gap-2 mb-4"><Activity className="text-indigo-500" size={18} /> Live Balances</h2>
            <div className="space-y-3">
              {accounts.map(acc => (
                <div key={acc.account_id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-indigo-200 transition-colors">
                  <p className="font-semibold text-sm">{acc.first_name} {acc.last_name}</p>
                  <p className="text-xs text-slate-500 font-mono">Acc: {acc.account_number} (ID: {acc.account_id})</p>
                  <p className="text-xl font-bold text-indigo-600 mt-1">₹{parseFloat(acc.balance).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Loans & Batch Processing */}
          <div className="bg-white rounded-xl shadow-md border border-slate-100 p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-amber-500"></div>
            <h2 className="font-bold flex items-center gap-2 mb-4"><Briefcase className="text-amber-500" size={18} /> Active Loans</h2>
            {dashboardData.loans.length === 0 ? (
              <p className="text-sm text-slate-400 italic">No active loans</p>
            ) : (
              dashboardData.loans.map(loan => (
                <div key={loan.loan_id} className="mb-3 p-3 bg-amber-50/50 rounded-lg border border-amber-100">
                  <div className="flex justify-between text-sm">
                    <span className="font-bold">{loan.loan_type}</span>
                    <span className="text-amber-600 font-mono font-bold">EMI: ₹{loan.emi_amount}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Principal: ₹{parseFloat(loan.loan_amount).toLocaleString()}</p>
                  <span className="inline-block mt-1 text-[10px] px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-bold uppercase">{loan.loan_status}</span>
                </div>
              ))
            )}
            <button
              onClick={handleEmiBatch}
              disabled={isProcessingEmi}
              className={`w-full py-2.5 mt-2 bg-slate-800 text-white text-sm font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-slate-900 transition-all shadow-md ${isProcessingEmi ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isProcessingEmi ? <RefreshCw size={16} className="animate-spin" /> : <PlayCircle size={16} />}
              Run EMI Batch Job
            </button>
          </div>

          {/* Notifications Inbox */}
          <div className="bg-white rounded-xl shadow-md border border-slate-100 p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-rose-400"></div>
            <h2 className="font-bold flex items-center gap-2 mb-4 text-slate-700"><Bell size={18} className="text-rose-400" /> Recent Alerts</h2>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {dashboardData.notifications.length === 0 ? (
                <p className="text-sm text-slate-400 italic">No notifications yet</p>
              ) : (
                dashboardData.notifications.map((notif, i) => (
                  <div key={i} className="text-xs p-2.5 bg-slate-50 border-l-3 border-indigo-400 rounded hover:bg-indigo-50/50 transition-colors">
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-400">{notif.time}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${notif.type === 'SMS' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>{notif.type}</span>
                    </div>
                    <p className="text-slate-700">{notif.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Terminals & Logs */}
        <div className="lg:col-span-3 space-y-6">
          {/* Terminals */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <TransferTerminal title="Web Transfer A" addLog={addLog} fetchData={fetchData} beneficiaries={dashboardData.beneficiaries} color="blue" />
            <TransferTerminal title="Web Transfer B" addLog={addLog} fetchData={fetchData} beneficiaries={dashboardData.beneficiaries} color="rose" />
            <AtmTerminal title="Pune ATM Kiosk" addLog={addLog} fetchData={fetchData} />
          </div>

          {/* Log Console */}
          <div className="bg-slate-900 rounded-xl shadow-xl border border-slate-800 p-5">
            <h2 className="text-md font-bold flex items-center gap-2 mb-4 text-slate-300">
              <Terminal className="text-green-400" size={18} /> System Execution Logs & Deadlock Detection
            </h2>
            <div className="h-64 overflow-y-auto font-mono text-xs space-y-2 pr-2">
              {logs.length === 0 ? (
                <p className="text-slate-600 italic">Awaiting transactions...</p>
              ) : (
                logs.map((log, idx) => (
                  <div key={idx} className="flex gap-3 border-b border-slate-800/50 pb-1">
                    <span className="text-slate-500 shrink-0">[{log.timestamp}]</span>
                    <span className={`${log.type === 'error' ? 'text-rose-400' : log.type === 'success' ? 'text-green-400' : 'text-indigo-300'}`}>
                      {log.message}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// WEB TRANSFER TERMINAL — Uses Beneficiary Dropdown
// ----------------------------------------------------------------------
function TransferTerminal({ title, addLog, fetchData, beneficiaries, color }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fromId: '1', toId: '', amount: '1000', isolationLevel: 'READ COMMITTED'
  });

  // Auto-select first beneficiary when data arrives
  useEffect(() => {
    if (beneficiaries.length > 0 && !formData.toId) {
      setFormData(prev => ({ ...prev, toId: beneficiaries[0].account_id.toString() }));
    }
  }, [beneficiaries]);

  const handleTransfer = async (e) => {
    e.preventDefault();
    setLoading(true);
    addLog(`[${title}] Initiating Web Transfer of ₹${formData.amount} (${formData.isolationLevel})...`, 'info');
    try {
      const res = await axios.post(`${API_BASE}/transfer-demo`, formData);
      addLog(`[${title}] ✅ SUCCESS: ${res.data.message}`, 'success');
      fetchData();
    } catch (err) {
      addLog(`[${title}] ❌ FAILED: ${err.response?.data?.error || err.message}`, 'error');
    }
    setLoading(false);
  };

  const ringColor = color === 'blue' ? 'ring-blue-500' : 'ring-rose-500';
  const textColor = color === 'blue' ? 'text-blue-700' : 'text-rose-700';
  const btnColor = color === 'blue' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-rose-600 hover:bg-rose-700';

  return (
    <div className={`bg-white rounded-xl shadow-md border p-5 transition-all ${loading ? `ring-2 ${ringColor} ring-opacity-50` : 'border-slate-200'}`}>
      <h3 className={`text-sm font-bold mb-4 flex items-center gap-2 ${textColor}`}>
        <ArrowRightLeft size={16} /> {title}
      </h3>
      <form onSubmit={handleTransfer} className="space-y-3">
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase">Select Beneficiary</label>
          <select
            className="w-full px-2 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded focus:ring-1 focus:ring-indigo-500"
            value={formData.toId}
            onChange={(e) => setFormData({ ...formData, toId: e.target.value })}
            required
          >
            <option value="" disabled>Select Payee...</option>
            {beneficiaries.map(b => (
              <option key={b.account_id} value={b.account_id}>
                {b.beneficiary_name} (Acc: {b.account_id})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase">Amount (₹)</label>
          <input
            type="number"
            className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded font-mono font-bold focus:ring-1 focus:ring-indigo-500"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase">Isolation Level</label>
          <select
            className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded focus:ring-1 focus:ring-indigo-500"
            value={formData.isolationLevel}
            onChange={(e) => setFormData({ ...formData, isolationLevel: e.target.value })}
          >
            <option value="READ COMMITTED">READ COMMITTED</option>
            <option value="REPEATABLE READ">REPEATABLE READ</option>
            <option value="SERIALIZABLE">SERIALIZABLE</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded text-white text-xs font-bold flex justify-center items-center gap-2 mt-2 transition-all shadow-md ${btnColor} ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {loading ? <><RefreshCw size={14} className="animate-spin" /> Processing...</> : 'Execute Transfer'}
        </button>
      </form>
    </div>
  );
}

// ----------------------------------------------------------------------
// ATM KIOSK TERMINAL
// ----------------------------------------------------------------------
function AtmTerminal({ title, addLog, fetchData }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: '4500123456789012',
    atmId: '501',
    amount: '10000',
    isolationLevel: 'READ COMMITTED'
  });

  const handleWithdrawal = async (e) => {
    e.preventDefault();
    setLoading(true);
    addLog(`[${title}] Attempting ATM withdrawal of ₹${formData.amount}...`, 'info');
    try {
      const res = await axios.post(`${API_BASE}/atm-withdrawal`, formData);
      addLog(`[${title}] 💵 CASH DISPENSED: ${res.data.message}`, 'success');
      fetchData();
    } catch (err) {
      addLog(`[${title}] ❌ REJECTED: ${err.response?.data?.error || err.message}`, 'error');
    }
    setLoading(false);
  };

  return (
    <div className={`bg-white rounded-xl shadow-md border p-5 transition-all ${loading ? 'ring-2 ring-emerald-500 ring-opacity-50' : 'border-slate-200'}`}>
      <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-emerald-700">
        <CreditCard size={16} /> {title}
      </h3>
      <form onSubmit={handleWithdrawal} className="space-y-3">
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase">Card Number</label>
          <input
            type="text"
            className="w-full px-2 py-1.5 text-xs bg-emerald-50 border border-emerald-100 rounded focus:ring-1 focus:ring-emerald-500 font-mono"
            value={formData.cardNumber}
            onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase">ATM ID</label>
            <input
              type="number"
              className="w-full px-2 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded focus:ring-1 focus:ring-emerald-500"
              value={formData.atmId}
              onChange={(e) => setFormData({ ...formData, atmId: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase">Withdraw (₹)</label>
            <input
              type="number"
              className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded font-mono font-bold focus:ring-1 focus:ring-emerald-500"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase">Isolation Level</label>
          <select
            className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded focus:ring-1 focus:ring-emerald-500"
            value={formData.isolationLevel}
            onChange={(e) => setFormData({ ...formData, isolationLevel: e.target.value })}
          >
            <option value="READ COMMITTED">READ COMMITTED</option>
            <option value="REPEATABLE READ">REPEATABLE READ</option>
            <option value="SERIALIZABLE">SERIALIZABLE</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded text-white text-xs font-bold flex justify-center items-center gap-2 mt-2 transition-all shadow-md bg-emerald-600 hover:bg-emerald-700 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {loading ? <><RefreshCw size={14} className="animate-spin" /> Processing...</> : 'Withdraw Cash'}
        </button>
      </form>
    </div>
  );
}
