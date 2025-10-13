import React from 'react';
import { Link } from 'react-router-dom';

const Button = ({ isLink = false, to = "#", children, isStartIcon = false, onClick, disabled, startIcon, type, className }) => {
  return (
    <>
      {isLink ? (
        <Link
          to={to}
          className={`btn-main ${className}`}
          style={{
            fontFamily: 'Poppins',
            fontSize: '16px',
            fontWeight: '500',
            backgroundColor: '#444',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '5px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <span style={{ marginRight: '5px', marginBottom: '3px' }}>{isStartIcon && startIcon}</span>
          {children}
        </Link>
      ) : (
        <button
          className={`btn-main ${className}`}
          style={{
            fontFamily: 'Poppins',
            fontSize: '16px',
            fontWeight: '500',
            backgroundColor: '#444',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '5px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <span style={{ marginRight: '5px', marginBottom: '3px' }}>{isStartIcon && startIcon}</span>
          {children}
        </button>
      )}
    </>
  );
};

export default Button;
