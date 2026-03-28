import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { userAPI } from '../api/api';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const { theme: currentTheme, setTheme: applyTheme } = useTheme();
  const [tab, setTab] = useState('profile');
  const [profileForm, setProfileForm] = useState({ fullName: user?.fullName || '', phone: user?.phone || '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [saving, setSaving] = useState(false);

  const saveProfile = async () => {
    setSaving(true);
    try {
      const res = await userAPI.updateProfile(profileForm);
      updateUser(res.data.data);
      toast.success('Profile updated');
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    setSaving(false);
  };

  const toggleSetting = async (key) => {
    const newVal = !user[key];
    try {
      const res = await userAPI.updateSettings({ [key]: newVal });
      updateUser(res.data.data);
      toast.success('Setting updated');
    } catch { toast.error('Failed to update'); }
  };

  const changeTheme = async (theme) => {
    // Apply theme to DOM immediately
    applyTheme(theme);

    // Persist to backend
    try {
      const res = await userAPI.updateSettings({ theme });
      updateUser(res.data.data);
      toast.success('Theme updated');
    } catch { toast.error('Failed'); }
  };

  const changePassword = async () => {
    if (pwForm.newPassword !== pwForm.confirm) { toast.error('Passwords do not match'); return; }
    if (pwForm.newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setSaving(true);
    try {
      await userAPI.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed');
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    setSaving(false);
  };

  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'appearance', label: 'Appearance' },
    { id: 'security', label: 'Security' },
  ];

  return (
    <div className="page-container">
      <h1 className="page-title">Settings</h1>

      <div className="settings-tabs">
        {tabs.map(t => (
          <button key={t.id} className={`settings-tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="settings-section">
        {tab === 'profile' && (
          <>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label>Full Name</label>
              <input value={profileForm.fullName} onChange={e => setProfileForm({ ...profileForm, fullName: e.target.value })} />
            </div>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label>Email</label>
              <input value={user?.email || ''} disabled style={{ opacity: 0.6 }} />
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Email cannot be changed</span>
            </div>
            <div className="form-group" style={{ marginBottom: 24 }}>
              <label>Phone</label>
              <input value={profileForm.phone} onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} placeholder="+1 234 567 8900" />
            </div>
            <button className="btn btn-primary" onClick={saveProfile} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </>
        )}

        {tab === 'notifications' && (
          <>
            <div className="setting-row">
              <div className="setting-info">
                <h4>Email Notifications</h4>
                <p>Receive order updates, shipping info, and promotions via email</p>
              </div>
              <button className={`toggle ${user?.emailNotifications ? 'active' : ''}`}
                onClick={() => toggleSetting('emailNotifications')} />
            </div>
            <div className="setting-row">
              <div className="setting-info">
                <h4>Push Notifications</h4>
                <p>Get real-time alerts for orders and deals</p>
              </div>
              <button className={`toggle ${user?.pushNotifications ? 'active' : ''}`}
                onClick={() => toggleSetting('pushNotifications')} />
            </div>
          </>
        )}

        {tab === 'appearance' && (
          <>
            <div className="setting-row">
              <div className="setting-info">
                <h4>Theme</h4>
                <p>Choose your preferred appearance</p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {['dark', 'light', 'system'].map(t => (
                  <button key={t} className={`btn btn-sm ${currentTheme === t ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => changeTheme(t)} style={{ textTransform: 'capitalize' }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="setting-row">
              <div className="setting-info">
                <h4>Language</h4>
                <p>Select your preferred language</p>
              </div>
              <select value={user?.language || 'en'} style={{ width: 'auto', padding: '8px 16px' }}
                onChange={async (e) => {
                  try { const res = await userAPI.updateSettings({ language: e.target.value }); updateUser(res.data.data); toast.success('Language updated'); } catch {}
                }}>
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="ja">日本語</option>
              </select>
            </div>
          </>
        )}

        {tab === 'security' && (
          <>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16 }}>Change Password</h3>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label>Current Password</label>
              <input type="password" value={pwForm.currentPassword}
                onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })} />
            </div>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label>New Password</label>
              <input type="password" value={pwForm.newPassword}
                onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })} />
            </div>
            <div className="form-group" style={{ marginBottom: 24 }}>
              <label>Confirm New Password</label>
              <input type="password" value={pwForm.confirm}
                onChange={e => setPwForm({ ...pwForm, confirm: e.target.value })} />
            </div>
            <button className="btn btn-primary" onClick={changePassword} disabled={saving}>
              {saving ? 'Changing...' : 'Change Password'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}