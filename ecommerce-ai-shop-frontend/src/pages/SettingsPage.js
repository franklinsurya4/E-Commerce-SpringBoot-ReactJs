import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { userAPI } from '../api/api';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear, faFileContract, faShieldHalved, faCookieBite, faEnvelope, faCircleInfo } from '@fortawesome/free-solid-svg-icons';

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const { theme: currentTheme, setTheme: applyTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const [tab, setTab] = useState('profile');
  const [profileForm, setProfileForm] = useState({ fullName: user?.fullName || '', phone: user?.phone || '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [expandedPolicy, setExpandedPolicy] = useState(null);

  const saveProfile = async () => {
    setSaving(true);
    try {
      const res = await userAPI.updateProfile(profileForm);
      updateUser(res.data.data);
      toast.success(t('settings.profileUpdated'));
    } catch (e) { toast.error(e.response?.data?.message || t('settings.failed')); }
    setSaving(false);
  };

  const toggleSetting = async (key) => {
    const newVal = !user[key];
    try {
      const res = await userAPI.updateSettings({ [key]: newVal });
      updateUser(res.data.data);
      toast.success(t('settings.settingUpdated'));
    } catch { toast.error(t('settings.failedUpdate')); }
  };

  const changeTheme = async (theme) => {
    applyTheme(theme);
    try {
      const res = await userAPI.updateSettings({ theme });
      updateUser(res.data.data);
      toast.success(t('settings.themeUpdated'));
    } catch { toast.error(t('settings.failed')); }
  };

  const changeLanguage = async (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('appLanguage', lang);
    try {
      const res = await userAPI.updateSettings({ language: lang });
      updateUser(res.data.data);
      toast.success(t('settings.languageUpdated'));
    } catch { toast.error(t('settings.failedUpdate')); }
  };

  const changePassword = async () => {
    if (pwForm.newPassword !== pwForm.confirm) { toast.error(t('settings.passwordsMismatch')); return; }
    if (pwForm.newPassword.length < 6) { toast.error(t('settings.passwordTooShort')); return; }
    setSaving(true);
    try {
      await userAPI.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success(t('settings.passwordChanged'));
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (e) { toast.error(e.response?.data?.message || t('settings.failed')); }
    setSaving(false);
  };

  const togglePolicy = (id) => {
    setExpandedPolicy(expandedPolicy === id ? null : id);
  };

  const policies = [
    {
      id: 'terms',
      icon: faFileContract,
      title: t('settings.termsOfService'),
      lastUpdated: '2026-01-15',
      content: t('settings.termsContent'),
    },
    {
      id: 'privacy',
      icon: faShieldHalved,
      title: t('settings.privacyPolicy'),
      lastUpdated: '2026-02-01',
      content: t('settings.privacyContent'),
    },
    {
      id: 'cookie',
      icon: faCookieBite,
      title: t('settings.cookiePolicy'),
      lastUpdated: '2025-12-10',
      content: t('settings.cookieContent'),
    },
    {
      id: 'refund',
      icon: faEnvelope,
      title: t('settings.refundPolicy'),
      lastUpdated: '2026-01-20',
      content: t('settings.refundContent'),
    },
  ];

  const tabs = [
    { id: 'profile', label: t('settings.profile') },
    { id: 'notifications', label: t('settings.notifications') },
    { id: 'appearance', label: t('settings.appearance') },
    { id: 'security', label: t('settings.security') },
    { id: 'policies', label: t('settings.termsPolicies') },
  ];

  return (
    <div className="page-container">
      <h1 className="page-title">
        <FontAwesomeIcon icon={faGear} className="me-2 settings-icon" />
        {t('settings.title')}
      </h1>

      <div className="settings-tabs">
        {tabs.map(tb => (
          <button key={tb.id} className={`settings-tab ${tab === tb.id ? 'active' : ''}`} onClick={() => setTab(tb.id)}>
            {tb.label}
          </button>
        ))}
      </div>

      <div className="settings-section">
        {tab === 'profile' && (
          <>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label>{t('settings.fullName')}</label>
              <input value={profileForm.fullName} onChange={e => setProfileForm({ ...profileForm, fullName: e.target.value })} />
            </div>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label>{t('settings.email')}</label>
              <input value={user?.email || ''} disabled style={{ opacity: 0.6 }} />
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{t('settings.emailCantChange')}</span>
            </div>
            <div className="form-group" style={{ marginBottom: 24 }}>
              <label>{t('settings.phone')}</label>
              <input value={profileForm.phone} onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} placeholder={t('settings.phonePlaceholder')} />
            </div>
            <button className="btn btn-primary" onClick={saveProfile} disabled={saving}>
              {saving ? t('settings.saving') : t('settings.saveChanges')}
            </button>
          </>
        )}

        {tab === 'notifications' && (
          <>
            <div className="setting-row">
              <div className="setting-info">
                <h4>{t('settings.emailNotifications')}</h4>
                <p>{t('settings.emailNotificationsDesc')}</p>
              </div>
              <button className={`toggle ${user?.emailNotifications ? 'active' : ''}`}
                onClick={() => toggleSetting('emailNotifications')} />
            </div>
            <div className="setting-row">
              <div className="setting-info">
                <h4>{t('settings.pushNotifications')}</h4>
                <p>{t('settings.pushNotificationsDesc')}</p>
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
                <h4>{t('settings.theme')}</h4>
                <p>{t('settings.themeDesc')}</p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {['dark', 'light', 'system'].map(thm => (
                  <button key={thm} className={`btn btn-sm ${currentTheme === thm ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => changeTheme(thm)}>
                    {t(`settings.${thm}`)}
                  </button>
                ))}
              </div>
            </div>
            <div className="setting-row">
              <div className="setting-info">
                <h4>{t('settings.language')}</h4>
                <p>{t('settings.languageDesc')}</p>
              </div>
              <select
                value={i18n.language}
                style={{ width: 'auto', padding: '8px 16px' }}
                onChange={(e) => changeLanguage(e.target.value)}
              >
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
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16 }}>{t('settings.changePassword')}</h3>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label>{t('settings.currentPassword')}</label>
              <input type="password" value={pwForm.currentPassword}
                onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })} />
            </div>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label>{t('settings.newPassword')}</label>
              <input type="password" value={pwForm.newPassword}
                onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })} />
            </div>
            <div className="form-group" style={{ marginBottom: 24 }}>
              <label>{t('settings.confirmPassword')}</label>
              <input type="password" value={pwForm.confirm}
                onChange={e => setPwForm({ ...pwForm, confirm: e.target.value })} />
            </div>
            <button className="btn btn-primary" onClick={changePassword} disabled={saving}>
              {saving ? t('settings.changingPassword') : t('settings.changePassword')}
            </button>
          </>
        )}

        {tab === 'policies' && (
          <>
            <div style={{ marginBottom: 20 }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
                {t('settings.policiesDesc')}
              </p>
            </div>

            {policies.map(policy => (
              <div key={policy.id} className="policy-card" style={{
                border: '1px solid var(--border-color)',
                borderRadius: 10,
                marginBottom: 12,
                overflow: 'hidden',
                transition: 'box-shadow 0.2s ease',
              }}>
                <button
                  onClick={() => togglePolicy(policy.id)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 20px',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-primary)',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <FontAwesomeIcon icon={policy.icon} style={{ fontSize: '1.1rem', color: 'var(--accent-color, #7c3aed)', width: 20 }} />
                    <div>
                      <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600 }}>{policy.title}</h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {t('settings.lastUpdated')}: {policy.lastUpdated}
                      </span>
                    </div>
                  </div>
                  <span style={{
                    fontSize: '1.1rem',
                    transition: 'transform 0.2s ease',
                    transform: expandedPolicy === policy.id ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}>
                    ▼
                  </span>
                </button>

                {expandedPolicy === policy.id && (
                  <div style={{
                    padding: '0 20px 20px 52px',
                    fontSize: '0.88rem',
                    lineHeight: 1.7,
                    color: 'var(--text-secondary)',
                    whiteSpace: 'pre-line',
                  }}>
                    {policy.content}
                  </div>
                )}
              </div>
            ))}

            <div style={{
              marginTop: 24,
              padding: '14px 18px',
              background: 'var(--bg-secondary, rgba(124,58,237,0.06))',
              borderRadius: 10,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
            }}>
              <FontAwesomeIcon icon={faCircleInfo} style={{ color: 'var(--accent-color, #7c3aed)', marginTop: 2 }} />
              <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                {t('settings.policiesContact')}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}