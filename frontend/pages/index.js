import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Home() {
  const [textInput, setTextInput] = useState('');
  const [lastText, setLastText] = useState('Waiting...');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLastText = async () => {
      try {
        const res = await axios.get('http://192.168.1.10:5000/api/last-text');
        setLastText(res.data?.textInput || 'Waiting...');
      } catch {
        setLastText('⚠️ Cannot fetch text from RPi');
      }
    };

    const interval = setInterval(fetchLastText, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleManualOpen = async () => {
    if (!textInput.trim()) {
      setStatus('Please enter a TUPC ID');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/manual-open', {
        textInput: textInput.trim(),
      });

      const { lockerToOpen, error } = res.data;

      if (lockerToOpen) {
        setStatus(`Locker ${lockerToOpen} opened`);
        setTextInput('');
      } else if (error) {
        const messages = {
          no_input_provided: "Missing input",
          user_not_in_lockerSlot: "User not found in lockerSlot",
          server_error: "Server error",
        };
        setStatus(messages[error] || ` ${error}`);
      } else {
        setStatus('Unexpected server response');
      }
    } catch (err) {
      setStatus('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial' }}>
      <h1>Emergency Locker Open</h1>

      <div>
        <strong>Last Text from RPi:</strong>
        <p>{lastText}</p>
      </div>

      <div style={{ marginTop: '1rem' }}>
        <input
          type="text"
          placeholder="Enter TUPC ID"
          value={textInput}
          onChange={e => setTextInput(e.target.value)}
          disabled={loading}
        />
        <button onClick={handleManualOpen} disabled={loading}>
          {loading ? 'Sending...' : 'Send to RPi'}
        </button>
      </div>

      <p>Status: {status}</p>
    </div>
  );
}
