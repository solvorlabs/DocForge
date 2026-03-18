// pages/Settings.jsx
import React, { useState } from 'react';
import { Settings as SettingsIcon, User, Bell, Shield, Palette, Volume2 } from 'lucide-react';

const Settings = () => {
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      friendRequests: true,
      achievements: true,
      gameUpdates: false
    },
    privacy: {
      showEmail: false,
      showStats: true,
      allowFriendRequests: true
    },
    gameplay: {
      soundEffects: true,
      backgroundMusic: false,
      autoSubmit: true,
      showHints: true
    },
    theme: 'light'
  });

  const handleToggle = (category, setting) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: !prev[category][setting]
      }
    }));
  };

  const handleThemeChange = (theme) => {
    setSettings(prev => ({
      ...prev,
      theme
    }));
  };

  const SettingSection = ({ title, icon: Icon, children }) => (
    <div style={{
      background: 'white',
      padding: '25px',
      borderRadius: '15px',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e0e0e0',
      marginBottom: '20px'
    }}>
      <h3 style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '20px',
        fontSize: '1.3rem',
        color: '#333'
      }}>
        <Icon size={20} />
        {title}
      </h3>
      {children}
    </div>
  );

  const ToggleSwitch = ({ label, checked, onChange, description }) => (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px 0',
      borderBottom: '1px solid #f0f0f0'
    }}>
      <div>
        <div style={{ fontWeight: 500, marginBottom: '4px' }}>{label}</div>
        {description && (
          <div style={{ fontSize: '0.85rem', color: '#666' }}>{description}</div>
        )}
      </div>
      <label style={{
        position: 'relative',
        display: 'inline-block',
        width: '50px',
        height: '24px',
        cursor: 'pointer'
      }}>
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          style={{ opacity: 0, width: 0, height: 0 }}
        />
        <span style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: checked ? '#4caf50' : '#ccc',
          borderRadius: '24px',
          transition: '0.3s',
          cursor: 'pointer'
        }}>
          <span style={{
            position: 'absolute',
            content: '',
            height: '18px',
            width: '18px',
            left: checked ? '29px' : '3px',
            bottom: '3px',
            backgroundColor: 'white',
            borderRadius: '50%',
            transition: '0.3s'
          }} />
        </span>
      </label>
    </div>
  );

  return (
    <div style={{
      padding: '40px 20px',
      maxWidth: '800px',
      margin: '0 auto',
      minHeight: '80vh'
    }}>
      <h1 style={{
        fontSize: '2.5rem',
        fontWeight: 'bold',
        marginBottom: '30px',
        textAlign: 'center',
        color: '#333',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '15px'
      }}>
        <SettingsIcon size={40} />
        Settings
      </h1>

      {/* Profile Settings */}
      <SettingSection title="Profile" icon={User}>
        <ToggleSwitch
          label="Show email to friends"
          checked={settings.privacy.showEmail}
          onChange={() => handleToggle('privacy', 'showEmail')}
          description="Allow friends to see your email address"
        />
        <ToggleSwitch
          label="Show statistics publicly"
          checked={settings.privacy.showStats}
          onChange={() => handleToggle('privacy', 'showStats')}
          description="Display your game statistics on leaderboards"
        />
        <ToggleSwitch
          label="Allow friend requests"
          checked={settings.privacy.allowFriendRequests}
          onChange={() => handleToggle('privacy', 'allowFriendRequests')}
          description="Let other players send you friend requests"
        />
      </SettingSection>

      {/* Notification Settings */}
      <SettingSection title="Notifications" icon={Bell}>
        <ToggleSwitch
          label="Email notifications"
          checked={settings.notifications.email}
          onChange={() => handleToggle('notifications', 'email')}
          description="Receive game updates via email"
        />
        <ToggleSwitch
          label="Friend requests"
          checked={settings.notifications.friendRequests}
          onChange={() => handleToggle('notifications', 'friendRequests')}
          description="Get notified when someone sends you a friend request"
        />
        <ToggleSwitch
          label="Achievement notifications"
          checked={settings.notifications.achievements}
          onChange={() => handleToggle('notifications', 'achievements')}
          description="Receive notifications when you earn achievements"
        />
        <ToggleSwitch
          label="Game updates"
          checked={settings.notifications.gameUpdates}
          onChange={() => handleToggle('notifications', 'gameUpdates')}
          description="Stay informed about new features and updates"
        />
      </SettingSection>

      {/* Gameplay Settings */}
      <SettingSection title="Gameplay" icon={Volume2}>
        <ToggleSwitch
          label="Sound effects"
          checked={settings.gameplay.soundEffects}
          onChange={() => handleToggle('gameplay', 'soundEffects')}
          description="Play sounds for actions and feedback"
        />
        <ToggleSwitch
          label="Background music"
          checked={settings.gameplay.backgroundMusic}
          onChange={() => handleToggle('gameplay', 'backgroundMusic')}
          description="Play ambient music during games"
        />
        <ToggleSwitch
          label="Auto-submit answers"
          checked={settings.gameplay.autoSubmit}
          onChange={() => handleToggle('gameplay', 'autoSubmit')}
          description="Automatically submit when time expires"
        />
        <ToggleSwitch
          label="Show hints"
          checked={settings.gameplay.showHints}
          onChange={() => handleToggle('gameplay', 'showHints')}
          description="Display helpful tips during gameplay"
        />
      </SettingSection>

      {/* Theme Settings */}
      <SettingSection title="Appearance" icon={Palette}>
        <div>
          <div style={{ marginBottom: '15px', fontWeight: 500 }}>Theme</div>
          <div style={{ display: 'flex', gap: '10px' }}>
            {['light', 'dark', 'auto'].map(theme => (
              <button
                key={theme}
                onClick={() => handleThemeChange(theme)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: '2px solid',
                  borderColor: settings.theme === theme ? '#4caf50' : '#ddd',
                  background: settings.theme === theme ? '#4caf50' : 'white',
                  color: settings.theme === theme ? 'white' : '#333',
                  fontWeight: 500,
                  cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
              >
                {theme}
              </button>
            ))}
          </div>
        </div>
      </SettingSection>

      {/* Save Button */}
      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <button style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          border: 'none',
          padding: '15px 40px',
          borderRadius: '8px',
          fontSize: '1.1rem',
          fontWeight: 'bold',
          cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
        }}>
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default Settings;