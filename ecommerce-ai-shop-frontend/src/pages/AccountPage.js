import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// Using Lucide icons for consistency. 
// To use FontAwesome: import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; import { faUser } from '@fortawesome/free-solid-svg-icons';
import { User, Mail, Phone, MapPin, Package, Settings, Plus, Trash2, Edit2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { userAPI, orderAPI } from '../api/api';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

export default function AccountPage() {
  const { user, updateUser } = useAuth();
  const { t } = useTranslation();
  const [stats, setStats] = useState({ totalOrders: 0, pendingOrders: 0, shippedOrders: 0, deliveredOrders: 0 });
  const [addresses, setAddresses] = useState([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ fullName: '', phone: '' });
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addrForm, setAddrForm] = useState({ label: '', street: '', city: '', state: '', zipCode: '', country: 'US', isDefault: false });

  useEffect(() => {
    orderAPI.getStats().then(r => setStats(r.data.data || stats)).catch(() => {});
    userAPI.getAddresses().then(r => setAddresses(r.data.data || [])).catch(() => {});
  }, []);

  useEffect(() => { if (user) setForm({ fullName: user.fullName || '', phone: user.phone || '' }); }, [user]);

  const saveProfile = async () => {
    try { const res = await userAPI.updateProfile(form); updateUser(res.data.data); toast.success(t('account.profileUpdated')); setEditing(false); }
    catch (e) { toast.error(e.response?.data?.message || t('account.updateFailed')); }
  };

  const addAddress = async () => {
    try {
      const res = await userAPI.addAddress(addrForm);
      setAddresses(prev => [...prev, res.data.data]);
      setShowAddressForm(false);
      setAddrForm({ label: '', street: '', city: '', state: '', zipCode: '', country: 'US', isDefault: false });
      toast.success(t('account.addressAdded'));
    } catch (e) { toast.error(e.response?.data?.message || t('settings.failed')); }
  };

  const deleteAddress = async (id) => {
    try { await userAPI.deleteAddress(id); setAddresses(prev => prev.filter(a => a.id !== id)); toast.success(t('account.addressRemoved')); }
    catch { toast.error(t('account.failedDelete')); }
  };

  return (
    <div className="page-container">
      
      {/* --- NEW PAGE HEADER START --- */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'flex-start', /* Change to 'flex-end' for Top Right alignment */
        marginBottom: '24px', 
        paddingBottom: '16px',
        borderBottom: '1px solid var(--border-color, #e5e7eb)'
      }}>
        {/* Icon: Using Lucide for compatibility. Swap for FontAwesome if needed */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          width: '48px', 
          height: '48px', 
          background: 'var(--accent, #2563eb)', 
          color: 'white', 
          borderRadius: '12px',
          marginRight: '16px'
        }}>
          <User size={24} strokeWidth={2} />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '700', color: 'var(--text-primary, #1f2937)' }}>
            {t('account.myAccount') || 'My Account'}
          </h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.95rem', color: 'var(--text-secondary, #6b7280)' }}>
            {t('account.manageProfile') || 'Manage your profile and settings'}
          </p>
        </div>
      </div>
      {/* --- NEW PAGE HEADER END --- */}

      <div className="account-header">
        <div className="account-avatar">{user?.fullName?.[0] || 'U'}</div>
        <div style={{ flex: 1 }}>
          <h2 className="account-name">{user?.fullName}</h2>
          <p className="account-email">{user?.email}</p>
          <p className="account-member">{t('account.memberSince')} {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A'}</p>
        </div>
        <Link to="/settings" className="btn btn-secondary btn-sm"><Settings size={16} /> {t('nav.settings')}</Link>
      </div>

      <div className="orders-stats" style={{ marginBottom: 32 }}>
        {[
          { label: t('orders.totalOrders'), value: stats.totalOrders },
          { label: t('orders.pending'), value: stats.pendingOrders },
          { label: t('orders.shipped'), value: stats.shippedOrders },
          { label: t('orders.delivered'), value: stats.deliveredOrders },
        ].map(s => (
          <div key={s.label} className="stat-card"><div className="stat-number">{s.value}</div><div className="stat-label">{s.label}</div></div>
        ))}
      </div>

      <div className="account-grid">
        <div className="card account-card">
          <h3><User size={18} /> {t('account.profileInfo')}</h3>
          {editing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="form-group"><label>{t('settings.fullName')}</label><input value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} /></div>
              <div className="form-group"><label>{t('settings.phone')}</label><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder={t('settings.phonePlaceholder')} /></div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary btn-sm" onClick={saveProfile}>{t('account.save')}</button>
                <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>{t('account.cancel')}</button>
              </div>
            </div>
          ) : (
            <>
              <div className="info-row"><span className="info-label"><User size={14} style={{ marginRight: 6 }} />{t('account.name')}</span><span className="info-value">{user?.fullName}</span></div>
              <div className="info-row"><span className="info-label"><Mail size={14} style={{ marginRight: 6 }} />{t('account.email')}</span><span className="info-value">{user?.email}</span></div>
              <div className="info-row"><span className="info-label"><Phone size={14} style={{ marginRight: 6 }} />{t('account.phone')}</span><span className="info-value">{user?.phone || t('account.notSet')}</span></div>
              <button className="btn btn-secondary btn-sm" onClick={() => setEditing(true)} style={{ marginTop: 16 }}>
                <Edit2 size={14} /> {t('account.editProfile')}
              </button>
            </>
          )}
        </div>

        <div className="card account-card">
          <h3 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><MapPin size={18} /> {t('account.addresses')}</span>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowAddressForm(!showAddressForm)}><Plus size={14} /> {t('account.add')}</button>
          </h3>

          {showAddressForm && (
            <div style={{ padding: 16, background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', marginBottom: 16 }}>
              <div className="form-grid">
                <div className="form-group"><label>{t('account.label')}</label><input placeholder="Home, Office..." value={addrForm.label} onChange={e => setAddrForm({ ...addrForm, label: e.target.value })} /></div>
                <div className="form-group"><label>{t('account.country')}</label><input value={addrForm.country} onChange={e => setAddrForm({ ...addrForm, country: e.target.value })} /></div>
                <div className="form-group full"><label>{t('account.street')}</label><input value={addrForm.street} onChange={e => setAddrForm({ ...addrForm, street: e.target.value })} /></div>
                <div className="form-group"><label>{t('account.city')}</label><input value={addrForm.city} onChange={e => setAddrForm({ ...addrForm, city: e.target.value })} /></div>
                <div className="form-group"><label>{t('account.state')}</label><input value={addrForm.state} onChange={e => setAddrForm({ ...addrForm, state: e.target.value })} /></div>
                <div className="form-group"><label>{t('account.zip')}</label><input value={addrForm.zipCode} onChange={e => setAddrForm({ ...addrForm, zipCode: e.target.value })} /></div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <input type="checkbox" checked={addrForm.isDefault} onChange={e => setAddrForm({ ...addrForm, isDefault: e.target.checked })} style={{ width: 'auto', accentColor: 'var(--accent)' }} />
                {t('account.setAsDefault')}
              </label>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button className="btn btn-primary btn-sm" onClick={addAddress}>{t('account.saveAddress')}</button>
                <button className="btn btn-ghost btn-sm" onClick={() => setShowAddressForm(false)}>{t('account.cancel')}</button>
              </div>
            </div>
          )}

          {addresses.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', padding: '16px 0' }}>{t('account.noAddressesSaved')}</p>
          ) : (
            addresses.map(addr => (
              <div key={addr.id} className="address-card">
                <div className="address-label">{addr.label || t('account.addresses')} {addr.isDefault && <span className="badge badge-accent">{t('account.defaultAddress')}</span>}</div>
                <div className="address-text">{addr.street}, {addr.city}, {addr.state} {addr.zipCode}, {addr.country}</div>
                <div className="address-actions">
                  <button className="btn btn-ghost btn-sm" onClick={() => deleteAddress(addr.id)}><Trash2 size={14} /> {t('account.remove')}</button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="card account-card">
          <h3><Package size={18} /> {t('account.quickLinks')}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Link to="/orders" className="btn btn-secondary btn-sm" style={{ justifyContent: 'flex-start' }}>{t('account.viewAllOrders')}</Link>
            <Link to="/tracking" className="btn btn-secondary btn-sm" style={{ justifyContent: 'flex-start' }}>{t('account.trackAnOrder')}</Link>
            <Link to="/products" className="btn btn-secondary btn-sm" style={{ justifyContent: 'flex-start' }}>{t('account.browseProducts')}</Link>
          </div>
        </div>
      </div>
    </div>
  );
}