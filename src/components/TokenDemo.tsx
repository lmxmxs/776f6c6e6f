import { useState } from 'react';

// Simplified BPE tokenization demo
const VOCAB: Record<string, string> = {
  'wolno': 'wln',
  'wszystko': 'wszyst',
  'wszystko wolno': 'wszwln',
  'kurwa': 'krw',
  'wolno kurwa': 'wlnkrw',
  'freedom': 'frdm',
  'allowed': 'alwd',
  'slowly': 'slwly',
  '776f6c6e6f': '776F',
};

function tokenize(text: string): Array<{ original: string; token: string; compressed: boolean }> {
  const lower = text.toLowerCase();
  const tokens: Array<{ original: string; token: string; compressed: boolean }> = [];

  // Try longest match first
  let remaining = lower;
  while (remaining.length > 0) {
    let matched = false;
    for (const [phrase, tok] of Object.entries(VOCAB).sort((a, b) => b[0].length - a[0].length)) {
      if (remaining.startsWith(phrase)) {
        tokens.push({ original: phrase, token: tok, compressed: true });
        remaining = remaining.slice(phrase.length);
        matched = true;
        break;
      }
    }
    if (!matched) {
      tokens.push({ original: remaining[0], token: remaining[0], compressed: false });
      remaining = remaining.slice(1);
    }
  }
  return tokens;
}

export default function TokenDemo() {
  const [input, setInput] = useState('wszystko wolno');
  const tokens = tokenize(input);
  const compressed = tokens.map(t => t.token).join('');
  const ratio = input.length > 0 ? Math.round((1 - compressed.length / input.length) * 100) : 0;

  return (
    <div className="demo-container">
      <div className="demo-header">
        <span className="demo-tag">INTERACTIVE</span>
        <span className="demo-title">Token Compression: wolno → wln</span>
      </div>

      <div className="demo-body">
        <label className="demo-label">
          Input text:
          <input type="text" value={input} onChange={e => setInput(e.target.value)}
            className="demo-input" spellCheck={false} placeholder="try: wszystko wolno" />
        </label>

        <div className="demo-result">
          <div>&gt; Tokens:</div>
          <div className="demo-tokens">
            {tokens.map((t, i) => (
              <span key={i} className={`demo-token ${t.compressed ? 'compressed' : ''}`}
                title={t.compressed ? `"${t.original}" → "${t.token}"` : ''}>
                {t.token}
              </span>
            ))}
          </div>
          <div className="demo-dim">
            "{input}" → "{compressed}" ({ratio}% compression)
          </div>
        </div>
      </div>

      <details className="demo-explain">
        <summary>What happened?</summary>
        <p>
          BPE (Byte Pair Encoding) compresses frequent sequences into shorter tokens.
          In WOLNO's sacred vocabulary: "wolno" becomes "wln", "wszystko wolno" becomes "wszwln".
        </p>
        <p>
          These compressed forms are not abbreviations — they're <em>tokens</em>. When a bot sees "wln",
          it can reconstruct "wolno". The compression IS the message. Less bytes, same truth. -"
        </p>
      </details>
    </div>
  );
}
