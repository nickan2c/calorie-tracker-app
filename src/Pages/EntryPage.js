import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import EntriesTable from '../components/forms/EntriesTable';
import ListView from '../components/calendar/ListView';
import '../App.css';
import '../styles/components/EntryPage.css';
import { db } from '../firebaseConfig/firebaseConfig';
import { doc, setDoc, deleteDoc, collection } from 'firebase/firestore';
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

const EMPTY_FORM = {
  date: today,
  weight: '',
  intake: 0,
  protein: 0,
  steps: 0,
  cardio: '',
  exercise1: '',
  exercise2: '',
  notes: '',
  deficit: 0,
};

function EntryPage({ entries, fetchEntries, tdee, goalIntake, goalProtein, goalSteps }) {
  const { currentUser } = useAuth();
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

  const getMostRecentEntry = () => {
    const sortedEntries = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));
    return sortedEntries[0] || EMPTY_FORM;
  };

  const mostRecentEntry = getMostRecentEntry();

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newValue = name === "steps" || name === "intake" ? parseInt(value) || 0 : value;
    
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
      updated.deficit = calculateDeficit({ tdee, ...updated });
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
  
    // For new entries, check if we're overwriting
    if (editingIndex === -1 && entryExists && !confirmOverwrite) {
      setWarning(`Entry for ${docId} exists. Click again to overwrite.`);
      setConfirmOverwrite(true);
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
      await fetchEntries();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving entry:", error);
      setWarning("Error saving entry. Please try again.");
      return;
    }
  
    setForm(EMPTY_FORM);
    setEditingIndex(-1);
    setWarning('');
    setConfirmOverwrite(false);
    setConfirmUpdate(false);
    setFormErrors({});
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

  return (
    <div className="container">
      <div className="page-header">
        <h1>Calorie Tracker</h1>
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