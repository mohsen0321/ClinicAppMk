import React from 'react';
import './AuthForm.css';
import authImage from './vitaly-gariev-E0xu1n9yiPk-unsplash.jpg'; // الصورة لازم تكون في نفس فولدر الملف ده

const AuthLayout = ({ title, subtitle, wide = false, children }) => (
    <div className="auth-wrapper">
        <div className={`auth-shell${wide ? ' is-wide' : ''}`}>
            <aside className="auth-aside" style={{ backgroundImage: `url(${authImage})` }}>
                <div className="auth-brand">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                    >
                        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                        <path d="M12 9v6" />
                        <path d="M9 12h6" />
                    </svg>
                    <span>عيادتي</span>
                </div>
                <p className="auth-aside-text">احجز مواعيدك وتابع حالتك الصحية من مكان واحد.</p>
            </aside>

            <div className="auth-main">
                <header className="auth-header">
                    <h1>{title}</h1>
                    {subtitle && <p>{subtitle}</p>}
                </header>
                {children}
            </div>
        </div>
    </div>
);

export default AuthLayout;