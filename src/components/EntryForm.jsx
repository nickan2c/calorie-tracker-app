import React from 'react';
import InputField from './InputField';
import '../style/EntryForm.css';

const EntryForm = ({
  form,
  handleChange,
  handleSubmit,
  cancelEdit,
  editingIndex,
  warning,
  formErrors,
  mostRecentEntry
}) => {
  return (
    <form onSubmit={handleSubmit} className="form-grid entry-form">
      {warning && <div className="warning">{warning}</div>}

      <InputField label="📅 Date" name="date" type="date" value={form.date} onChange={handleChange} />
      <InputField label="⚖️ Weight (kg)" name="weight" type="number" value={form.weight} onChange={handleChange} placeholder={mostRecentEntry.weight || 'e.g. 84'} />
      <InputField label="🍽️ Calorie Intake" name="intake" type="number" value={form.intake} onChange={handleChange} placeholder={mostRecentEntry.intake || 'e.g. 2000'} required hasError={formErrors.intake} />
      <InputField label="🥩 Protein (g)" name="protein" type="number" value={form.protein} onChange={handleChange} placeholder={mostRecentEntry.protein || 'e.g. 150'} required hasError={formErrors.protein} />
      <InputField label="👣 Steps" name="steps" type="number" value={form.steps} onChange={handleChange} placeholder={mostRecentEntry.steps || 'e.g. 10000'} />
      <InputField label="❤️‍🔥 Cardio (cal)" name="cardio" type="number" value={form.cardio} onChange={handleChange} placeholder={mostRecentEntry.cardio || 'e.g. 300'} />
      <InputField label="🏋️ Exercise 1" name="exercise1" type="textarea" value={form.exercise1} onChange={handleChange} placeholder={mostRecentEntry.exercise1 || 'e.g. Running'} />
      <InputField label="🏃 Exercise 2" name="exercise2" type="textarea" value={form.exercise2} onChange={handleChange} placeholder={mostRecentEntry.exercise2 || 'e.g. Cycling'} />
      <div className="notes-field-wrapper">
         <InputField label="📝 Notes" name="notes" type="textarea" value={form.notes} onChange={handleChange} placeholder={mostRecentEntry.notes || 'e.g. Felt great today!'} />
      </div>

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
  );
};

export default EntryForm;
