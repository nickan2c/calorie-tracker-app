import React from 'react';
import { db } from '../../firebaseConfig/firebaseConfig';
import { doc, deleteDoc } from 'firebase/firestore';
import '../../styles/forms/EntriesTable.css';
import { getAuth } from 'firebase/auth';

const EntriesTable = ({ entries, onEdit, editingIndex, refreshEntries }) => {
  const handleDelete = async (entry) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        await deleteDoc(doc(db, "users", user.uid, "healthData", entry.date));
        refreshEntries();
      } catch (error) {
        console.error("Error deleting entry:", error);
        alert('Error deleting entry');
      }
    }
  };

  const sortedEntries = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));

  function getDayName(dateStr, locale)  {var date = new Date(dateStr);
      return date.toLocaleDateString(locale, { weekday: 'long' });}
  return (
    <div className="entries-section">
      <h2>📋 Entry Log</h2>
      {sortedEntries.length === 0 ? (
        <p className="no-entries">No entries yet. Add your first entry using the form above.</p>
      ) : (
        <div className="table-container">
          <table className="entries-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Weight</th>
                <th>Intake</th>
                <th>Deficit</th>
                <th>Steps</th>
                <th>Cardio</th>
                <th>Protein</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedEntries.map((entry, index) => {
                const isEditing = editingIndex === index;
                const isBad = entry.deficit > 0;
                const bgColor = isBad ? '#ffe5e5' : entry.deficit < 0 ? '#e5ffe5' : '#f9f9f9';

                return (
                  <React.Fragment key={entry.date}>
                    <tr style={{ backgroundColor: bgColor }} className={isEditing ? 'editing' : ''}>
                      <td> <p><b>{getDayName(entry.date)}</b>{" " +  entry.date}</p></td>
                      <td>{entry.weight || '-'}</td>
                      <td>{entry.intake ? Math.round(entry.intake) : '-'}</td>
                      <td>{entry.deficit ? Math.round(entry.deficit) : '-'}</td>
                      <td>{entry.steps || '-'}</td>
                      <td>{entry.cardio ? Math.round(entry.cardio) : '-'}</td>
                      <td>{entry.protein ? Math.round(entry.protein) : '-'}</td>
                      <td className="action-buttons">
                        <button onClick={() => onEdit(index)} className="edit-button">Edit✏️</button>
                        <button onClick={() => handleDelete(entry)} className="delete-button">Delete🗑️</button>
                      </td>
                    </tr>
                    <tr className="sub-row">
                      <td colSpan="7">
                        <div className="sub-details">
                          <span><strong>❤️‍🔥 Cardio:</strong> {entry.cardio || '—'}</span>
                          <span><strong>🏋️ Exercise 1:</strong> {entry.exercise1 || '—'}</span>
                          <span><strong>🏃 Exercise 2:</strong> {entry.exercise2 || '—'}</span>
                          <div className="notes"><strong>📝 Notes:</strong> {entry.notes || <i>No notes</i>}</div>
                        </div>
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EntriesTable;
