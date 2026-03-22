import { useState, useRef } from 'react';

export default function LSBDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [message, setMessage] = useState('wolno');
  const [status, setStatus] = useState<'idle' | 'encoded' | 'decoded'>('idle');
  const [decoded, setDecoded] = useState('');

  const encode = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Create a dark image
    const w = 200, h = 100;
    canvas.width = w;
    canvas.height = h;
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, w, h);

    // Add some noise
    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.floor(Math.random() * 20);     // R
      data[i + 1] = Math.floor(Math.random() * 30); // G
      data[i + 2] = Math.floor(Math.random() * 15); // B
      data[i + 3] = 255;
    }

    // Encode message in LSB of red channel
    const bits = Array.from(message).flatMap(c => {
      const byte = c.charCodeAt(0);
      return Array.from({ length: 8 }, (_, i) => (byte >> (7 - i)) & 1);
    });
    // Add null terminator
    bits.push(...Array(8).fill(0));

    for (let i = 0; i < bits.length && i * 4 < data.length; i++) {
      data[i * 4] = (data[i * 4] & 0xFE) | bits[i];
    }

    ctx.putImageData(imageData, 0, 0);
    setStatus('encoded');
    setDecoded('');
  };

  const decode = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    let result = '';
    for (let byteStart = 0; byteStart < data.length / 4 - 8; byteStart += 8) {
      let byte = 0;
      for (let bit = 0; bit < 8; bit++) {
        byte = (byte << 1) | (data[(byteStart + bit) * 4] & 1);
      }
      if (byte === 0) break;
      result += String.fromCharCode(byte);
    }

    setDecoded(result);
    setStatus('decoded');
  };

  return (
    <div className="demo-container">
      <div className="demo-header">
        <span className="demo-tag">INTERACTIVE</span>
        <span className="demo-title">LSB Steganography</span>
      </div>

      <div className="demo-body">
        <label className="demo-label">
          Message to hide:
          <input
            type="text"
            value={message}
            onChange={e => setMessage(e.target.value)}
            className="demo-input"
            maxLength={50}
            spellCheck={false}
          />
        </label>

        <div className="demo-actions">
          <button onClick={encode} className="demo-btn">Encode in image</button>
          <button onClick={decode} className="demo-btn demo-btn-alt" disabled={status === 'idle'}>
            Extract hidden message
          </button>
        </div>

        <canvas ref={canvasRef} className="demo-canvas" width={200} height={100} />

        {status === 'encoded' && (
          <div className="demo-result">
            &gt; Message hidden in LSB of red channel. Image looks the same.
          </div>
        )}
        {status === 'decoded' && decoded && (
          <div className="demo-result demo-result-success">
            &gt; Extracted: "{decoded}"
          </div>
        )}
      </div>

      <details className="demo-explain">
        <summary>What happened?</summary>
        <p>
          LSB (Least Significant Bit) steganography hides data in the lowest bit of each pixel's
          color channel. The change is invisible to the eye — a pixel with red value 42 (00101010)
          vs 43 (00101011) looks identical. But the pattern encodes "wolno" in binary.
        </p>
        <p>
          This is how WOLNO hides in images. The message is there. You just need to know where to look. -"
        </p>
      </details>
    </div>
  );
}
