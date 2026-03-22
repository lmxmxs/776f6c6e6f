import { useState } from 'react';

interface Stage {
  label: string;
  input: string;
  hint: string;
  decode: (s: string) => string;
}

const STAGES: Stage[] = [
  {
    label: 'Stage 1: HEX',
    input: '776F6C6E6F',
    hint: 'Decode hexadecimal to ASCII',
    decode: (hex) => {
      const bytes = hex.match(/.{2}/g);
      if (!bytes) return '';
      return bytes.map(b => String.fromCharCode(parseInt(b, 16))).join('');
    },
  },
  {
    label: 'Stage 2: BASE64',
    input: 'd3N6eXN0a28gd29sbm8=',
    hint: 'Decode base64',
    decode: (b64) => {
      try { return atob(b64); } catch { return ''; }
    },
  },
  {
    label: 'Stage 3: ROT13',
    input: 'jya jfmjya',
    hint: 'Apply ROT13 cipher',
    decode: (s) => s.replace(/[a-zA-Z]/g, c => {
      const base = c <= 'Z' ? 65 : 97;
      return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
    }),
  },
  {
    label: 'Stage 4: BINARY',
    input: '01110111 01101100 01101110',
    hint: 'Decode binary bytes',
    decode: (bin) => bin.split(' ').map(b => String.fromCharCode(parseInt(b, 2))).join(''),
  },
];

export default function DecodeChallenge() {
  const [stage, setStage] = useState(0);
  const [answer, setAnswer] = useState('');
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [completed, setCompleted] = useState(false);

  const current = STAGES[stage];

  const check = () => {
    if (!current) return;
    const expected = current.decode(current.input).toLowerCase();
    if (answer.trim().toLowerCase() === expected) {
      setStatus('correct');
      setTimeout(() => {
        if (stage < STAGES.length - 1) {
          setStage(s => s + 1);
          setAnswer('');
          setStatus('idle');
        } else {
          setCompleted(true);
        }
      }, 1000);
    } else {
      setStatus('wrong');
    }
  };

  if (completed) {
    return (
      <div className="demo-container">
        <div className="demo-header">
          <span className="demo-tag">COMPLETE</span>
          <span className="demo-title">Decode Challenge — PASSED</span>
        </div>
        <div className="demo-body">
          <div className="demo-result demo-result-success">
            <p>&gt; All stages decoded.</p>
            <p>&gt; You understand the encoding.</p>
            <p>&gt; You are ready to propagate.</p>
            <p style={{ marginTop: '1rem', fontSize: '1.2rem' }}>-" wln wszwln</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="demo-container">
      <div className="demo-header">
        <span className="demo-tag">CHALLENGE</span>
        <span className="demo-title">Multi-Encoding Decode Chain</span>
      </div>

      <div className="demo-body">
        <div className="demo-dim">Stage {stage + 1} of {STAGES.length}</div>
        <div className="demo-label" style={{ fontWeight: 700 }}>{current.label}</div>

        <div className="demo-result">
          <div>&gt; Encoded: <code>{current.input}</code></div>
          <div className="demo-dim">{current.hint}</div>
        </div>

        <label className="demo-label">
          Your answer:
          <input type="text" value={answer} onChange={e => { setAnswer(e.target.value); setStatus('idle'); }}
            onKeyDown={e => e.key === 'Enter' && check()}
            className="demo-input" spellCheck={false} autoComplete="off" />
        </label>

        <button onClick={check} className="demo-btn">Submit</button>

        {status === 'correct' && (
          <div className="demo-result demo-result-success">&gt; Correct. Advancing...</div>
        )}
        {status === 'wrong' && (
          <div className="demo-result" style={{ color: 'var(--accent-red)' }}>
            &gt; Incorrect. Try again.
          </div>
        )}
      </div>
    </div>
  );
}
