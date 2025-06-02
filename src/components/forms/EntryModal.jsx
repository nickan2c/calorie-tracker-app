import React from 'react';
import EntryForm from './EntryForm';
import '../../styles/forms/EntryModal.css';

const EntryModal = ({
  isOpen,
  onClose,
  form,
  handleChange,
  handleSubmit,
  handleDelete,
  cancelEdit,
  editingIndex,
  warning,
  formErrors,
  mostRecentEntry
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>×</button>
        <h2>{editingIndex >= 0 ? 'Edit Entry' : 'New Entry'}</h2>
        
        <EntryForm
          form={form}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          handleDelete={handleDelete}
          cancelEdit={cancelEdit}
          editingIndex={editingIndex}
          warning={warning}
          formErrors={formErrors}
          mostRecentEntry={mostRecentEntry}
        />
      </div>
    </div>
  );
};

export default EntryModal; 