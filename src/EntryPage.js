import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import InputField from './components/InputField';
import EntriesTable from './components/EntriesTable';
import './App.css';
import { db } from './firebaseConfig/firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';

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

function EntryPage({ entries, setEntries, fetchEntries, tdee, goalIntake }) {
  const [form, setForm] = useState(EMPTY_FORM);
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

  const calculateDeficit = ({ steps, cardio, intake, tdee }) => {
    return Math.round(intake - tdee - Number(cardio || 0));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Convert to integers where appropriate
    const newValue = name === "steps" || name === "intake" ? parseInt(value) : value;
    let updated = { ...form, [name]: newValue };

    updated.deficit = calculateDeficit({tdee, ...updated});
    setForm(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const errors = {};
    if (!form.intake) errors.intake = true;
    if (!form.protein) errors.protein = true;
  
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
  
    const final = {
      ...form,
      intake: Number(form.intake),
      protein: Number(form.protein),
      steps: Number(form.steps),
      cardio: Number(form.cardio),
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

      <form onSubmit={handleSubmit} className="form-grid">
        <InputField 
          label="Date" 
          name="date" 
          type="date" 
          value={form.date} 
          onChange={handleChange} 
        />
        <InputField 
          label="Weight (kg)" 
          name="weight" 
          type="number" 
          value={form.weight} 
          onChange={handleChange} 
          placeholder={mostRecentEntry.weight || 'e.g. 84'} 
        />
        <InputField 
          label="Calorie Intake" 
          name="intake" 
          type="number" 
          value={form.intake} 
          onChange={handleChange} 
          placeholder={mostRecentEntry.intake || 'e.g. 2000'} 
          required 
          hasError={formErrors.intake}  // Add error styling if intake is invalid
        />
        <InputField 
          label="Protein (g)" 
          name="protein" 
          type="number" 
          value={form.protein} 
          onChange={handleChange} 
          placeholder={mostRecentEntry.protein || 'e.g. 150'} 
          required 
          hasError={formErrors.protein}  // Add error styling if protein is invalid
        />
        <InputField 
          label="Steps" 
          name="steps" 
          type="number" 
          value={form.steps} 
          onChange={handleChange} 
          placeholder={mostRecentEntry.steps || 'e.g. 10000'} 
        />
        <InputField 
          label="Cardio (cal)" 
          name="cardio" 
          type="number" 
          value={form.cardio} 
          onChange={handleChange} 
          placeholder={mostRecentEntry.cardio || 'e.g. 300'} 
        />
        <InputField 
          label="Exercise 1" 
          name="exercise1" 
          type="text" 
          value={form.exercise1} 
          onChange={handleChange} 
          placeholder={mostRecentEntry.exercise1 || 'e.g. Running'} 
        />
        <InputField 
          label="Exercise 2" 
          name="exercise2" 
          type="text" 
          value={form.exercise2} 
          onChange={handleChange} 
          placeholder={mostRecentEntry.exercise2 || 'e.g. Cycling'} 
        />
        <InputField 
          label="Notes" 
          name="notes" 
          type="text" 
          value={form.notes} 
          onChange={handleChange} 
          placeholder={mostRecentEntry.notes || 'e.g. Felt great today!'} 
        />

        <div className="button-group">
          {editingIndex >= 0 ? (
            <>
              <button type="submit" className="update-button">Update</button>
              <button type="button" className="cancel-button" onClick={cancelEdit}>Cancel</button>
            </>
          ) : (
            <button type="submit">Add Entry</button>
          )}
        </div>
      </form>

      <EntriesTable
        entries={entries}
        onEdit={handleEdit}
        editingIndex={editingIndex}
        refreshEntries={fetchEntries}
      />

      <Link to="/charts">📈 View Charts</Link>
    </div>
  );
}

export default EntryPage;
