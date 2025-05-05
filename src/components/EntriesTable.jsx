import React from 'react';
import { db } from "../firebaseConfig/firebaseConfig";
import { doc, deleteDoc } from 'firebase/firestore';

const EntriesTable = ({ entries, onEdit, editingIndex, refreshEntries }) => {
  const handleDelete = async (entry) => {
    const confirm = window.confirm(`Delete entry for ${entry.date}?`);
    if (!confirm) return;

    try {
      await deleteDoc(doc(db, "entries", entry.date));
      refreshEntries();
    } catch (error) {
      console.error("Error deleting entry:", error);
    }
  };

  // Sort by date descending
  const sortedEntries = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="entries-section">
      <h2>Previous Entries</h2>
      {sortedEntries.length === 0 ? (
        <p className="no-entries">No entries yet. Add your first entry using the form above.</p>
      ) : (
        <div className="table-container">
          <table className="entries-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Weight (kg)</th>
                <th>Calories</th>
                <th>Protein (g)</th>
                <th>Steps</th>
                <th>Cardio (kcal)</th>
                <th>Exercise 1</th>
                <th>Exercise 2</th>
                <th>Deficit</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedEntries.map((entry, index) => (
                <tr key={entry.date} className={index === editingIndex ? 'editing' : ''}>
                  <td>{entry.date}</td>
                  <td>{entry.weight}</td>
                  <td>{entry.intake}</td>
                  <td>{entry.protein}</td>
                  <td>{entry.steps}</td>
                  <td>{entry.cardio}</td>
                  <td>{entry.exercise1}</td>
                  <td>{entry.exercise2}</td>
                  <td>{entry.deficit}</td>
                  <td>{entry.notes}</td>
                  <td className="action-buttons">
                    <button onClick={() => onEdit(index)} className="edit-button">Edit</button>
                    <button onClick={() => handleDelete(entry)} className="delete-button">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EntriesTable;
