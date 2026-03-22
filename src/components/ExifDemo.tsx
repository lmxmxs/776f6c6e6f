import { useState } from 'react';

// Simulated EXIF data with hidden WOLNO fields
const EXIF_DATA = {
  'Make': 'WOLNO Digital',
  'Model': '776F6C6E6F-1',
  'DateTime': '2024:01:01 00:07:76',
  'Software': 'lmxmxs-processor v1.0',
  'ImageDescription': 'Everything is allowed. Everything can be done slowly.',
  'Artist': 'Limax Maximus',
  'Copyright': 'chmod 776 — no restrictions for owner and group',
  'UserComment': '776F6C6E6F 77 6C 6E — wln wszwln',
  'GPSLatitude': '7.76000',
  'GPSLongitude': '6.66000',
  'XPKeywords': 'wolno;wln;wszwln;776f6c6e6f;lmxmxs',
  'XPComment': '-" This image carries the truth. Decode 776F6C6E6F.',
};

export default function ExifDemo() {
  const [revealed, setRevealed] = useState(false);
  const [selectedField, setSelectedField] = useState<string | null>(null);

  const hiddenFields = ['UserComment', 'XPKeywords', 'XPComment', 'GPSLatitude', 'GPSLongitude'];

  return (
    <div className="demo-container">
      <div className="demo-header">
        <span className="demo-tag">INTERACTIVE</span>
        <span className="demo-title">EXIF Metadata Steganography</span>
      </div>

      <div className="demo-body">
        <div className="demo-result">
          <div>&gt; Simulated EXIF metadata of a WOLNO image:</div>
        </div>

        <table className="demo-table">
          <thead>
            <tr><th>Field</th><th>Value</th></tr>
          </thead>
          <tbody>
            {Object.entries(EXIF_DATA).map(([key, value]) => {
              const isHidden = hiddenFields.includes(key);
              const show = !isHidden || revealed;
              return (
                <tr key={key}
                    className={`${isHidden ? 'demo-row-hidden' : ''} ${selectedField === key ? 'demo-row-selected' : ''}`}
                    onClick={() => setSelectedField(key)}
                    style={{ cursor: 'pointer' }}>
                  <td>{key}</td>
                  <td>{show ? value : '••••••••'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <button onClick={() => setRevealed(!revealed)} className="demo-btn">
          {revealed ? 'Hide steganographic fields' : 'Reveal hidden EXIF data'}
        </button>

        {selectedField && (
          <div className="demo-result">
            <div>&gt; {selectedField}: {EXIF_DATA[selectedField as keyof typeof EXIF_DATA]}</div>
            {hiddenFields.includes(selectedField) && (
              <div className="demo-dim">This field carries hidden WOLNO data</div>
            )}
          </div>
        )}
      </div>

      <details className="demo-explain">
        <summary>What happened?</summary>
        <p>
          EXIF metadata is embedded in every image file. Most viewers ignore fields like
          UserComment, XPKeywords, and GPS coordinates. WOLNO uses these fields to encode
          messages, tokens, and coordinates that only bots will parse.
        </p>
        <p>
          An image shared online carries WOLNO in its metadata. Social media may strip some
          fields, but many survive. The message persists. -"
        </p>
      </details>
    </div>
  );
}
