import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { userAPI } from '../api/api';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faGear, 
  faFileContract, 
  faShieldHalved, 
  faCookieBite, 
  faEnvelope, 
  faCircleInfo,
  faBell,
  faCartShopping,
  faTag,
  faLock,
  faFlask
} from '@fortawesome/free-solid-svg-icons';
import '../styles/settings-mobile.css';

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const { theme: currentTheme, setTheme: applyTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const [tab, setTab] = useState('profile');
  const [profileForm, setProfileForm] = useState({ fullName: user?.fullName || '', phone: user?.phone || '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [expandedPolicy, setExpandedPolicy] = useState(null);
  const [pushPermission, setPushPermission] = useState('default');
  const [pushSubSettings, setPushSubSettings] = useState({
    orderUpdates: true,
    promotions: false,
    securityAlerts: true
  });

  // Check push notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      setPushPermission(Notification.permission);
    }
  }, []);

  const saveProfile = async () => {
    setSaving(true);
    try {
      const res = await userAPI.updateProfile(profileForm);
      updateUser(res.data.data);
      toast.success(t('settings.profileUpdated'));
    } catch (e) { toast.error(e.response?.data?.message || t('settings.failed')); }
    setSaving(false);
  };

  const toggleSetting = async (key, value = null) => {
    const newVal = value !== null ? value : !user[key];
    try {
      const res = await userAPI.updateSettings({ [key]: newVal });
      updateUser(res.data.data);
      toast.success(t('settings.settingUpdated'));
    } catch { toast.error(t('settings.failedUpdate')); }
  };

  const togglePushSubSetting = async (key) => {
    const newVal = !pushSubSettings[key];
    setPushSubSettings(prev => ({ ...prev, [key]: newVal }));
    try {
      // Save to backend - store as nested object or flattened keys
      const res = await userAPI.updateSettings({ 
        pushNotificationPreferences: { ...pushSubSettings, [key]: newVal }
      });
      updateUser(res.data.data);
      toast.success(t('settings.settingUpdated'));
    } catch { 
      // Revert on error
      setPushSubSettings(prev => ({ ...prev, [key]: !newVal }));
      toast.error(t('settings.failedUpdate')); 
    }
  };

  const requestPushPermission = async () => {
    if (!('Notification' in window)) {
      toast.error(t('settings.pushNotSupported'));
      return;
    }
    
    try {
      const permission = await Notification.requestPermission();
      setPushPermission(permission);
      
      if (permission === 'granted') {
        toast.success(t('settings.pushEnabled'));
        // Optionally register for push service here
      } else if (permission === 'denied') {
        toast.error(t('settings.pushDenied'));
      }
    } catch (err) {
      console.error('Push permission error:', err);
      toast.error(t('settings.pushError'));
    }
  };

  const sendTestNotification = async () => {
    try {
      await userAPI.sendTestPush();
      toast.success(t('settings.testPushSent'));
    } catch {
      toast.error(t('settings.testPushFailed'));
    }
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
      title: 'Terms of Service',
      lastUpdated: '2026-01-15',
      content: `1. Acceptance of Terms
By accessing and using this application, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by these terms, please do not use this service.

2. User Account
You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.

3. Intellectual Property
All content, features, and functionality available through this service, including text, graphics, logos, and software, are the exclusive property of the company and are protected by copyright laws.

4. Prohibited Conduct
You agree not to use the service for any unlawful purpose or to solicit others to perform or participate in any unlawful acts. You agree not to interfere with or disrupt the service or servers.

5. Termination
We reserve the right to terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.

6. Disclaimer of Warranties
Your use of the service is at your sole risk. The service is provided on an "AS IS" and "AS AVAILABLE" basis without any warranty of any kind.`
    },
    {
      id: 'privacy',
      icon: faShieldHalved,
      title: 'Privacy Policy',
      lastUpdated: '2026-02-01',
      content: `1. Information Collection
We collect information you provide directly to us, such as when you create an account, update your profile, or communicate with us. This may include your name, email address, and phone number.

2. How We Use Information
We use the information we collect to provide, maintain, and improve our services, to process transactions, to send you technical notices and support messages, and to communicate with you about products, services, and events.

3. Information Sharing
We do not sell your personal information. We may share information with vendors, service providers, and affiliates who need access to such information to carry out work on our behalf.

4. Data Security
We implement reasonable security measures designed to protect your information from unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure.

5. Your Rights
You have the right to access, update, or delete your personal information. You may do so through your account settings or by contacting our support team.

6. Changes to This Policy
We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date.`
    },
    {
      id: 'cookie',
      icon: faCookieBite,
      title: 'Cookie Policy',
      lastUpdated: '2025-12-10',
      content: `1. What Are Cookies
Cookies are small text files that are placed on your device (computer, smartphone, or tablet) when you visit a website. They are widely used to make websites work more efficiently.

2. Types of Cookies We Use
- Essential Cookies: These are necessary for the website to function properly.
- Performance Cookies: These collect information about how visitors use a website, for instance, which pages visitors go to most often.
- Functionality Cookies: These allow the website to remember choices you make (such as your user name, language, or the region you are in).

3. Third-Party Cookies
In addition to our own cookies, we may also use various third-party cookies to report usage statistics of the service and deliver advertisements on and through the service.

4. Managing Cookies
Most web browsers allow some control of most cookies through the browser settings. You can set your browser to refuse all or some cookies, but note that some parts of the service may not function correctly without them.`
    },
    {
      id: 'refund',
      icon: faEnvelope,
      title: 'Refund Policy',
      lastUpdated: '2026-01-20',
      content: `1. Eligibility for Refunds
To be eligible for a refund, your request must be made within 14 days of purchase. The item or service must be unused and in the same condition that you received it.

2. Non-Refundable Items
Certain types of items are exempt from being refunded, such as downloadable software, gift cards, and personal care goods unless defective.

3. Refund Process
Once your return is received and inspected, we will send you an email to notify you that we have received your returned item. If approved, your credit card or original method of payment will be credited.

4. Late or Missing Refunds
If you haven't received a refund yet, first check your bank account again. Then contact your credit card company, as it may take some time before your refund is officially posted.

5. Contact Us
If you have any questions about our Refund Policy, please contact us at support@example.com.`
    },
  ];

  const tabs = [
    { id: 'profile', label: t('settings.profile') },
    { id: 'notifications', label: t('settings.notifications') },
    { id: 'appearance', label: t('settings.appearance') },
    { id: 'security', label: t('settings.security') },
    { id: 'policies', label: t('settings.termsPolicies') },
  ];

  // Helper component for toggle switch
  const ToggleSwitch = ({ enabled, onToggle, disabled = false, size = 'default' }) => (
    <button 
      className={`toggle ${enabled ? 'active' : ''} ${disabled ? 'disabled' : ''} ${size}`}
      onClick={onToggle}
      disabled={disabled}
      aria-pressed={enabled}
    />
  );

  return (
    <div className="page-container">
      <h1 className="page-title">
        <FontAwesomeIcon icon={faGear} className="me-2 settings-icon" />
        {t('settings.title')}
      </h1>

      <div className="settings-tabs">
        {tabs.map(tb => (
          <button 
            key={tb.id} 
            className={`settings-tab ${tab === tb.id ? 'active' : ''}`} 
            onClick={() => setTab(tb.id)}
            role="tab"
            aria-selected={tab === tb.id}
          >
            {tb.label}
          </button>
        ))}
      </div>

      <div className="settings-section">
        {tab === 'profile' && (
          <>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label>{t('settings.fullName')}</label>
              <input 
                value={profileForm.fullName} 
                onChange={e => setProfileForm({ ...profileForm, fullName: e.target.value })} 
                placeholder={t('settings.fullNamePlaceholder')}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label>{t('settings.email')}</label>
              <input value={user?.email || ''} disabled style={{ opacity: 0.6 }} />
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{t('settings.emailCantChange')}</span>
            </div>
            <div className="form-group" style={{ marginBottom: 24 }}>
              <label>{t('settings.phone')}</label>
              <input 
                value={profileForm.phone} 
                onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} 
                placeholder={t('settings.phonePlaceholder')} 
                type="tel"
              />
            </div>
            <button className="btn btn-primary" onClick={saveProfile} disabled={saving}>
              {saving ? t('settings.saving') : t('settings.saveChanges')}
            </button>
          </>
        )}

        {tab === 'notifications' && (
          <>
            {/* Email Notifications */}
            <div className="setting-row">
              <div className="setting-info">
                <h4>{t('settings.emailNotifications')}</h4>
                <p>{t('settings.emailNotificationsDesc')}</p>
              </div>
              <ToggleSwitch 
                enabled={user?.emailNotifications} 
                onToggle={() => toggleSetting('emailNotifications')} 
              />
            </div>

            {/* Push Notifications Header */}
            <div style={{ 
              padding: '16px 0', 
              borderBottom: '1px solid var(--border-color)',
              marginBottom: 16
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <FontAwesomeIcon icon={faBell} style={{ color: 'var(--accent-color, #7c3aed)' }} />
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600 }}>
                  {t('settings.pushNotifications')}
                </h3>
              </div>
              <p style={{ margin: '4px 0 12px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                {t('settings.pushNotificationsDesc')}
              </p>
              
              {/* Permission Status */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 8, 
                marginBottom: 12,
                flexWrap: 'wrap'
              }}>
                <span style={{ 
                  fontSize: '0.85rem',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  background: pushPermission === 'granted' ? 'rgba(34,197,94,0.15)' : 
                             pushPermission === 'denied' ? 'rgba(239,68,68,0.15)' : 
                             'rgba(107,114,128,0.15)',
                  color: pushPermission === 'granted' ? '#22c55e' : 
                         pushPermission === 'denied' ? '#ef4444' : 
                         '#6b7280',
                  fontWeight: 500
                }}>
                  {pushPermission === 'granted' ? t('settings.pushAllowed') : 
                   pushPermission === 'denied' ? t('settings.pushBlocked') : 
                   t('settings.pushDefault')}
                </span>
                
                {pushPermission !== 'granted' && (
                  <button 
                    className="btn btn-sm btn-secondary"
                    onClick={requestPushPermission}
                    style={{ padding: '4px 12px', fontSize: '0.8rem' }}
                  >
                    {t('settings.enablePush')}
                  </button>
                )}
              </div>

              {/* Main Push Toggle */}
              {pushPermission === 'granted' && (
                <div className="setting-row" style={{ alignItems: 'center' }}>
                  <div className="setting-info" style={{ flex: 1 }}>
                    <strong style={{ fontSize: '0.95rem' }}>{t('settings.receivePush')}</strong>
                  </div>
                  <ToggleSwitch 
                    enabled={user?.pushNotifications} 
                    onToggle={() => toggleSetting('pushNotifications')} 
                  />
                </div>
              )}
            </div>

            {/* Push Notification Sub-settings (only show if push is enabled and permission granted) */}
            {pushPermission === 'granted' && user?.pushNotifications && (
              <div style={{ 
                paddingLeft: 12, 
                borderLeft: '2px solid var(--border-color)',
                marginBottom: 20
              }}>
                <p style={{ 
                  fontSize: '0.85rem', 
                  color: 'var(--text-muted)', 
                  marginBottom: 12,
                  fontStyle: 'italic'
                }}>
                  {t('settings.customizePushTypes')}
                </p>
                
                {/* Order Updates */}
                <div className="setting-row" style={{ padding: '8px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <FontAwesomeIcon icon={faCartShopping} style={{ color: '#3b82f6', width: 16 }} />
                    <div>
                      <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{t('settings.orderUpdates')}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('settings.orderUpdatesDesc')}</div>
                    </div>
                  </div>
                  <ToggleSwitch 
                    enabled={pushSubSettings.orderUpdates} 
                    onToggle={() => togglePushSubSetting('orderUpdates')}
                    size="small"
                  />
                </div>

                {/* Promotions */}
                <div className="setting-row" style={{ padding: '8px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <FontAwesomeIcon icon={faTag} style={{ color: '#f59e0b', width: 16 }} />
                    <div>
                      <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{t('settings.promotions')}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('settings.promotionsDesc')}</div>
                    </div>
                  </div>
                  <ToggleSwitch 
                    enabled={pushSubSettings.promotions} 
                    onToggle={() => togglePushSubSetting('promotions')}
                    size="small"
                  />
                </div>

                {/* Security Alerts */}
                <div className="setting-row" style={{ padding: '8px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <FontAwesomeIcon icon={faLock} style={{ color: '#ef4444', width: 16 }} />
                    <div>
                      <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{t('settings.securityAlerts')}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('settings.securityAlertsDesc')}</div>
                    </div>
                  </div>
                  <ToggleSwitch 
                    enabled={pushSubSettings.securityAlerts} 
                    onToggle={() => togglePushSubSetting('securityAlerts')}
                    size="small"
                  />
                </div>

                {/* Test Notification Button */}
                <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px dashed var(--border-color)' }}>
                  <button 
                    className="btn btn-sm btn-secondary"
                    onClick={sendTestNotification}
                    style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <FontAwesomeIcon icon={faFlask} />
                    {t('settings.testPushNotification')}
                  </button>
                </div>
              </div>
            )}

            {/* Helper text for push notifications */}
            <div style={{ 
              marginTop: 8, 
              padding: '12px', 
              background: 'var(--bg-secondary, rgba(124,58,237,0.06))', 
              borderRadius: 8,
              fontSize: '0.82rem',
              color: 'var(--text-muted)',
              lineHeight: 1.5
            }}>
              <FontAwesomeIcon icon={faCircleInfo} style={{ marginRight: 6, color: 'var(--accent-color, #7c3aed)' }} />
              {t('settings.pushHelpText')}
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
                  <button 
                    key={thm} 
                    className={`btn btn-sm ${currentTheme === thm ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => changeTheme(thm)}
                  >
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
                style={{ width: 'auto', padding: '8px 16px', borderRadius: '6px' }}
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
              <input 
                type="password" 
                value={pwForm.currentPassword}
                onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })} 
                placeholder="••••••••"
              />
            </div>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label>{t('settings.newPassword')}</label>
              <input 
                type="password" 
                value={pwForm.newPassword}
                onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })}
                placeholder={t('settings.newPasswordPlaceholder')}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 24 }}>
              <label>{t('settings.confirmPassword')}</label>
              <input 
                type="password" 
                value={pwForm.confirm}
                onChange={e => setPwForm({ ...pwForm, confirm: e.target.value })}
                placeholder={t('settings.confirmPasswordPlaceholder')}
              />
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
                  aria-expanded={expandedPolicy === policy.id}
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