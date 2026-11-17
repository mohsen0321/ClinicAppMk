import React, { useState } from 'react';

const PasswordField = ({ id, ...inputProps }) => {
    const [visible, setVisible] = useState(false);

    return (
        <div className="password-field">
            <input id={id} type={visible ? 'text' : 'password'} {...inputProps} />
            <button
                type="button"
                className="password-toggle"
                onClick={() => setVisible((v) => !v)}
                aria-label="إظهار كلمة المرور"
                aria-pressed={visible}
            >
                {visible ? 'إخفاء' : 'إظهار'}
            </button>
        </div>
    );
};

export default PasswordField;