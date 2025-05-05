import React from 'react';

const InputField = ({ label, name, type = 'text', value, onChange }) => (
  <div className="form-group">
    <label htmlFor={name}>{label}</label>
    <input
      id={name}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      required
    />
  </div>
);

export default InputField;
