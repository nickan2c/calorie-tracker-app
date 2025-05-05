import React from 'react';

function InputField({ label, name, type, value, onChange, placeholder, required, hasError }) {
  return (
    <div className="input-field">
      <label>{label}</label>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={hasError ? 'input-error' : ''}
      />
    </div>
  );
}


export default InputField;
