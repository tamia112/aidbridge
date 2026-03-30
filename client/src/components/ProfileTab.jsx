/* eslint-disable no-unused-vars */

import React, { useState } from 'react';
import { User, Mail, Phone, ShieldCheck, Save } from 'lucide-react';

const ProfileTab = ({ userData, onUpdate }) => {
  const [form, setForm] = useState({
    name: userData?.name || '',
    email: userData?.email || '',
    phone: userData?.phone || '',
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ text: '', type: '' });
    
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5000/api/auth/update-me', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });

      if (res.ok) {
        const updated = await res.json();
        onUpdate(updated); // Tell the Dashboard to update the sidebar/header
        setMsg({ text: 'Profile updated successfully! ✨', type: 'success' });
      } else {
        setMsg({ text: 'Failed to update profile.', type: 'error' });
      }
    } catch (err) {
      setMsg({ text: 'Server connection error.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Account Settings</h2>
        <p style={styles.subtitle}>Manage your personal information and how we contact you.</p>
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>
        {/* Name Field */}
        <div style={styles.inputGroup}>
          <label style={styles.label}><User size={14} /> Full Name</label>
          <input 
            style={styles.input}
            value={form.name}
            placeholder="John Doe"
            onChange={e => setForm({...form, name: e.target.value})}
            required
          />
        </div>

        {/* Email Field */}
        <div style={styles.inputGroup}>
          <label style={styles.label}><Mail size={14} /> Email Address</label>
          <input 
            style={styles.input}
            type="email"
            value={form.email}
            placeholder="john@example.com"
            onChange={e => setForm({...form, email: e.target.value})}
            required
          />
        </div>

        {/* Phone Field */}
        <div style={styles.inputGroup}>
          <label style={styles.label}><Phone size={14} /> Phone Number</label>
          <input 
            style={styles.input}
            type="tel"
            value={form.phone}
            placeholder="+254..."
            onChange={e => setForm({...form, phone: e.target.value})}
          />
        </div>

        {/* Status Message */}
        {msg.text && (
          <div style={{
            ...styles.alert, 
            backgroundColor: msg.type === 'success' ? '#f0fdf4' : '#fef2f2',
            color: msg.type === 'success' ? '#16a34a' : '#dc2626'
          }}>
            {msg.text}
          </div>
        )}

        <button type="submit" style={styles.btn} disabled={loading}>
          {loading ? 'Processing...' : <><Save size={18} /> Save Changes</>}
        </button>
      </form>

      <div style={styles.footerNote}>
        <ShieldCheck size={16} color="#94a3b8" />
        <span>Your data is encrypted and secure.</span>
      </div>
    </div>
  );
};

const styles = {
  container: { 
    maxWidth: '650px', 
    backgroundColor: '#ffffff', 
    padding: '40px', 
    borderRadius: '24px', 
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
  },
  header: { marginBottom: '30px' },
  title: { fontSize: '24px', fontWeight: '800', color: '#1e293b', margin: '0 0 8px 0' },
  subtitle: { fontSize: '14px', color: '#64748b', margin: 0 },
  form: { display: 'flex', flexDirection: 'column', gap: '24px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '13px', fontWeight: '700', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' },
  input: { 
    padding: '12px 16px', 
    borderRadius: '12px', 
    border: '1px solid #e2e8f0', 
    fontSize: '15px',
    outline: 'none',
    transition: 'border 0.2s',
    backgroundColor: '#f8fafc'
  },
  btn: { 
    backgroundColor: '#1db09c', 
    color: '#fff', 
    border: 'none', 
    padding: '14px', 
    borderRadius: '12px', 
    fontWeight: '700', 
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    marginTop: '10px',
    transition: '0.3s'
  },
  alert: { padding: '12px', borderRadius: '10px', fontSize: '14px', fontWeight: '600', textAlign: 'center' },
  footerNote: { marginTop: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '12px', color: '#94a3b8' }
};

export default ProfileTab;