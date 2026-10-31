import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api';
import { Shield, UserPlus, Check, X, Lock, Key, Sparkles, UserCheck } from 'lucide-react';

export default function StaffManagementView({ currentUser }) {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  const [form, setForm] = useState({
    name: '',
    username: '',
    email: '',
    password: '1234',
    permissions: {
      subscriptions: true,
      invoices: true,
      products: true,
      billing: false
    }
  });

  const showToast = (title, detail = '') => {
    setToastMsg({ title, detail });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await apiRequest('/auth/staff');
      if (Array.isArray(res)) {
        setStaffList(res);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    try {
      const activePerms = Object.keys(form.permissions)
        .filter(k => form.permissions[k])
        .join(',');

      const payload = {
        name: form.name,
        username: form.username.trim().toUpperCase(),
        email: form.email || `${form.username.toLowerCase()}@odoo-perfumes.com`,
        password: form.password,
        role: 'staff',
        permissions: activePerms
      };

      const created = await apiRequest('/auth/create-staff', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      showToast('Staff Member Created', `ID: ${created.username} can now log in with password "${form.password}".`);
      setShowAddModal(false);
      setForm({
        name: '',
        username: '',
        email: '',
        password: '1234',
        permissions: { subscriptions: true, invoices: true, products: true, billing: false }
      });
      await fetchStaff();
    } catch (err) {
      console.error(err);
      showToast('Error Creating Staff', err.message || 'Check username and details.');
    }
  };

  const togglePermission = async (member, permKey) => {
    try {
      const currentPerms = (member.permissions || 'subscriptions,invoices,products').split(',').filter(Boolean);
      let updated;
      if (currentPerms.includes(permKey)) {
        updated = currentPerms.filter(p => p !== permKey).join(',');
      } else {
        updated = [...currentPerms, permKey].join(',');
      }

      await apiRequest(`/auth/staff/${member.id}/permissions?permissions=${encodeURIComponent(updated)}`, {
        method: 'PUT'
      });

      showToast('Permissions Updated', `Updated access privileges for ${member.name}.`);
      await fetchStaff();
    } catch (err) {
      console.error(err);
      showToast('Update Failed', err.message);
    }
  };

  if (currentUser?.role !== 'admin') {
    return (
      <div className="p-8 text-center text-zinc-400">
        <Lock className="w-12 h-12 mx-auto text-red-500 mb-3" />
        <h2 className="text-xl font-bold text-white mb-2">Admin Access Required</h2>
        <p className="text-sm">Only the system administrator can manage staff members and assign credentials.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in select-none">
      
      {/* Toast Alert */}
      {toastMsg && (
        <div className="toast-region">
          <div className="toast" style={{ borderLeft: '3px solid #ef4654' }}>
            {toastMsg.title}
            {toastMsg.detail && <small>{toastMsg.detail}</small>}
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="eyebrow" style={{ color: '#d4af37' }}>ACCESS CONTROL & TEAM CREDENTIALS</p>
          <h1 className="text-3xl font-serif text-white font-normal mt-1">
            Staff & Member Management<span className="red-dot">.</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Only the Admin can create staff IDs, generate passwords, and grant granular feature access.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="shimmer-btn flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold text-white shadow-lg cursor-pointer"
          style={{
            background: 'linear-gradient(110deg, #8a0e1e, #d62035)',
            border: '1px solid rgba(255,94,108,0.6)'
          }}
        >
          <UserPlus className="w-4 h-4" />
          <span>＋ Add New Staff Member</span>
        </button>
      </div>

      {/* Info Banner */}
      <div 
        style={{
          border: '1px solid rgba(214,72,84,0.3)',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, rgba(30,8,13,0.85), rgba(12,5,7,0.9))',
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px'
        }}
      >
        <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
          <Shield className="w-4 h-4" />
        </div>
        <div className="text-xs text-zinc-300">
          <strong>Strict Separation of Duties Active:</strong> Admins govern system credentials; staff handle assigned operations; customers access only their personal portal.
        </div>
      </div>

      {/* Staff Table Panel */}
      <div className="panel" style={{ padding: '20px' }}>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>MEMBER / ID</th>
                <th>FULL NAME & EMAIL</th>
                <th>ROLE</th>
                <th>GRANTED ACCESS PERMISSIONS</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {staffList.map((m) => {
                const perms = (m.permissions || 'subscriptions,invoices,products,billing').split(',');
                const isAdmin = m.role === 'admin';
                return (
                  <tr key={m.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-xs">
                          {m.username || (isAdmin ? 'ADMIN' : `MEMBER${m.id}`)}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="font-medium text-white text-xs">{m.name}</div>
                      <div className="text-[10px] text-zinc-500 font-mono">{m.email}</div>
                    </td>
                    <td>
                      <span className={`status ${isAdmin ? 'paid' : 'active'}`}>
                        {isAdmin ? '👑 Administrator' : '⚙️ Internal Staff'}
                      </span>
                    </td>
                    <td>
                      {isAdmin ? (
                        <span className="text-[11px] text-zinc-400 italic">Full System Access Granted</span>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {['subscriptions', 'invoices', 'products', 'billing'].map((pKey) => {
                            const hasPerm = perms.includes(pKey);
                            return (
                              <button
                                key={pKey}
                                onClick={() => togglePermission(m, pKey)}
                                title={`Click to ${hasPerm ? 'revoke' : 'grant'} ${pKey}`}
                                style={{
                                  fontSize: '10px',
                                  padding: '2px 8px',
                                  borderRadius: '12px',
                                  border: hasPerm ? '1px solid rgba(118,220,168,0.5)' : '1px solid rgba(255,255,255,0.1)',
                                  background: hasPerm ? 'rgba(44,153,103,0.18)' : 'rgba(255,255,255,0.02)',
                                  color: hasPerm ? '#73dca7' : '#776b6f',
                                  cursor: 'pointer',
                                  transition: '0.2s',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                {hasPerm ? <Check className="w-2.5 h-2.5" /> : <X className="w-2.5 h-2.5" />}
                                <span className="capitalize">{pKey}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="status active">Active</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add New Staff Member */}
      {showAddModal && (
        <div 
          className="overlay show"
          onClick={() => setShowAddModal(false)}
          style={{ display: 'grid', placeItems: 'center', zIndex: 100 }}
        >
          <div 
            className="app-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ position: 'relative', width: '480px' }}
          >
            <button 
              className="modal-close" 
              onClick={() => setShowAddModal(false)}
              aria-label="Close"
            >
              ×
            </button>
            <p className="eyebrow" style={{ color: '#d4af37' }}>ADMIN CONTROL / CREATE CREDENTIALS</p>
            <h2 className="modal-title">Add Staff Member</h2>
            <p className="modal-copy">Assign a Login ID, secure password, and grant customized feature access.</p>

            <form onSubmit={handleCreateStaff}>
              <div className="modal-field">
                <label>STAFF LOGIN ID (e.g. MEMBER2, STAFF3)</label>
                <input 
                  type="text" 
                  placeholder="e.g. MEMBER2"
                  value={form.username} 
                  onChange={(e) => setForm({ ...form, username: e.target.value })} 
                  required 
                />
              </div>

              <div className="modal-field">
                <label>FULL NAME</label>
                <input 
                  type="text" 
                  placeholder="e.g. Priya Sharma"
                  value={form.name} 
                  onChange={(e) => setForm({ ...form, name: e.target.value })} 
                  required 
                />
              </div>

              <div className="modal-field">
                <label>EMAIL ADDRESS (OPTIONAL)</label>
                <input 
                  type="email" 
                  placeholder="e.g. priya@odoo-perfumes.com"
                  value={form.email} 
                  onChange={(e) => setForm({ ...form, email: e.target.value })} 
                />
              </div>

              <div className="modal-field">
                <label>LOGIN PASSWORD</label>
                <input 
                  type="text" 
                  placeholder="1234"
                  value={form.password} 
                  onChange={(e) => setForm({ ...form, password: e.target.value })} 
                  required 
                />
              </div>

              {/* Granular Access Permissions */}
              <div className="modal-field" style={{ marginTop: '14px' }}>
                <label style={{ marginBottom: '8px', display: 'block' }}>GRANT FEATURE ACCESS</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {['subscriptions', 'invoices', 'products', 'billing'].map((key) => (
                    <label 
                      key={key}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        background: form.permissions[key] ? 'rgba(239,70,84,0.15)' : 'rgba(255,255,255,0.03)',
                        border: form.permissions[key] ? '1px solid rgba(239,70,84,0.4)' : '1px solid rgba(255,255,255,0.08)',
                        cursor: 'pointer'
                      }}
                    >
                      <input 
                        type="checkbox"
                        checked={form.permissions[key]}
                        onChange={(e) => setForm({
                          ...form,
                          permissions: { ...form.permissions, [key]: e.target.checked }
                        })}
                      />
                      <span className="capitalize font-medium text-white">{key} Module</span>
                    </label>
                  ))}
                </div>
              </div>

              <button type="submit" className="modal-submit shimmer-btn" style={{ marginTop: '20px' }}>
                Create Staff Member & Grant Access
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
