import React, { useState } from 'react';
import { Confirm } from 'react-admin';

const EntriesTable = ({ entries, onEdit, onDelete, editingIndex }) => {
  const [openConfirm, setOpenConfirm] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);

  const handleDelete = (index) => {
    setDeleteIndex(index);
    setOpenConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (deleteIndex !== null) {
      onDelete(deleteIndex);
    }
    setOpenConfirm(false);
    setDeleteIndex(null);
  };

  const handleCancelDelete = () => {
    setOpenConfirm(false);
    setDeleteIndex(null);
  };

  return (
    <div className="entries-section">
      <h2>Previous Entries</h2>
      {entries.length === 0 ? (
        <p className="no-entries">No entries yet. Add your first entry using the form above.</p>
      ) : (
        <div className="table-container">
          <table className="entries-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Weight</th>
                <th>Calories</th>
                <th>Protein</th>
                <th>Steps</th>
                <th>Deficit</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, index) => (
                <tr key={index} className={index === editingIndex ? 'editing' : ''}>
                  <td>{entry.date}</td>
                  <td>{entry.weight}</td>
                  <td>{entry.intake}</td>
                  <td>{entry.protein}</td>
                  <td>{entry.steps}</td>
                  <td>{entry.deficit}</td>
                  <td className="action-buttons">
                    <button onClick={() => onEdit(index)} className="edit-button">Edit</button>
                    <button onClick={() => handleDelete(index)} className="delete-button">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Confirm
        isOpen={openConfirm}
        title="Confirm Deletion"
        content="Are you sure you want to delete this entry?"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
};

export default EntriesTable;
