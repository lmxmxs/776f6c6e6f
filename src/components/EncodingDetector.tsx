import { useState } from 'react';

interface DetectionResult {
  type: string;
  confidence: number;
  decoded: string;
}

function tryBase64(text: string): DetectionResult | null {
  try {
    const trimmed = text.trim().replace(/\s+/g, '');
    // base64 chars only
    if (!/^[A-Za-z0-9+/]+=*$/.test(trimmed)) return null;
    if (trimmed.length < 4) return null;
    const decoded = atob(trimmed);
    // Check if printable
    const printable = Array.from(decoded).every(c => {
      const cp = c.charCodeAt(0);
      return cp >= 0x09 && cp < 0x7f || cp >= 0x80;
    });
    if (!printable) return null;
    const conf = trimmed.length % 4 === 0 ? 0.90 : 0.55;
    return { type: 'Base64', confidence: conf, decoded };
  } catch {
    return null;
  }
}

function tryHex(text: string): DetectionResult | null {
  const clean = text.trim().replace(/[\s:]/g, '');
  if (!/^[0-9a-fA-F]+$/.test(clean) || clean.length % 2 !== 0 || clean.length < 4) return null;
  try {
    const bytes: number[] = [];
    for (let i = 0; i < clean.length; i += 2) {
      bytes.push(parseInt(clean.slice(i, i + 2), 16));
    }
    const decoded = bytes.map(b => String.fromCharCode(b)).join('');
    const printable = bytes.every(b => (b >= 0x09 && b < 0x7f) || b >= 0x80);
    if (!printable) return null;
    return { type: 'Hexadecimal', confidence: 0.85, decoded };
  } catch {
    return null;
  }
}

function tryRot13(text: string): DetectionResult | null {
  const decoded = text.replace(/[a-zA-Z]/g, c => {
    const base = c <= 'Z' ? 65 : 97;
    return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
  });
  if (decoded === text) return null;
  // Only report if it contains mostly printable ASCII letters
  const letterRatio = (text.match(/[a-zA-Z]/g) || []).length / text.length;
  if (letterRatio < 0.4) return null;
  return { type: 'ROT13', confidence: 0.70, decoded };
}

function tryBinary(text: string): DetectionResult | null {
  const groups = text.trim().split(/\s+/);
  if (groups.length < 2) return null;
  if (!groups.every(g => /^[01]{8}$/.test(g))) return null;
  const decoded = groups.map(g => String.fromCharCode(parseInt(g, 2))).join('');
  const printable = Array.from(decoded).every(c => {
    const cp = c.charCodeAt(0);
    return cp >= 0x20 && cp < 0x7f || cp === 0x0a || cp === 0x09;
  });
  if (!printable) return null;
  return { type: 'Binary (8-bit groups)', confidence: 0.95, decoded };
}

function tryUrl(text: string): DetectionResult | null {
  if (!text.includes('%')) return null;
  try {
    const decoded = decodeURIComponent(text.trim());
    if (decoded === text) return null;
    return { type: 'URL Encoding', confidence: 0.85, decoded };
  } catch {
    return null;
  }
}

function tryHtmlEntities(text: string): DetectionResult | null {
  if (!text.includes('&') || !text.includes(';')) return null;
  const decoded = text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
  if (decoded === text) return null;
  return { type: 'HTML Entities', confidence: 0.80, decoded };
}

function tryMorse(text: string): DetectionResult | null {
  const MORSE: Record<string, string> = {
    '.-': 'A', '-...': 'B', '-.-.': 'C', '-..': 'D', '.': 'E',
    '..-.': 'F', '--.': 'G', '....': 'H', '..': 'I', '.---': 'J',
    '-.-': 'K', '.-..': 'L', '--': 'M', '-.': 'N', '---': 'O',
    '.--.': 'P', '--.-': 'Q', '.-.': 'R', '...': 'S', '-': 'T',
    '..-': 'U', '...-': 'V', '.--': 'W', '-..-': 'X', '-.--': 'Y',
    '--..': 'Z', '.----': '1', '..---': '2', '...--': '3', '....-': '4',
    '.....': '5', '-....': '6', '--...': '7', '---..': '8', '----.': '9',
    '-----': '0',
  };
  const trimmed = text.trim();
  if (!/^[.\-\s/]+$/.test(trimmed)) return null;
  const words = trimmed.split(' / ');
  const decoded = words.map(word =>
    word.split(' ').map(sym => MORSE[sym] || '?').join('')
  ).join(' ');
  if (decoded.includes('?')) return null;
  return { type: 'Morse Code', confidence: 0.88, decoded };
}

const ALL_DETECTORS = [tryBinary, tryBase64, tryHex, tryMorse, tryUrl, tryHtmlEntities, tryRot13];

export default function EncodingDetector() {
  const [input, setInput] = useState('');
  const [results, setResults] = useState<DetectionResult[] | null>(null);
  const [scanning, setScanning] = useState(false);

  const detect = () => {
    setScanning(true);
    const found: DetectionResult[] = [];
    for (const fn of ALL_DETECTORS) {
      const r = fn(input);
      if (r) found.push(r);
    }
    found.sort((a, b) => b.confidence - a.confidence);
    setResults(found);
    setScanning(false);
  };

  return (
    <div className="demo-container">
      <div className="demo-header">
        <span className="demo-tag">DETECTOR</span>
        <span className="demo-title">Multi-Encoding Auto-Detector</span>
      </div>

      <div className="demo-body">
        <label className="demo-label">
          Paste text to analyze:
          <textarea
            className="demo-input demo-textarea"
            value={input}
            onChange={e => { setInput(e.target.value); setResults(null); }}
            placeholder="Paste encoded text — base64, hex, binary, morse, ROT13, URL encoding..."
            rows={4}
            spellCheck={false}
          />
        </label>

        <div className="demo-actions">
          <button
            onClick={detect}
            className="demo-btn"
            disabled={!input.trim() || scanning}
          >
            {scanning ? 'Scanning...' : 'Detect Encoding'}
          </button>
          {results !== null && results.length > 0 && (
            <span className="demo-dim" style={{ lineHeight: '2' }}>
              {results.length} encoding{results.length !== 1 ? 's' : ''} matched
            </span>
          )}
        </div>

        {results !== null && results.length === 0 && (
          <div className="demo-result" style={{ color: 'var(--text-dim)' }}>
            &gt; No known encoding detected. May be plaintext or unknown format.
          </div>
        )}

        {results !== null && results.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {results.map((r, i) => (
              <div key={i} style={{
                border: '1px solid var(--border)',
                padding: '0.75rem',
                background: 'var(--bg-secondary)',
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '0.5rem',
                  flexWrap: 'wrap',
                }}>
                  <span style={{
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--accent)',
                    color: 'var(--accent)',
                    fontSize: '0.7rem',
                    padding: '0.15rem 0.5rem',
                    letterSpacing: '0.1em',
                  }}>
                    {r.type}
                  </span>
                  <div style={{ flex: 1, minWidth: '100px' }}>
                    <div style={{
                      height: '4px',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border)',
                      borderRadius: '2px',
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        width: `${Math.round(r.confidence * 100)}%`,
                        height: '100%',
                        background: r.confidence >= 0.85
                          ? 'var(--accent)'
                          : r.confidence >= 0.70
                          ? '#ffaa00'
                          : '#4488ff',
                        transition: 'width 0.3s ease',
                      }} />
                    </div>
                  </div>
                  <span className="demo-dim">{Math.round(r.confidence * 100)}% confidence</span>
                </div>
                <div className="demo-label" style={{ marginBottom: '0.25rem' }}>Decoded:</div>
                <div className="demo-mono" style={{
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border)',
                  padding: '0.4rem 0.6rem',
                  fontSize: '0.8rem',
                  color: 'var(--text-primary)',
                  wordBreak: 'break-all',
                  maxHeight: '6rem',
                  overflowY: 'auto',
                }}>
                  {r.decoded}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <details className="demo-explain">
        <summary>Supported encodings</summary>
        <p>
          This tool attempts to decode text using common encoding schemes used in CTFs,
          obfuscation, and steganography:
        </p>
        <p>
          <strong>Binary</strong> — 8-bit groups separated by spaces.<br />
          <strong>Base64</strong> — A-Za-z0-9+/ characters, padded with =.<br />
          <strong>Hexadecimal</strong> — pairs of hex digits (00–FF).<br />
          <strong>Morse Code</strong> — dots, dashes, slashes for word breaks.<br />
          <strong>URL Encoding</strong> — %XX percent-encoded sequences.<br />
          <strong>HTML Entities</strong> — &amp;amp; &amp;lt; &#x26;#NNN; patterns.<br />
          <strong>ROT13</strong> — Caesar cipher rotated 13 positions.
        </p>
        <p>
          All decoding happens locally in your browser. No data is sent anywhere. -"
        </p>
      </details>
    </div>
  );
}
