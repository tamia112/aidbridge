import React from 'react';
import { CheckCircle, Info, AlertTriangle, XCircle, Clock, Check } from 'lucide-react';

const NotificationItem = ({ notification, onMarkRead }) => {
  const { _id, title, message, type, isRead, createdAt } = notification;

  // Configuration for different notification levels
  const typeConfig = {
    success: {
      icon: <CheckCircle size={20} color="#10b981" />,
      bg: '#ecfdf5',
      border: '#10b981',
      label: 'Success'
    },
    info: {
      icon: <Info size={20} color="#3b82f6" />,
      bg: '#eff6ff',
      border: '#3b82f6',
      label: 'Update'
    },
    warning: {
      icon: <AlertTriangle size={20} color="#f59e0b" />,
      bg: '#fffbeb',
      border: '#f59e0b',
      label: 'Attention'
    },
    error: {
      icon: <XCircle size={20} color="#ef4444" />,
      bg: '#fef2f2',
      border: '#ef4444',
      label: 'Action Required'
    }
  };

  const config = typeConfig[type] || typeConfig.info;

  // Human-readable time (e.g., "2 mins ago" logic or simple format)
  const timeFormatted = new Date(createdAt).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div 
      style={{
        ...styles.notifCard,
        backgroundColor: isRead ? '#ffffff' : config.bg,
        borderLeft: `5px solid ${isRead ? '#e2e8f0' : config.border}`,
        opacity: isRead ? 0.7 : 1
      }}
    >
      <div style={styles.iconWrapper}>
        {config.icon}
      </div>

      <div style={styles.textWrapper}>
        <div style={styles.header}>
          <span style={{...styles.typeLabel, color: config.border}}>{config.label}</span>
          <span style={styles.timeStamp}>
            <Clock size={12} /> {timeFormatted}
          </span>
        </div>
        
        <h4 style={styles.title}>{title}</h4>
        <p style={styles.message}>{message}</p>
        
        {!isRead && (
          <button 
            onClick={() => onMarkRead(_id)} 
            style={styles.readBtn}
          >
            <Check size={14} /> Mark as read
          </button>
        )}
      </div>
    </div>
  );
};

// --- STYLES ---

const styles = {
  notifCard: {
    display: 'flex',
    padding: '16px',
    borderRadius: '12px',
    marginBottom: '12px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
    transition: 'all 0.2s ease',
    gap: '16px'
  },
  iconWrapper: {
    paddingTop: '4px'
  },
  textWrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4px'
  },
  typeLabel: {
    fontSize: '10px',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  timeStamp: {
    fontSize: '11px',
    color: '#94a3b8',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  title: {
    margin: '0 0 4px 0',
    fontSize: '15px',
    fontWeight: '700',
    color: '#1e293b'
  },
  message: {
    margin: 0,
    fontSize: '14px',
    color: '#475569',
    lineHeight: '1.5'
  },
  readBtn: {
    marginTop: '12px',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#1db09c',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: 0,
    width: 'fit-content'
  }
};

export default NotificationItem;