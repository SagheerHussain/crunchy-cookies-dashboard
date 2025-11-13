import React from 'react';
import { Link } from 'react-router-dom';

const Button = ({
  isLink = false,
  to = '#',
  children,
  isStartIcon = false,
  onClick,
  disabled = false,
  startIcon,
  type = 'button',
  className = '',
  variant = 'primary' // "primary" | "teal"
}) => {
  const commonStyle = {
    fontFamily: 'Poppins, system-ui, -apple-system, BlinkMacSystemFont',
    fontSize: '14px',
    fontWeight: 600,
    letterSpacing: '0.02em',
    padding: '8px 18px',
    borderRadius: '999px',
    border: 'none',
    outline: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transform: 'translateY(0)',
    transition: 'transform 150ms ease, box-shadow 150ms ease, filter 150ms ease, opacity 150ms ease',
    whiteSpace: 'nowrap'
  };

  // inside Button.jsx
  const variantStyles = {
    primary: {
      // 🔹 single light-teal fill
      background: '#043031', // light teal (you can tweak)
      color: '#f9fafb', // almost white text
      border: '1px solid #09777b', // slightly brighter teal border
      boxShadow: '0 8px 20px rgba(0, 0, 0, 0.35)'
    },
    teal: {
      background: '#062c26',
      color: '#e5fff7',
      border: '1px solid #16a34a',
      boxShadow: '0 4px 10px rgba(0,0,0,0.35)'
    }
  };

  const baseStyle = {
    ...commonStyle,
    ...(variantStyles[variant] || variantStyles.primary)
  };

  const iconWrapperStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px'
  };

  if (isLink) {
    return (
      <Link
        to={disabled ? '#' : to}
        aria-disabled={disabled}
        className={`primary-btn ${className}`}
        style={baseStyle}
        onClick={(e) => disabled && e.preventDefault()}
      >
        {isStartIcon && <span style={iconWrapperStyle}>{startIcon}</span>}
        <span>{children}</span>
      </Link>
    );
  }

  return (
    <button type={type} onClick={disabled ? undefined : onClick} disabled={disabled} className={`primary-btn ${className}`} style={baseStyle}>
      {isStartIcon && <span style={iconWrapperStyle}>{startIcon}</span>}
      <span>{children}</span>
    </button>
  );
};

export default Button;
