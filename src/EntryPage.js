import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import InputField from './components/InputField';
import EntriesTable from './components/EntriesTable';
import './App.css';

const STEPS_BURN_RATE = 0.045; // Calories burnt per step
const KCAL_PER_KG = 7700; // Calories per kg of fat
const todays_date = new Date();
const DEFAULTFORMVALUES = {
  date: `${todays_date.getDate()}/${todays_date.getMonth() + 1}/${todays_date.getFullYear()}`,
  weight: 84,
  intake: 2000,
  protein: 150,
  steps: 10000,
  cardio: 300,
  exercise1: "Running",
  exercise2: "Cycling",
  notes: "Felt great today!"
};

function EntryPage({ entries, setEntries, tdee, goalIntake }) {
  const [form, setForm] = useState(DEFAULTFORMVALUES);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [warningMessage, setWarningMessage] = useState("");
  const [confirmOverwrite, setConfirmOverwrite] = useState(false);
  const [pendingForm, setPendingForm] = useState(null);

  const handleDelete = (index) => {
    // Directly delete the entry
    const updatedEntries = entries.filter((_, i) => i !== index);
    setEntries(updatedEntries); // Update the state to reflect the deletion
  };

  const calculateDeficit = (formData) => {
    const stepsBurnt = Number(formData.steps || 0) * STEPS_BURN_RATE;
    const cardio = Number(formData.cardio || 0);
    const intake = Number(formData.intake || 0);
    return Math.round((stepsBurnt + cardio - intake) * 100) / 100;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedForm = { ...form, [name]: value };
    updatedForm.deficit = calculateDeficit(updatedForm);
    setForm(updatedForm);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalEntry = { ...form, deficit: calculateDeficit(form) };

    const existingIndex = entries.findIndex(entry => entry.date === finalEntry.date);

    if (!confirmOverwrite && existingIndex !== -1 && editingIndex === -1) {
      setWarningMessage(`An entry for ${finalEntry.date} already exists. Click 'Add Entry' again to overwrite it.`);
      setConfirmOverwrite(true);
      setPendingForm(finalEntry);
      return;
    }

    const entryToSave = confirmOverwrite ? pendingForm : finalEntry;

    if (existingIndex !== -1) {
      const updated = [...entries];
      updated[existingIndex] = entryToSave;
      setEntries(updated);
    } else {
      setEntries([...entries, entryToSave]);
    }

    // Reset
    setForm(DEFAULTFORMVALUES);
    setConfirmOverwrite(false);
    setPendingForm(null);
    setWarningMessage("");
    setEditingIndex(-1);
  };

  const handleEdit = (index) => {
    setForm(entries[index]);
    setEditingIndex(index);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setForm(DEFAULTFORMVALUES);
    setEditingIndex(-1);
  };

  
  return (
    <div className="container">
      <h1>Calorie Tracker</h1>
      <p><strong>TDEE:</strong> {tdee} | <strong>Goal Caloric Intake:</strong> {goalIntake} | <strong>Goal Caloric Deficit:</strong> {goalIntake - tdee}</p>
    <p>
      At this goal rate, you will lose approximately  {Math.abs((goalIntake - tdee) * 7 / KCAL_PER_KG).toFixed(2)} kg of fat per week.
         </p>
         
      {warningMessage && <div className="warning">{warningMessage}</div>}

      <form onSubmit={handleSubmit} className="form-grid">
        <InputField label="Date" name="date" type="text" value={form.date} onChange={handleChange} />
        <InputField label="Weight (kg)" name="weight" type="number" value={form.weight} onChange={handleChange} />
        <InputField label="Calorie Intake" name="intake" type="number" value={form.intake} onChange={handleChange} />
        <InputField label="Protein (g)" name="protein" type="number" value={form.protein} onChange={handleChange} />
        <InputField label="Steps" name="steps" type="number" value={form.steps} onChange={handleChange} />
        <InputField label="Cardio (cal)" name="cardio" type="number" value={form.cardio} onChange={handleChange} />
        <InputField label="Exercise 1" name="exercise1" type="text" value={form.exercise1} onChange={handleChange} />
        <InputField label="Exercise 2" name="exercise2" type="text" value={form.exercise2} onChange={handleChange} />
        <InputField label="Notes" name="notes" type="text" value={form.notes} onChange={handleChange} />

        <div className="button-group">
          {editingIndex >= 0 ? (
            <>
              <button type="submit" className="update-button">Update Entry</button>
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
        onDelete={handleDelete} // Directly delete on button click
        editingIndex={editingIndex}
      />

      <Link to="/charts">View Charts</Link>
    </div>
  );
}

export default EntryPage;
