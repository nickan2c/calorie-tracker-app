import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchEntries, saveEntry, deleteEntry } from '../services/firebase';
import { sortEntriesByDate } from '../utils/dateUtils';
import { calculateDeficit } from '../utils/metricUtils';

export const useEntries = (goals) => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const loadEntries = async () => {
      try {
        const fetchedEntries = await fetchEntries(user.uid);
        const sortedEntries = sortEntriesByDate(fetchedEntries);
        setEntries(sortedEntries);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    if (user) {
      loadEntries();
    }
  }, [user]);

  const addEntry = async (entry) => {
    try {
      const entryWithDeficit = {
        ...entry,
        deficit: calculateDeficit({ ...entry, tdee: goals.tdee })
      };
      await saveEntry(user.uid, entryWithDeficit);
      setEntries(prev => sortEntriesByDate([...prev, entryWithDeficit]));
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  const removeEntry = async (date) => {
    try {
      await deleteEntry(user.uid, date);
      setEntries(prev => prev.filter(entry => entry.date !== date));
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  return {
    entries,
    loading,
    error,
    addEntry,
    removeEntry
  };
}; 