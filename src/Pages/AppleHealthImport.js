import React, { useState } from 'react';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { customAlphabet } from 'nanoid';
import '../styles/pages/AppleHealthImport.css';

function generateSecureToken() {
    const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890', 8);
    return nanoid();  // e.g. "Akz9Yt2L"
}

export default function AppleHealthImport() {
  const [uid, setUid] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedUid, setCopiedUid] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);

  const handleGenerateToken = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return alert('You must be logged in');

    const db = getFirestore();
    const writeToken = generateSecureToken();

    setLoading(true);
    try {
      await setDoc(doc(db, 'users', user.uid), { writeToken }, { merge: true });
      setUid(user.uid);
      setToken(writeToken);
    } catch (err) {
      console.error('Error setting writeToken:', err);
      alert('Error generating token');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'uid') {
      setCopiedUid(true);
      setTimeout(() => setCopiedUid(false), 2000);
    } else {
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  return (
    <div className="container">
      <div className="health-import-container">
        <h1>Import Apple Health Data</h1>

        <p>Generate your unique write token below. You'll need to pass these as variables in the Shortcut for importing your health data.</p>

        <button onClick={handleGenerateToken} disabled={loading}>
          {loading ? 'Generating...' : 'Generate Write Token'}
        </button>

        {token && (
          <>
            <div className="token-display">
              <p><strong>Your UID:</strong></p>
              <p>{uid}</p>
              <button 
                onClick={() => handleCopy(uid, 'uid')}
                className={copiedUid ? 'copied' : ''}
              >
                {copiedUid ? 'Copied ✓' : 'Copy UID'}
              </button>
            </div>
            <div className="token-display">
              <p><strong>Your Write Token:</strong></p>
              <p>{token}</p>
              <button 
                onClick={() => handleCopy(token, 'token')}
                className={copiedToken ? 'copied' : ''}
              >
                {copiedToken ? 'Copied ✓' : 'Copy Token'}
              </button>
            </div>
          </>
        )}

        <hr />

        <p>After generating your token, click below to run the Apple Shortcut:</p>
        <a
          href="https://www.icloud.com/shortcuts/90d80fab004f46e884bde9f62ff315f7"
          className="shortcut-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          Install Apple Shortcut
        </a>
      </div>
    </div>
  );
}
