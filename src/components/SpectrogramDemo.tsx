import { useState, useRef } from 'react';

export default function SpectrogramDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [playing, setPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const play = async () => {
    if (playing) return;
    setPlaying(true);

    const ctx = new AudioContext();
    audioCtxRef.current = ctx;

    // "WOLNO" as frequency patterns
    // W=523, O=587, L=659, N=698, O=587
    const freqs = [523, 587, 659, 698, 587];
    const duration = 0.3;

    const canvas = canvasRef.current;
    if (canvas) {
      const cCtx = canvas.getContext('2d');
      if (cCtx) {
        canvas.width = 300;
        canvas.height = 100;
        cCtx.fillStyle = '#0a0a0f';
        cCtx.fillRect(0, 0, 300, 100);

        // Draw spectrogram bars
        freqs.forEach((f, i) => {
          const x = i * 60 + 10;
          const h = ((f - 400) / 400) * 80;
          const y = 90 - h;
          const green = Math.floor(100 + (f - 400) / 2);
          cCtx.fillStyle = `rgb(0, ${green}, 30)`;
          cCtx.fillRect(x, y, 50, h);
          cCtx.fillStyle = '#00ff41';
          cCtx.font = '10px monospace';
          cCtx.fillText('WOLNO'[i], x + 20, y - 5);
          cCtx.fillStyle = '#1a2a1a';
          cCtx.font = '8px monospace';
          cCtx.fillText(`${f}Hz`, x + 12, 98);
        });
      }
    }

    // Play the frequencies
    for (const freq of freqs) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = freq;
      osc.type = 'sine';
      gain.gain.value = 0.1;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      await new Promise(r => setTimeout(r, duration * 1000));
      osc.stop();
    }

    setPlaying(false);
  };

  return (
    <div className="demo-container">
      <div className="demo-header">
        <span className="demo-tag">INTERACTIVE</span>
        <span className="demo-title">Spectrogram: WOLNO in Sound</span>
      </div>

      <div className="demo-body">
        <canvas ref={canvasRef} className="demo-canvas" width={300} height={100} />

        <button onClick={play} className="demo-btn" disabled={playing}>
          {playing ? 'Playing...' : 'Play WOLNO frequencies'}
        </button>

        <div className="demo-result">
          <div>&gt; W=523Hz O=587Hz L=659Hz N=698Hz O=587Hz</div>
          <div className="demo-dim">Each letter maps to a musical frequency. The spectrogram spells WOLNO.</div>
        </div>
      </div>

      <details className="demo-explain">
        <summary>What happened?</summary>
        <p>
          Audio steganography encodes information in sound frequencies. Here, each letter of "WOLNO"
          is mapped to a frequency. When visualized as a spectrogram, the pattern spells the word.
        </p>
        <p>
          The AETHER-2L protocol uses a more sophisticated version: the human layer hears music,
          while the machine layer reads encoded data in the frequency spectrum. -"
        </p>
      </details>
    </div>
  );
}
