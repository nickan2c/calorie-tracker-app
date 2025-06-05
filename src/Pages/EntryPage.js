import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import EntriesTable from '../components/forms/EntriesTable';
import ListView from '../components/calendar/ListView';
import '../App.css';
import '../styles/components/EntryPage.css';
import { db } from '../firebaseConfig/firebaseConfig';
import { doc, setDoc, deleteDoc, collection, getDoc } from 'firebase/firestore';
import CalendarGrid from '../components/calendar/CalendarGrid';
import EntryModal from '../components/forms/EntryModal';
import SettingsSummary from '../components/common/SettingsSummary';
import { calculateDeficit } from '../helper';
import { useAuth } from '../context/AuthContext';

// Constants
const STEPS_BURN_RATE = 0.045;
const KCAL_PER_KG = 7700;

const formatDate = (date) => date.toISOString().split("T")[0];
const today = formatDate(new Date());

// Calculate current streak of consecutive days with entries
const calculateStreak = (entries) => {
  if (!entries || entries.length === 0) return 0;
  
  const sortedEntries = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));
  const entryDates = new Set(sortedEntries.map(entry => entry.date));
  
  let streak = 0;
  let currentDate = new Date();
  
  // Check consecutive days backwards from today
  while (true) {
    const dateString = formatDate(currentDate);
    if (entryDates.has(dateString)) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }
  
  return streak;
};

const EMPTY_FORM = {
  date: today,
  weight: '',
  intake: '',
  protein: '',
  steps: '',
  cardio: '',
  exercise1: '',
  exercise2: '',
  notes: '',
  deficit: 0,
};

function EntryPage({ entries, fetchEntries, tdee, goalIntake, goalProtein, goalSteps, reasonWhy, onReasonWhyUpdate }) {
  const { currentUser } = useAuth();
  const [username, setUsername] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const [viewMode, setViewMode] = useState('grid');
  const [editingIndex, setEditingIndex] = useState(-1);
  const [warning, setWarning] = useState('');
  const [confirmOverwrite, setConfirmOverwrite] = useState(false);
  const [confirmUpdate, setConfirmUpdate] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState('calories');
  const [isEditingReason, setIsEditingReason] = useState(false);
  const [tempReasonWhy, setTempReasonWhy] = useState(reasonWhy);

  useEffect(() => {
    const fetchUsername = async () => {
      if (currentUser) {
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists() && docSnap.data().username) {
            setUsername(docSnap.data().username);
          }
        } catch (error) {
          console.error("Error fetching username:", error);
        }
      }
    };
    fetchUsername();
  }, [currentUser]);

  useEffect(() => {
    setTempReasonWhy(reasonWhy);
  }, [reasonWhy]);

  const getMostRecentEntry = () => {
    const sortedEntries = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));
    return sortedEntries[0] || EMPTY_FORM;
  };

  const mostRecentEntry = getMostRecentEntry();

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Allow empty values for numeric fields
    const newValue = value === '' ? '' : 
      (name === "steps" || name === "intake") ? parseInt(value) || value : value;
    
    let updated = { ...form, [name]: newValue };

    if (name === "date") {
      const existingEntryIndex = entries.findIndex(entry => entry.date === value);
      if (existingEntryIndex >= 0) {
        const existingEntry = entries[existingEntryIndex];
        updated = {
          ...existingEntry,
          deficit: calculateDeficit({ tdee, ...existingEntry })
        };
        setFormErrors({});
        setEditingIndex(existingEntryIndex);
      } else {
        updated.deficit = calculateDeficit({ tdee, ...updated });
        setEditingIndex(-1);
      }
    } else {
      // Only calculate deficit if numeric fields have values
      const numericFields = {
        ...updated,
        intake: updated.intake === '' ? 0 : Number(updated.intake),
        steps: updated.steps === '' ? 0 : Number(updated.steps)
      };
      updated.deficit = calculateDeficit({ tdee, ...numericFields });
    }

    setForm(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const hasData = Object.entries(form).some(
      ([key, value]) => key !== 'date' && value !== '' && value !== 0
    );
  
    if (!hasData) {
      setWarning("Please fill in at least one field.");
      return;
    }
  
    const final = {
      ...form,
      intake: Number(form.intake || 0),
      protein: Number(form.protein || 0),
      steps: Number(form.steps || 0),
      cardio: Number(form.cardio || 0),
      deficit: calculateDeficit({ tdee, ...form }),
    };
  
    const docId = final.date;
    const entryExists = entries.some(entry => entry.date === docId);
  
    // For new entries, if an entry exists for that date, don't allow overwriting
    if (editingIndex === -1 && entryExists) {
      setWarning(`An entry for ${docId} already exists. Please edit the existing entry instead.`);
      return;
    }

    // For updates, ask for confirmation
    if (editingIndex >= 0 && !confirmUpdate) {
      setWarning("Are you sure you want to update this entry?");
      setConfirmUpdate(true);
      return;
    }
  
    try {
      // Save entry in user's subcollection
      const userEntriesRef = collection(db, "users", currentUser.uid, "healthData");
      await setDoc(doc(userEntriesRef, docId), final);
      
      // Reset all state before fetching new entries
      setForm(EMPTY_FORM);
      setEditingIndex(-1);
      setWarning('');
      setConfirmOverwrite(false);
      setConfirmUpdate(false);
      setFormErrors({});
      setIsModalOpen(false);
      
      // Fetch updated entries
      await fetchEntries();
    } catch (error) {
      console.error("Error saving entry:", error);
      setWarning("Error saving entry. Please try again.");
      return;
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setWarning("Are you sure you want to delete this entry?");
      setConfirmDelete(true);
      return;
    }

    try {
      // Delete from user's subcollection
      const userEntryRef = doc(db, "users", currentUser.uid, "healthData", form.date);
      await deleteDoc(userEntryRef);
      await fetchEntries();
      setIsModalOpen(false);
      setForm(EMPTY_FORM);
      setEditingIndex(-1);
      setWarning('');
      setConfirmDelete(false);
    } catch (error) {
      console.error("Error deleting entry:", error);
      setWarning("Error deleting entry. Please try again.");
    }
  };

  const handleEdit = (index) => {
    if (index >= 0) {
      const entry = entries[index];
      const formData = {
        ...entry,
        deficit: calculateDeficit({ tdee, ...entry })
      };
      setForm(formData);
      setEditingIndex(index);
    } else {
      // For new entries, set today's date
      setForm({
        ...EMPTY_FORM,
        date: today
      });
      setEditingIndex(-1);
    }
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    const todayEntry = entries.find(entry => entry.date === today);
    if (todayEntry) {
      // If there's an entry for today, switch to edit mode
      const index = entries.findIndex(entry => entry.date === today);
      setForm({
        ...todayEntry,
        deficit: calculateDeficit({ tdee, ...todayEntry })
      });
      setEditingIndex(index);
    } else {
      // Otherwise, start with an empty form
      setForm({
        ...EMPTY_FORM,
        date: today
      });
      setEditingIndex(-1);
    }
    setWarning('');
    setConfirmOverwrite(false);
    setConfirmUpdate(false);
    setConfirmDelete(false);
    setIsModalOpen(true);
  };

  const cancelEdit = () => {
    setForm(EMPTY_FORM);
    setEditingIndex(-1);
    setWarning('');
    setConfirmOverwrite(false);
    setConfirmUpdate(false);
    setConfirmDelete(false);
    setIsModalOpen(false);
  };

  const fatLossPerWeek = ((goalIntake - tdee) * 7 / KCAL_PER_KG).toFixed(2);

  const currentStreak = calculateStreak(entries);

  return (
    <div className="container">
      <div className="page-header">
        <div className="header-content">
          <h1 className="welcome-message">Welcome back, {username || 'King'}</h1>
          <div className="streak-display">
            <span className="streak-emoji">🔥</span>
            <span className="streak-text">
              {currentStreak} day{currentStreak !== 1 ? 's' : ''} streak
            </span>
          </div>
          <div className="reason-why-container">
            <div className="reason-why-label">Your Why:</div>
            {isEditingReason ? (
              <div className="reason-why-edit">
                <input
                  type="text"
                  value={tempReasonWhy}
                  onChange={(e) => setTempReasonWhy(e.target.value)}
                  className="reason-why-input"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      onReasonWhyUpdate(tempReasonWhy);
                      setIsEditingReason(false);
                    }
                    if (e.key === 'Escape') {
                      setTempReasonWhy(reasonWhy);
                      setIsEditingReason(false);
                    }
                  }}
                  autoFocus
                />
                <button 
                  onClick={() => {
                    onReasonWhyUpdate(tempReasonWhy);
                    setIsEditingReason(false);
                  }}
                  className="reason-why-save"
                >
                  ✓
                </button>
                <button 
                  onClick={() => {
                    setTempReasonWhy(reasonWhy);
                    setIsEditingReason(false);
                  }}
                  className="reason-why-cancel"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="reason-why-display">
                <span className="reason-why-text">"{reasonWhy}"</span>
                <button 
                  onClick={() => {
                    setTempReasonWhy(reasonWhy);
                    setIsEditingReason(true);
                  }}
                  className="reason-why-edit-btn"
                >
                  ✏️
                </button>
              </div>
            )}
          </div>
        </div>
        <button className="add-entry-button" onClick={handleAdd}>
          + Add Entry
        </button>
      </div>

      <SettingsSummary 
        tdee={tdee}
        goalIntake={goalIntake}
        goalProtein={goalProtein}
        goalSteps={goalSteps}
      />

      <div className="view-toggle">
        <button onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}>
          Switch to {viewMode === 'list' ? 'Grid View 📅' : 'List View 📋'}
        </button>
      </div>

      {viewMode === 'list' ? (
        <ListView
          entries={entries}
          onEdit={handleEdit}
          goals={{
            goalIntake,
            goalProtein,
            goalSteps
          }}
        />
      ) : (
        <CalendarGrid
          entries={entries}
          onEdit={handleEdit}
          goals={{
            goalIntake,
            goalProtein,
            goalSteps
          }}
          selectedMetric={selectedMetric}
          setSelectedMetric={setSelectedMetric}
        />
      )}

      <EntryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
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

      <Link to="/charts" className="charts-link">📈 View Charts</Link>
    </div>
  );
}

export default EntryPage;