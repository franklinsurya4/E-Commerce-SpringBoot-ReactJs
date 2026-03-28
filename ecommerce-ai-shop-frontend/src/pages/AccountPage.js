import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Package, Settings, Plus, Trash2, Edit2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { userAPI, orderAPI } from '../api/api';
import toast from 'react-hot-toast';

export default function AccountPage() {
  const { user, updateUser } = useAuth();
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

  useEffect(() => {
    if (user) setForm({ fullName: user.fullName || '', phone: user.phone || '' });
  }, [user]);

  const saveProfile = async () => {
    try {
      const res = await userAPI.updateProfile(form);
      updateUser(res.data.data);
      toast.success('Profile updated');
      setEditing(false);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Update failed');
    }
  };

  const addAddress = async () => {
    try {
      const res = await userAPI.addAddress(addrForm);
      setAddresses(prev => [...prev, res.data.data]);
      setShowAddressForm(false);
      setAddrForm({ label: '', street: '', city: '', state: '', zipCode: '', country: 'US', isDefault: false });
      toast.success('Address added');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed');
    }
  };

  const deleteAddress = async (id) => {
    try {
      await userAPI.deleteAddress(id);
      setAddresses(prev => prev.filter(a => a.id !== id));
      toast.success('Address removed');
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="page-container">
      <div className="account-header">
        <div className="account-avatar">{user?.fullName?.[0] || 'U'}</div>
        <div style={{ flex: 1 }}>
          <h2 className="account-name">{user?.fullName}</h2>
          <p className="account-email">{user?.email}</p>
          <p className="account-member">Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A'}</p>
        </div>
        <Link to="/settings" className="btn btn-secondary btn-sm"><Settings size={16} /> Settings</Link>
      </div>

      <div className="orders-stats" style={{ marginBottom: 32 }}>
        {[
          { label: 'Total Orders', value: stats.totalOrders },
          { label: 'Pending', value: stats.pendingOrders },
          { label: 'Shipped', value: stats.shippedOrders },
          { label: 'Delivered', value: stats.deliveredOrders },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-number">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="account-grid">
        {/* Profile */}
        <div className="card account-card">
          <h3><User size={18} /> Profile Information</h3>
          {editing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="form-group">
                <label>Full Name</label>
                <input value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+1 234 567 8900" />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary btn-sm" onClick={saveProfile}>Save</button>
                <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <div className="info-row"><span className="info-label"><User size={14} style={{ marginRight: 6 }} />Name</span><span className="info-value">{user?.fullName}</span></div>
              <div className="info-row"><span className="info-label"><Mail size={14} style={{ marginRight: 6 }} />Email</span><span className="info-value">{user?.email}</span></div>
              <div className="info-row"><span className="info-label"><Phone size={14} style={{ marginRight: 6 }} />Phone</span><span className="info-value">{user?.phone || 'Not set'}</span></div>
              <button className="btn btn-secondary btn-sm" onClick={() => setEditing(true)} style={{ marginTop: 16 }}>
                <Edit2 size={14} /> Edit Profile
              </button>
            </>
          )}
        </div>

        {/* Addresses */}
        <div className="card account-card">
          <h3 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><MapPin size={18} /> Addresses</span>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowAddressForm(!showAddressForm)}><Plus size={14} /> Add</button>
          </h3>

          {showAddressForm && (
            <div style={{ padding: 16, background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', marginBottom: 16 }}>
              <div className="form-grid">
                <div className="form-group"><label>Label</label><input placeholder="Home, Office..." value={addrForm.label} onChange={e => setAddrForm({ ...addrForm, label: e.target.value })} /></div>
                <div className="form-group"><label>Country</label><input value={addrForm.country} onChange={e => setAddrForm({ ...addrForm, country: e.target.value })} /></div>
                <div className="form-group full"><label>Street</label><input value={addrForm.street} onChange={e => setAddrForm({ ...addrForm, street: e.target.value })} /></div>
                <div className="form-group"><label>City</label><input value={addrForm.city} onChange={e => setAddrForm({ ...addrForm, city: e.target.value })} /></div>
                <div className="form-group"><label>State</label><input value={addrForm.state} onChange={e => setAddrForm({ ...addrForm, state: e.target.value })} /></div>
                <div className="form-group"><label>ZIP</label><input value={addrForm.zipCode} onChange={e => setAddrForm({ ...addrForm, zipCode: e.target.value })} /></div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <input type="checkbox" checked={addrForm.isDefault} onChange={e => setAddrForm({ ...addrForm, isDefault: e.target.checked })} style={{ width: 'auto', accentColor: 'var(--accent)' }} />
                Set as default
              </label>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button className="btn btn-primary btn-sm" onClick={addAddress}>Save Address</button>
                <button className="btn btn-ghost btn-sm" onClick={() => setShowAddressForm(false)}>Cancel</button>
              </div>
            </div>
          )}

          {addresses.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', padding: '16px 0' }}>No addresses saved yet.</p>
          ) : (
            addresses.map(addr => (
              <div key={addr.id} className="address-card">
                <div className="address-label">
                  {addr.label || 'Address'} {addr.isDefault && <span className="badge badge-accent">Default</span>}
                </div>
                <div className="address-text">{addr.street}, {addr.city}, {addr.state} {addr.zipCode}, {addr.country}</div>
                <div className="address-actions">
                  <button className="btn btn-ghost btn-sm" onClick={() => deleteAddress(addr.id)}>
                    <Trash2 size={14} /> Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Quick Links */}
        <div className="card account-card">
          <h3><Package size={18} /> Quick Links</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Link to="/orders" className="btn btn-secondary btn-sm" style={{ justifyContent: 'flex-start' }}>View All Orders</Link>
            <Link to="/tracking" className="btn btn-secondary btn-sm" style={{ justifyContent: 'flex-start' }}>Track an Order</Link>
            <Link to="/products" className="btn btn-secondary btn-sm" style={{ justifyContent: 'flex-start' }}>Browse Products</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
