import React, { useRef, useEffect } from 'react';
import '../../styles/forms/InputField.css'; 

const InputField = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  hasError = false,
}) => {
  const textareaRef = useRef(null);
  const isTextArea = type === 'textarea';

  // Auto-resize textarea on mount & whenever value changes
  useEffect(() => {
    if (isTextArea && textareaRef.current) {
      textareaRef.current.style.height = 'auto'; // reset first
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [value, isTextArea]);

  return (
    <div className={`input-field ${hasError ? 'has-error' : ''}`}>
      <label htmlFor={name}>{label}</label>
      {isTextArea ? (
        <textarea
          ref={textareaRef}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={1}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
        />
      )}
    </div>
  );
};

export default InputField;
