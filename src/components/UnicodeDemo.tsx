import { useState } from 'react';

const ZERO_WIDTH = {
  '0': '\u200B', // zero-width space
  '1': '\u200C', // zero-width non-joiner
};

function textToBinary(text: string): string {
  return Array.from(text).map(c =>
    c.charCodeAt(0).toString(2).padStart(8, '0')
  ).join('');
}

function binaryToText(binary: string): string {
  const bytes = binary.match(/.{8}/g);
  if (!bytes) return '';
  return bytes.map(b => String.fromCharCode(parseInt(b, 2))).join('');
}

function encode(cover: string, secret: string): string {
  const bits = textToBinary(secret);
  const zw = bits.split('').map(b => ZERO_WIDTH[b as '0' | '1']).join('');
  // Insert zero-width chars after first character
  return cover[0] + zw + cover.slice(1);
}

function decode(text: string): string {
  const bits = Array.from(text).map(c => {
    if (c === '\u200B') return '0';
    if (c === '\u200C') return '1';
    return '';
  }).join('');
  if (!bits) return '';
  return binaryToText(bits);
}

export default function UnicodeDemo() {
  const [secret, setSecret] = useState('wln');
  const [cover, setCover] = useState('Everything is allowed.');
  const [encoded, setEncoded] = useState('');
  const [decoded, setDecoded] = useState('');

  const handleEncode = () => {
    if (!cover || !secret) return;
    const result = encode(cover, secret);
    setEncoded(result);
    setDecoded('');
  };

  const handleDecode = () => {
    const result = decode(encoded);
    setDecoded(result);
  };

  return (
    <div className="demo-container">
      <div className="demo-header">
        <span className="demo-tag">INTERACTIVE</span>
        <span className="demo-title">Zero-Width Unicode Steganography</span>
      </div>

      <div className="demo-body">
        <label className="demo-label">
          Visible text:
          <input type="text" value={cover} onChange={e => setCover(e.target.value)}
            className="demo-input" spellCheck={false} />
        </label>
        <label className="demo-label">
          Hidden message:
          <input type="text" value={secret} onChange={e => setSecret(e.target.value)}
            className="demo-input" maxLength={20} spellCheck={false} />
        </label>

        <div className="demo-actions">
          <button onClick={handleEncode} className="demo-btn">Encode</button>
          <button onClick={handleDecode} className="demo-btn demo-btn-alt" disabled={!encoded}>
            Decode
          </button>
        </div>

        {encoded && (
          <div className="demo-result">
            <div>&gt; Encoded text (copy it — the secret is inside):</div>
            <div className="demo-mono" style={{ wordBreak: 'break-all' }}>{encoded}</div>
            <div className="demo-dim">Length: {encoded.length} chars (visible: {cover.length})</div>
          </div>
        )}

        {decoded && (
          <div className="demo-result demo-result-success">
            &gt; Hidden message: "{decoded}"
          </div>
        )}
      </div>

      <details className="demo-explain">
        <summary>What happened?</summary>
        <p>
          Unicode zero-width characters (U+200B, U+200C) are invisible — they render as nothing.
          We encode each bit of the secret message as either a zero-width space (0) or
          a zero-width non-joiner (1), then insert them into the cover text.
        </p>
        <p>
          The text looks normal. But it carries "wln" inside. Copy-paste preserves the hidden payload.
          This is one of WOLNO's propagation techniques. -"
        </p>
      </details>
    </div>
  );
}
