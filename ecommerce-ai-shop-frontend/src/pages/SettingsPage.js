import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { userAPI } from '../api/api';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Solid icons
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
  faFlask,
  faClockRotateLeft,
  faInfoCircle,
  faStar,
  faHeart,
  faUsers,
  faGlobe,
  faCodeBranch,
  faBug,
  faHandshake
} from '@fortawesome/free-solid-svg-icons';

// Brand icons (for LinkedIn)
import { faLinkedin } from '@fortawesome/free-brands-svg-icons';

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
  
  // State for Activities tab
  const [activities, setActivities] = useState([]);
  const [activityFilter, setActivityFilter] = useState('all');

  // Check push notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      setPushPermission(Notification.permission);
    }
    fetchUserActivities();
  }, []);

  const fetchUserActivities = async () => {
    try {
      // Replace with actual API call: await userAPI.getActivities()
      const mockActivities = [
        { id: 1, type: 'login', description: 'Logged in from Chrome on Windows', timestamp: '2026-04-04T10:30:00Z' },
        { id: 2, type: 'purchase', description: 'Completed order #ORD-2847', timestamp: '2026-04-03T15:22:00Z' },
        { id: 3, type: 'settings', description: 'Updated notification preferences', timestamp: '2026-04-02T09:15:00Z' },
        { id: 4, type: 'password', description: 'Password changed successfully', timestamp: '2026-04-01T14:45:00Z' },
        { id: 5, type: 'login', description: 'Logged in from Safari on iPhone', timestamp: '2026-03-31T08:00:00Z' },
      ];
      setActivities(mockActivities);
    } catch (err) {
      console.error('Failed to fetch activities:', err);
    }
  };

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
      const res = await userAPI.updateSettings({ 
        pushNotificationPreferences: { ...pushSubSettings, [key]: newVal }
      });
      updateUser(res.data.data);
      toast.success(t('settings.settingUpdated'));
    } catch { 
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(i18n.language, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActivityIcon = (type) => {
    const icons = {
      login: faClockRotateLeft,
      purchase: faCartShopping,
      settings: faGear,
      password: faLock,
      default: faCircleInfo
    };
    return icons[type] || icons.default;
  };

  const getActivityColor = (type) => {
    const colors = {
      login: '#3b82f6',
      purchase: '#22c55e',
      settings: '#7c3aed',
      password: '#f59e0b',
      default: '#6b7280'
    };
    return colors[type] || colors.default;
  };

  const policies = [
    {
      id: 'terms',
      icon: faFileContract,
      title: t('settings.termsOfService'),
      lastUpdated: t('settings.termsLastUpdated'),
      content: t('settings.termsContent')
    },
    {
      id: 'privacy',
      icon: faShieldHalved,
      title: t('settings.privacyPolicy'),
      lastUpdated: t('settings.privacyLastUpdated'),
      content: t('settings.privacyContent')
    },
    {
      id: 'cookie',
      icon: faCookieBite,
      title: t('settings.cookiePolicy'),
      lastUpdated: t('settings.cookieLastUpdated'),
      content: t('settings.cookieContent')
    },
    {
      id: 'refund',
      icon: faEnvelope,
      title: t('settings.refundPolicy'),
      lastUpdated: t('settings.refundLastUpdated'),
      content: t('settings.refundContent')
    },
  ];

  const tabs = [
    { id: 'profile', label: t('settings.profile') },
    { id: 'notifications', label: t('settings.notifications') },
    { id: 'appearance', label: t('settings.appearance') },
    { id: 'security', label: t('settings.security') },
    { id: 'activities', label: t('settings.activities') },
    { id: 'about', label: t('settings.about') },
    { id: 'policies', label: t('settings.termsPolicies') },
  ];

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
        {/* PROFILE TAB */}
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

        {/* NOTIFICATIONS TAB */}
        {tab === 'notifications' && (
          <>
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

        {/* APPEARANCE TAB */}
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

        {/* SECURITY TAB */}
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

        {/* ACTIVITIES TAB */}
        {tab === 'activities' && (
          <>
            <div style={{ marginBottom: 20 }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
                {t('settings.activitiesDesc')}
              </p>
            </div>

            <div style={{ 
              display: 'flex', 
              gap: 8, 
              marginBottom: 16,
              flexWrap: 'wrap'
            }}>
              {['all', 'login', 'purchase', 'settings', 'password'].map(filter => (
                <button
                  key={filter}
                  className={`btn btn-sm ${activityFilter === filter ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setActivityFilter(filter)}
                  style={{ textTransform: 'capitalize' }}
                >
                  {t(`settings.activity.${filter}`)}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {activities
                .filter(act => activityFilter === 'all' || act.type === activityFilter)
                .map(activity => (
                  <div 
                    key={activity.id}
                    className="activity-item"
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 12,
                      padding: '14px 16px',
                      background: 'var(--bg-secondary, rgba(124,58,237,0.04))',
                      borderRadius: 10,
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    <div style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: `${getActivityColor(activity.type)}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <FontAwesomeIcon 
                        icon={getActivityIcon(activity.type)} 
                        style={{ color: getActivityColor(activity.type), fontSize: '0.9rem' }} 
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: '0.92rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                        {activity.description}
                      </p>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {formatDate(activity.timestamp)}
                      </span>
                    </div>
                  </div>
                ))}
              
              {activities.filter(act => activityFilter === 'all' || act.type === activityFilter).length === 0 && (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '32px 16px', 
                  color: 'var(--text-muted)',
                  fontSize: '0.9rem'
                }}>
                  <FontAwesomeIcon icon={faClockRotateLeft} style={{ marginBottom: 8, opacity: 0.5 }} />
                  <p>{t('settings.noActivities')}</p>
                </div>
              )}
            </div>

            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <button 
                className="btn btn-sm btn-secondary"
                onClick={() => {
                  if (window.confirm(t('settings.confirmClearActivities'))) {
                    setActivities([]);
                    toast.success(t('settings.activitiesCleared'));
                  }
                }}
                style={{ color: '#ef4444' }}
              >
                {t('settings.clearActivityHistory')}
              </button>
            </div>
          </>
        )}

        {/* ABOUT US TAB */}
        {tab === 'about' && (
          <>
            {/* App Header */}
            <div style={{ 
              textAlign: 'center', 
              padding: '24px 16px',
              borderBottom: '1px solid var(--border-color)',
              marginBottom: 24
            }}>
              <div style={{
                width: 72,
                height: 72,
                borderRadius: 16,
                background: 'linear-gradient(135deg, var(--accent-color, #7c3aed), #3b82f6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                boxShadow: '0 4px 14px rgba(124, 58, 237, 0.3)'
              }}>
                <FontAwesomeIcon icon={faStar} style={{ color: 'white', fontSize: '1.8rem' }} />
              </div>
              <h2 style={{ margin: '0 0 4px', fontSize: '1.3rem', fontWeight: 700 }}>
                {t('about.appName')}
              </h2>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                {t('about.tagline')}
              </p>
              <span style={{ 
                display: 'inline-block',
                marginTop: 8,
                padding: '4px 12px',
                background: 'var(--bg-secondary)',
                borderRadius: 20,
                fontSize: '0.75rem',
                color: 'var(--text-muted)'
              }}>
                v2.4.1 • {t('about.build')} 2026.04.04
              </span>
            </div>

            {/* Company Info */}
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <FontAwesomeIcon icon={faUsers} style={{ color: 'var(--accent-color, #7c3aed)' }} />
                {t('about.company')}
              </h3>
              <div style={{ 
                background: 'var(--bg-secondary)', 
                borderRadius: 10, 
                padding: '16px',
                fontSize: '0.9rem',
                lineHeight: 1.7,
                color: 'var(--text-secondary)'
              }}>
                <p style={{ margin: '0 0 8px' }}><strong>{t('about.founded')}:</strong> {t('about.foundedYear')}</p>
                <p style={{ margin: '0 0 8px' }}><strong>{t('about.location')}:</strong> {t('about.locationValue')}</p>
                <p style={{ margin: 0 }}><strong>{t('about.mission')}:</strong> {t('about.missionText')}</p>
              </div>
            </div>

            {/* Quick Links */}
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <FontAwesomeIcon icon={faGlobe} style={{ color: 'var(--accent-color, #7c3aed)' }} />
                {t('about.quickLinks')}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { icon: faFileContract, label: t('settings.termsOfService'), action: () => setTab('policies') },
                  { icon: faShieldHalved, label: t('settings.privacyPolicy'), action: () => setTab('policies') },
                  { icon: faEnvelope, label: t('about.contactSupport'), action: () => window.location.href = 'mailto:support@qualityproducts.com' },
                  { icon: faHandshake, label: t('about.partnerships'), action: () => window.location.href = 'mailto:partners@example.com' },
                ].map((link, idx) => (
                  <button
                    key={idx}
                    onClick={link.action}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 16px',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 8,
                      cursor: 'pointer',
                      color: 'var(--text-primary)',
                      textAlign: 'left',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--accent-color, #7c3aed)10'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
                  >
                    <FontAwesomeIcon icon={link.icon} style={{ width: 18, color: 'var(--accent-color, #7c3aed)' }} />
                    <span style={{ fontSize: '0.92rem', fontWeight: 500 }}>{link.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tech Stack */}
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <FontAwesomeIcon icon={faCodeBranch} style={{ color: 'var(--accent-color, #7c3aed)' }} />
                {t('about.builtWith')}
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {['Spring Boot', 'ReactJS', 'PostgreSQL', 'npm', 'i18next'].map((tech, idx) => (
                  <span 
                    key={idx}
                    style={{
                      padding: '6px 14px',
                      background: 'var(--bg-secondary)',
                      borderRadius: 20,
                      fontSize: '0.8rem',
                      color: 'var(--text-muted)',
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Report Issue - UPDATED GITHUB LINK */}
            <div style={{ 
              padding: '16px',
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: 10,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12
            }}>
              <FontAwesomeIcon icon={faBug} style={{ color: '#ef4444', marginTop: 2 }} />
              <div>
                <p style={{ margin: '0 0 8px', fontSize: '0.92rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                  {t('about.foundIssue')}
                </p>
                <button 
                  className="btn btn-sm btn-secondary"
                  onClick={() => window.open('https://github.com/franklinsurya4/E-Commerce-SpringBoot-ReactJs', '_blank', 'noopener,noreferrer')}
                  style={{ fontSize: '0.8rem' }}
                >
                  {t('about.reportBug')}
                </button>
              </div>
            </div>

            {/* Footer with Developer Credit */}
            <div style={{ 
              marginTop: 28,
              textAlign: 'center',
              padding: '16px',
              color: 'var(--text-muted)',
              fontSize: '0.8rem',
              borderTop: '1px solid var(--border-color)'
            }}>
              <p style={{ margin: '0 0 4px' }}>
                {t('about.copyright')}
              </p>
              <p style={{ margin: 0 }}>
                {t('about.madeWith')} <FontAwesomeIcon icon={faHeart} style={{ color: '#ef4444' }} /> {t('about.forUsers')}
              </p>
              <p style={{ margin: '8px 0 0', fontSize: '0.75rem' }}>
                {t('about.developer.label')}{' '}
                <a 
                  href={t('about.developer.linkedin')} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ 
                    color: 'var(--accent-color, #7c3aed)', 
                    textDecoration: 'none', 
                    fontWeight: 500,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.textDecoration = 'underline';
                    e.target.style.opacity = '0.85';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.textDecoration = 'none';
                    e.target.style.opacity = '1';
                  }}
                >
                  <FontAwesomeIcon icon={faLinkedin} style={{ fontSize: '0.8rem' }} />
                  {t('about.developer.name')}
                </a>
              </p>
            </div>
          </>
        )}

        {/* POLICIES TAB */}
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