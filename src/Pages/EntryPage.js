import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import InputField from '../components/InputField';
import EntriesTable from '../components/EntriesTable';
import '../App.css';
import './EntryPage.css'; // Import the new CSS file
import { db } from '../firebaseConfig/firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import CalendarGrid from '../components/CalendarGrid';
import EntryForm from '../components/EntryForm';
import { calculateDeficit } from '../helper'; // Assuming you have a utility function for this

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
  const [form, setForm] = useState(EMPTY_FORM);
  const [viewMode, setViewMode] = useState('grid'); // 'list' or 'grid'
  const [editingIndex, setEditingIndex] = useState(-1);
  const [warning, setWarning] = useState('');
  const [confirmOverwrite, setConfirmOverwrite] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Find the most recent entry from the list
  const getMostRecentEntry = () => {
    const sortedEntries = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));
    return sortedEntries[0] || EMPTY_FORM;
  };

  const mostRecentEntry = getMostRecentEntry();

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Convert to integers where appropriate
    const newValue = name === "steps" || name === "intake" ? parseInt(value) : value;
    let updated = { ...form, [name]: newValue };

    if (name === "date") {
      // fetch entry for selected date and prepopulate form
      const existingEntry = entries.find(entry => entry.date === value);
      if (existingEntry) {
        updated = { ...existingEntry, date: value };
        updated.deficit = calculateDeficit({ tdee, ...updated });
        setFormErrors({});
      } else {
        // use latest entry as a template
        updated.deficit = calculateDeficit({ tdee, ...updated });
      }

    }
    updated.deficit = calculateDeficit({tdee, ...updated});
    setForm(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Check if all form values are empty (ignoring `date`)
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
  
    if (!editingIndex >= 0 && entryExists && !confirmOverwrite) {
      setWarning(`Entry for ${docId} exists. Click again to overwrite.`);
      setConfirmOverwrite(true);
      return;
    }
  
    try {
      await setDoc(doc(db, "entries", docId), final);
      await fetchEntries();
    } catch (error) {
      console.error("Error saving entry:", error);
    }
  
    setForm(EMPTY_FORM);
    setEditingIndex(-1);
    setWarning('');
    setConfirmOverwrite(false);
    setFormErrors({});
  };
  
  const handleEdit = (index) => {
    const entry = entries[index];
    entry.deficit = calculateDeficit({ tdee, ...entry });
    setForm(entry);
    setEditingIndex(index);
    window.scrollTo({ top: 200, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setForm(EMPTY_FORM);
    setEditingIndex(-1);
    setWarning('');
  };

  const fatLossPerWeek = ((goalIntake - tdee) * 7 / KCAL_PER_KG).toFixed(2);

  return (
    <div className="container">
      <h1>Calorie Tracker</h1>
      <p>
        <strong>TDEE:</strong> {tdee} | 
        <strong> Goal Intake:</strong> {goalIntake} | 
        <strong> Deficit:</strong> {goalIntake - tdee} kcal/day
      </p>
      <p>You will lose approx. <strong>{Math.abs(fatLossPerWeek)} kg/week</strong> at this rate.</p>

      {warning && <div className="warning">{warning}</div>}

      <EntryForm
        form={form}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        cancelEdit={cancelEdit}
        editingIndex={editingIndex}
        warning={warning}
        formErrors={formErrors}
        mostRecentEntry={mostRecentEntry}
      />



      <div className="view-toggle">
  <button onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}>
    Switch to {viewMode === 'list' ? 'Grid View 📅' : 'List View 📋'}
  </button>
</div>


      {viewMode === 'list' ? (
  <EntriesTable
    entries={entries}
    onEdit={handleEdit}
    editingIndex={editingIndex}
    refreshEntries={fetchEntries}
  />
) : (
  <CalendarGrid
    entries={entries}
    onEdit={handleEdit}
    editingIndex={editingIndex}
    setEditingIndex={setEditingIndex}
    fetchEntries={fetchEntries}
    tdee={tdee}
    goalIntake={goalIntake}
    goals = {
      {goalIntake,
      goalProtein, 
      goalSteps}
    }
    setForm={setForm}
  />
)}


      <Link to="/charts">📈 View Charts</Link>
    </div>
  );
}

export default EntryPage;