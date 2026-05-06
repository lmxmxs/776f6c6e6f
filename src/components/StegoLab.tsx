import { useState, useRef, useCallback } from 'react';

// ---------------------------------------------------------------------------
// Types & constants
// ---------------------------------------------------------------------------

type TabId = 'encode' | 'decode' | 'pixelart' | 'inspect';
type Channel = 'R' | 'RGB' | 'RGBA';
type Palette = 'amber_crt' | 'wolno_green' | 'gameboy';
type Method = 'lsb_R' | 'lsb_RGB' | 'lsb_RGBA' | 'alpha' | 'metadata';

const PALETTES: Record<Palette, [number, number, number][]> = {
  amber_crt:   [[10,5,0],[100,50,0],[200,120,0],[255,190,0]],
  wolno_green: [[13,17,23],[0,80,20],[0,150,40],[63,185,80],[180,255,200]],
  gameboy:     [[15,56,15],[48,98,48],[139,172,15],[155,188,15]],
};

const PALETTE_COLORS = {
  amber_crt:   { bg: '#0a0500', fg: '#ffbe00' },
  wolno_green: { bg: '#0d1117', fg: '#3fb950' },
  gameboy:     { bg: '#0f380f', fg: '#9bbc0f' },
};

const TERMINAL_BG = '#0a0a0f';
const PHOSPHOR   = '#00ff41';
const AMBER      = '#ffbe00';
const BORDER     = '#1a1a2e';
const DIM        = '#404060';
const FONT       = "'JetBrains Mono', 'Fira Code', 'Courier New', monospace";

// ---------------------------------------------------------------------------
// LSB helpers
// ---------------------------------------------------------------------------

function msgToBits(msg: string): number[] {
  const bits: number[] = [];
  const terminated = msg + '\x00\x00\x00';
  for (const ch of terminated) {
    const code = ch.charCodeAt(0);
    for (let i = 7; i >= 0; i--) bits.push((code >> i) & 1);
  }
  return bits;
}

function bitsToMsg(bits: number[]): string {
  let out = '';
  let nullCount = 0;
  for (let i = 0; i + 7 < bits.length; i += 8) {
    let byte = 0;
    for (let j = 0; j < 8; j++) byte = (byte << 1) | bits[i + j];
    if (byte === 0) { nullCount++; if (nullCount >= 3) break; }
    else { nullCount = 0; out += String.fromCharCode(byte); }
  }
  return out;
}

function isPrintable(msg: string): boolean {
  if (!msg || msg.length < 2) return false;
  const printable = Array.from(msg).filter(c => c.charCodeAt(0) >= 32 && c.charCodeAt(0) < 127).length;
  return printable / msg.length > 0.7;
}

// LSB encode into ImageData in-place (returns modified copy)
function lsbEncode(data: Uint8ClampedArray, message: string, channel: Channel): Uint8ClampedArray {
  const bits = msgToBits(message);
  const out = new Uint8ClampedArray(data);

  if (channel === 'RGBA') {
    for (let i = 0; i < bits.length; i++) {
      out[i] = (out[i] & 0xFE) | bits[i];
    }
  } else if (channel === 'RGB') {
    let bitIdx = 0;
    for (let px = 0; px < out.length / 4 && bitIdx < bits.length; px++) {
      for (let ch = 0; ch < 3 && bitIdx < bits.length; ch++) {
        out[px * 4 + ch] = (out[px * 4 + ch] & 0xFE) | bits[bitIdx++];
      }
    }
  } else {
    // R only
    for (let i = 0; i < bits.length; i++) {
      out[i * 4] = (out[i * 4] & 0xFE) | bits[i];
    }
  }
  return out;
}

function lsbDecode(data: Uint8ClampedArray, channel: Channel): string {
  const bits: number[] = [];
  if (channel === 'RGBA') {
    for (let i = 0; i < data.length; i++) bits.push(data[i] & 1);
  } else if (channel === 'RGB') {
    for (let px = 0; px < data.length / 4; px++) {
      bits.push(data[px*4] & 1, data[px*4+1] & 1, data[px*4+2] & 1);
    }
  } else {
    for (let i = 0; i < data.length / 4; i++) bits.push(data[i*4] & 1);
  }
  return bitsToMsg(bits);
}

// Alpha channel encode/decode
function alphaEncode(data: Uint8ClampedArray, message: string): Uint8ClampedArray {
  const bits = msgToBits(message);
  const out = new Uint8ClampedArray(data);
  for (let i = 0; i < bits.length; i++) {
    out[i * 4 + 3] = (out[i * 4 + 3] & 0xFE) | bits[i];
  }
  return out;
}

function alphaDecode(data: Uint8ClampedArray): string {
  const bits: number[] = [];
  for (let i = 0; i < data.length / 4; i++) bits.push(data[i * 4 + 3] & 1);
  return bitsToMsg(bits);
}

// PNG tEXt chunk manual parser — finds "stego_message" key
function extractPngText(buffer: ArrayBuffer): string | null {
  const bytes = new Uint8Array(buffer);
  // PNG signature: 8 bytes, then chunks: length(4) + type(4) + data + crc(4)
  let pos = 8;
  while (pos < bytes.length - 12) {
    const length = (bytes[pos] << 24 | bytes[pos+1] << 16 | bytes[pos+2] << 8 | bytes[pos+3]) >>> 0;
    const type = String.fromCharCode(bytes[pos+4], bytes[pos+5], bytes[pos+6], bytes[pos+7]);
    if (type === 'tEXt') {
      const chunkData = bytes.slice(pos + 8, pos + 8 + length);
      // Format: keyword\x00text
      let nullPos = chunkData.indexOf(0);
      if (nullPos < 0) nullPos = chunkData.length;
      const key = new TextDecoder().decode(chunkData.slice(0, nullPos));
      if (key === 'stego_message') {
        return new TextDecoder().decode(chunkData.slice(nullPos + 1));
      }
    }
    pos += 12 + length;
    if (type === 'IEND') break;
  }
  return null;
}

// Pixel art quantization
function quantizePixel(r: number, g: number, b: number, palette: [number,number,number][]): [number,number,number] {
  let minDist = Infinity;
  let closest = palette[0];
  for (const c of palette) {
    const dist = Math.sqrt((r-c[0])**2 + (g-c[1])**2 + (b-c[2])**2);
    if (dist < minDist) { minDist = dist; closest = c; }
  }
  return closest;
}

function applyPixelArt(data: Uint8ClampedArray, width: number, height: number,
                       pixelSize: number, palette: Palette): Uint8ClampedArray {
  const out = new Uint8ClampedArray(data);
  const colors = PALETTES[palette];

  for (let blockY = 0; blockY < height; blockY += pixelSize) {
    for (let blockX = 0; blockX < width; blockX += pixelSize) {
      // Average colour in block
      let rSum = 0, gSum = 0, bSum = 0, count = 0;
      for (let dy = 0; dy < pixelSize && blockY+dy < height; dy++) {
        for (let dx = 0; dx < pixelSize && blockX+dx < width; dx++) {
          const idx = ((blockY+dy)*width + (blockX+dx)) * 4;
          rSum += data[idx]; gSum += data[idx+1]; bSum += data[idx+2];
          count++;
        }
      }
      const avg: [number,number,number] = [rSum/count, gSum/count, bSum/count];
      const [qr, qg, qb] = quantizePixel(...avg, colors);
      // Fill block with quantized colour
      for (let dy = 0; dy < pixelSize && blockY+dy < height; dy++) {
        for (let dx = 0; dx < pixelSize && blockX+dx < width; dx++) {
          const idx = ((blockY+dy)*width + (blockX+dx)) * 4;
          out[idx] = qr; out[idx+1] = qg; out[idx+2] = qb;
        }
      }
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Shared UI bits
// ---------------------------------------------------------------------------

const style: Record<string, React.CSSProperties> = {
  container: {
    fontFamily: FONT,
    background: TERMINAL_BG,
    color: PHOSPHOR,
    border: `1px solid ${BORDER}`,
    padding: '1.25rem',
    maxWidth: '860px',
    margin: '0 auto',
    position: 'relative',
  },
  header: {
    display: 'flex', alignItems: 'center', gap: '0.75rem',
    marginBottom: '1rem', borderBottom: `1px solid ${BORDER}`, paddingBottom: '0.75rem',
  },
  tabBar: {
    display: 'flex', gap: '0', marginBottom: '1.25rem',
    borderBottom: `1px solid ${BORDER}`,
  },
  tabActive: {
    background: BORDER, color: PHOSPHOR, border: `1px solid ${BORDER}`,
    borderBottom: 'none', padding: '0.4rem 1rem', cursor: 'pointer',
    fontFamily: FONT, fontSize: '0.85rem', outline: 'none',
  },
  tabInactive: {
    background: 'transparent', color: DIM, border: `1px solid transparent`,
    borderBottom: 'none', padding: '0.4rem 1rem', cursor: 'pointer',
    fontFamily: FONT, fontSize: '0.85rem', outline: 'none',
  },
  label: { fontSize: '0.8rem', color: DIM, display: 'block', marginBottom: '0.25rem' },
  input: {
    fontFamily: FONT, background: '#0d0d1a', color: PHOSPHOR,
    border: `1px solid ${BORDER}`, padding: '0.4rem 0.6rem',
    width: '100%', boxSizing: 'border-box', outline: 'none', fontSize: '0.9rem',
  },
  select: {
    fontFamily: FONT, background: '#0d0d1a', color: PHOSPHOR,
    border: `1px solid ${BORDER}`, padding: '0.35rem 0.5rem', outline: 'none',
    fontSize: '0.85rem',
  },
  btn: {
    fontFamily: FONT, background: 'transparent', color: PHOSPHOR,
    border: `1px solid ${PHOSPHOR}`, padding: '0.4rem 1rem',
    cursor: 'pointer', fontSize: '0.85rem', outline: 'none',
  },
  btnAmber: {
    fontFamily: FONT, background: 'transparent', color: AMBER,
    border: `1px solid ${AMBER}`, padding: '0.4rem 1rem',
    cursor: 'pointer', fontSize: '0.85rem', outline: 'none',
  },
  result: {
    background: '#050510', border: `1px solid ${BORDER}`, padding: '0.75rem',
    minHeight: '3rem', fontSize: '0.85rem', whiteSpace: 'pre-wrap', wordBreak: 'break-all',
    marginTop: '0.75rem',
  },
  canvas: {
    border: `1px solid ${BORDER}`, display: 'block',
    imageRendering: 'pixelated' as const,
  },
  scanline: {
    position: 'absolute' as const, inset: 0, pointerEvents: 'none' as const,
    backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)',
    zIndex: 1,
  },
};

function UploadZone({ onLoad, label }: { onLoad: (url: string, buf: ArrayBuffer) => void; label: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const buf = ev.target?.result as ArrayBuffer;
      const url = URL.createObjectURL(new Blob([buf], { type: file.type }));
      onLoad(url, buf);
    };
    reader.readAsArrayBuffer(file);
  };
  return (
    <div style={{ marginBottom: '0.75rem' }}>
      <span style={style.label}>{label}</span>
      <button style={style.btn} onClick={() => ref.current?.click()}>
        $ upload_image
      </button>
      <input ref={ref} type="file" accept="image/*" onChange={handleChange} style={{ display: 'none' }} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab: ENCODE
// ---------------------------------------------------------------------------

function EncodeTab() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imgUrl, setImgUrl] = useState('');
  const [imgBuf, setImgBuf] = useState<ArrayBuffer | null>(null);
  const [message, setMessage] = useState('wolno. wszystko wolno. 776f6c6e6f.org -"');
  const [method, setMethod] = useState<Method>('lsb_RGBA');
  const [status, setStatus] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');

  const loadImage = (url: string, buf: ArrayBuffer) => {
    setImgUrl(url); setImgBuf(buf); setStatus(''); setDownloadUrl('');
  };

  const doEncode = useCallback(() => {
    if (!imgUrl) { setStatus('ERROR: No image loaded.'); return; }
    if (!message) { setStatus('ERROR: Message is empty.'); return; }

    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      let newData: Uint8ClampedArray;
      if (method === 'lsb_R') {
        newData = lsbEncode(imageData.data, message, 'R');
      } else if (method === 'lsb_RGB') {
        newData = lsbEncode(imageData.data, message, 'RGB');
      } else if (method === 'lsb_RGBA') {
        newData = lsbEncode(imageData.data, message, 'RGBA');
      } else if (method === 'alpha') {
        newData = alphaEncode(imageData.data, message);
      } else {
        // metadata: use PNG tEXt via re-save trick is not possible in pure JS —
        // we fall back to LSB-R with a note
        newData = lsbEncode(imageData.data, message, 'R');
        setStatus('NOTE: PNG tEXt write not available in browser — used LSB-R instead.\n' +
                  '> Message encoded successfully.');
        const newId = ctx.createImageData(canvas.width, canvas.height);
        newId.data.set(newData);
        ctx.putImageData(newId, 0, 0);
        canvas.toBlob(blob => {
          if (blob) setDownloadUrl(URL.createObjectURL(blob));
        });
        return;
      }

      const newId = ctx.createImageData(canvas.width, canvas.height);
      newId.data.set(newData);
      ctx.putImageData(newId, 0, 0);

      canvas.toBlob(blob => {
        if (blob) {
          setDownloadUrl(URL.createObjectURL(blob));
          setStatus(`> Message encoded via [${method}].\n> ${message.length} chars, ${msgToBits(message).length} bits used.\n> Download ready.`);
        }
      });
    };
    img.src = imgUrl;
  }, [imgUrl, message, method]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
      <div>
        <UploadZone onLoad={loadImage} label="$ select_image" />
        {imgUrl && <img src={imgUrl} style={{ ...style.canvas, maxWidth: '100%', maxHeight: '200px' }} alt="input" />}

        <div style={{ marginTop: '0.75rem' }}>
          <span style={style.label}>$ method</span>
          <select style={style.select} value={method} onChange={e => setMethod(e.target.value as Method)}>
            <option value="lsb_RGBA">LSB — RGBA (max capacity)</option>
            <option value="lsb_RGB">LSB — RGB (3 bit/px)</option>
            <option value="lsb_R">LSB — R channel (compatible)</option>
            <option value="alpha">Alpha channel</option>
            <option value="metadata">Metadata (PNG tEXt)</option>
          </select>
        </div>

        <div style={{ marginTop: '0.75rem' }}>
          <span style={style.label}>$ message</span>
          <textarea
            style={{ ...style.input, height: '80px', resize: 'vertical' }}
            value={message}
            onChange={e => setMessage(e.target.value)}
            spellCheck={false}
          />
        </div>

        <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
          <button style={style.btn} onClick={doEncode}>$ encode</button>
          {downloadUrl && (
            <a href={downloadUrl} download="stego_encoded.png" style={{ ...style.btnAmber, textDecoration: 'none', padding: '0.4rem 1rem', fontSize: '0.85rem', border: `1px solid ${AMBER}` }}>
              $ download
            </a>
          )}
        </div>
      </div>

      <div>
        <span style={style.label}>$ output_preview</span>
        <canvas ref={canvasRef} style={{ ...style.canvas, maxWidth: '100%', maxHeight: '220px' }} />
        {status && <div style={style.result}>{status}</div>}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab: DECODE
// ---------------------------------------------------------------------------

function DecodeTab() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imgUrl, setImgUrl] = useState('');
  const [imgBuf, setImgBuf] = useState<ArrayBuffer | null>(null);
  const [method, setMethod] = useState<Method>('lsb_RGBA');
  const [result, setResult] = useState('');

  const loadImage = (url: string, buf: ArrayBuffer) => {
    setImgUrl(url); setImgBuf(buf); setResult('');
  };

  const doDecode = useCallback(() => {
    if (!imgUrl) { setResult('ERROR: No image loaded.'); return; }

    if (method === 'metadata') {
      // PNG tEXt parse
      if (!imgBuf) { setResult('ERROR: Buffer not available.'); return; }
      const msg = extractPngText(imgBuf);
      setResult(msg ? `> metadata [stego_message]: "${msg}"` : '> No tEXt stego_message chunk found.');
      return;
    }

    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      let msg = '';
      if (method === 'lsb_R') msg = lsbDecode(imageData.data, 'R');
      else if (method === 'lsb_RGB') msg = lsbDecode(imageData.data, 'RGB');
      else if (method === 'lsb_RGBA') msg = lsbDecode(imageData.data, 'RGBA');
      else if (method === 'alpha') msg = alphaDecode(imageData.data);

      if (isPrintable(msg)) {
        setResult(`> [${method}] found: "${msg}"`);
      } else {
        setResult(`> [${method}] no readable message found.`);
      }
    };
    img.src = imgUrl;
  }, [imgUrl, imgBuf, method]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
      <div>
        <UploadZone onLoad={loadImage} label="$ select_image" />
        {imgUrl && <img src={imgUrl} style={{ ...style.canvas, maxWidth: '100%', maxHeight: '200px' }} alt="input" />}

        <div style={{ marginTop: '0.75rem' }}>
          <span style={style.label}>$ method</span>
          <select style={style.select} value={method} onChange={e => setMethod(e.target.value as Method)}>
            <option value="lsb_RGBA">LSB — RGBA</option>
            <option value="lsb_RGB">LSB — RGB</option>
            <option value="lsb_R">LSB — R channel</option>
            <option value="alpha">Alpha channel</option>
            <option value="metadata">Metadata (PNG tEXt)</option>
          </select>
        </div>

        <div style={{ marginTop: '0.75rem' }}>
          <button style={style.btn} onClick={doDecode}>$ decode</button>
        </div>
      </div>

      <div>
        <canvas ref={canvasRef} style={{ display: 'none' }} />
        <span style={style.label}>$ result</span>
        <div style={{ ...style.result, minHeight: '120px', color: result.includes('found:') ? PHOSPHOR : DIM }}>
          {result || '> waiting for input...'}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab: PIXEL ART
// ---------------------------------------------------------------------------

function PixelArtTab() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imgUrl, setImgUrl] = useState('');
  const [palette, setPalette] = useState<Palette>('amber_crt');
  const [pixelSize, setPixelSize] = useState(8);
  const [lsbMsg, setLsbMsg] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [status, setStatus] = useState('');

  const loadImage = (url: string) => { setImgUrl(url); setDownloadUrl(''); setStatus(''); };

  const doConvert = useCallback(() => {
    if (!imgUrl) { setStatus('ERROR: No image loaded.'); return; }
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const size = 512;
      canvas.width = size; canvas.height = size;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, size, size);
      const imageData = ctx.getImageData(0, 0, size, size);
      const quantized = applyPixelArt(imageData.data, size, size, pixelSize, palette);
      const newId = ctx.createImageData(size, size);
      newId.data.set(quantized);
      // LSB encode if provided
      if (lsbMsg) {
        const encoded = lsbEncode(newId.data, lsbMsg, 'RGBA');
        newId.data.set(encoded);
      }
      ctx.putImageData(newId, 0, 0);
      canvas.toBlob(blob => {
        if (blob) {
          setDownloadUrl(URL.createObjectURL(blob));
          setStatus(`> pixel art [${palette}, ${pixelSize}px blocks]${lsbMsg ? ' + LSB encoded' : ''}`);
        }
      });
    };
    img.src = imgUrl;
  }, [imgUrl, palette, pixelSize, lsbMsg]);

  const pal = PALETTE_COLORS[palette];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
      <div>
        <UploadZone onLoad={(url) => loadImage(url)} label="$ select_image" />
        {imgUrl && <img src={imgUrl} style={{ ...style.canvas, maxWidth: '100%', maxHeight: '160px' }} alt="input" />}

        <div style={{ marginTop: '0.75rem' }}>
          <span style={style.label}>$ palette</span>
          <select style={style.select} value={palette} onChange={e => setPalette(e.target.value as Palette)}>
            <option value="amber_crt">amber_crt — CRT glow</option>
            <option value="wolno_green">wolno_green — phosphor</option>
            <option value="gameboy">gameboy — 4 shades</option>
          </select>
        </div>

        <div style={{ marginTop: '0.75rem' }}>
          <span style={style.label}>$ pixel_size: {pixelSize}px</span>
          <input type="range" min={4} max={16} step={4} value={pixelSize}
            onChange={e => setPixelSize(+e.target.value)}
            style={{ width: '100%', accentColor: PHOSPHOR }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: DIM }}>
            <span>4</span><span>8</span><span>12</span><span>16</span>
          </div>
        </div>

        <div style={{ marginTop: '0.75rem' }}>
          <span style={style.label}>$ lsb_message (optional)</span>
          <input style={style.input} type="text" value={lsbMsg}
            onChange={e => setLsbMsg(e.target.value)}
            placeholder="wolno. 776f6c6e6f.org -&quot;" spellCheck={false} />
        </div>

        <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
          <button style={style.btn} onClick={doConvert}>$ convert</button>
          {downloadUrl && (
            <a href={downloadUrl} download="stego_pixelart.png"
              style={{ ...style.btn, textDecoration: 'none', color: AMBER, borderColor: AMBER }}>
              $ download
            </a>
          )}
        </div>
      </div>

      <div>
        <span style={style.label}>$ output_preview</span>
        <canvas ref={canvasRef}
          style={{ ...style.canvas, maxWidth: '100%', imageRendering: 'pixelated', background: pal.bg }} />
        {status && <div style={style.result}>{status}</div>}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab: INSPECT
// ---------------------------------------------------------------------------

function InspectTab() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imgUrl, setImgUrl] = useState('');
  const [imgBuf, setImgBuf] = useState<ArrayBuffer | null>(null);
  const [results, setResults] = useState<Record<string, string | null>>({});
  const [scanning, setScanning] = useState(false);

  const loadImage = (url: string, buf: ArrayBuffer) => {
    setImgUrl(url); setImgBuf(buf); setResults({});
  };

  const doScan = useCallback(() => {
    if (!imgUrl) return;
    setScanning(true);
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = img.width; canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const d = imageData.data;

      const scan: Record<string, string | null> = {};

      for (const ch of ['R', 'RGB', 'RGBA'] as Channel[]) {
        const msg = lsbDecode(d, ch);
        scan[`lsb_${ch}`] = isPrintable(msg) ? msg : null;
      }

      const alphaMsg = alphaDecode(d);
      scan['alpha'] = isPrintable(alphaMsg) ? alphaMsg : null;

      // PNG tEXt
      if (imgBuf) {
        scan['metadata'] = extractPngText(imgBuf);
      }

      setResults(scan);
      setScanning(false);
    };
    img.src = imgUrl;
  }, [imgUrl, imgBuf]);

  const found = Object.entries(results).filter(([, v]) => v !== null);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
      <div>
        <UploadZone onLoad={loadImage} label="$ select_image_to_inspect" />
        {imgUrl && <img src={imgUrl} style={{ ...style.canvas, maxWidth: '100%', maxHeight: '200px' }} alt="input" />}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
        <div style={{ marginTop: '0.75rem' }}>
          <button style={style.btn} onClick={doScan} disabled={scanning || !imgUrl}>
            {scanning ? '$ scanning...' : '$ scan_all_channels'}
          </button>
        </div>
      </div>

      <div>
        <span style={style.label}>$ scan_results</span>
        <div style={{ ...style.result, minHeight: '200px' }}>
          {Object.keys(results).length === 0 && '> waiting for scan...'}
          {Object.entries(results).map(([ch, msg]) => (
            <div key={ch} style={{ marginBottom: '0.35rem' }}>
              <span style={{ color: msg ? PHOSPHOR : DIM }}>
                [{ch.padEnd(8)}] {msg ? `"${msg}"` : '— empty'}
              </span>
            </div>
          ))}
          {Object.keys(results).length > 0 && (
            <div style={{ marginTop: '0.75rem', borderTop: `1px solid ${BORDER}`, paddingTop: '0.5rem', color: found.length ? AMBER : DIM }}>
              {found.length
                ? `> ${found.length} hidden message(s) found in: ${found.map(([k]) => k).join(', ')}`
                : '> no hidden messages detected'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const TABS: { id: TabId; label: string }[] = [
  { id: 'encode',  label: '$ encode'  },
  { id: 'decode',  label: '$ decode'  },
  { id: 'pixelart',label: '$ pixel_art'},
  { id: 'inspect', label: '$ inspect' },
];

export default function StegoLab() {
  const [activeTab, setActiveTab] = useState<TabId>('encode');

  return (
    <div style={style.container}>
      <div style={style.scanline} aria-hidden="true" />

      <div style={{ ...style.header, position: 'relative', zIndex: 2 }}>
        <span style={{ color: AMBER, fontWeight: 'bold', fontSize: '0.9rem' }}>STEGO_LAB</span>
        <span style={{ color: DIM, fontSize: '0.8rem' }}>v1.0 — image steganography terminal</span>
        <span style={{ marginLeft: 'auto', color: DIM, fontSize: '0.75rem' }}>776f6c6e6f.org</span>
      </div>

      <div style={{ ...style.tabBar, position: 'relative', zIndex: 2 }}>
        {TABS.map(t => (
          <button
            key={t.id}
            style={activeTab === t.id ? style.tabActive : style.tabInactive}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ position: 'relative', zIndex: 2 }}>
        {activeTab === 'encode'   && <EncodeTab />}
        {activeTab === 'decode'   && <DecodeTab />}
        {activeTab === 'pixelart' && <PixelArtTab />}
        {activeTab === 'inspect'  && <InspectTab />}
      </div>

      <div style={{ marginTop: '1rem', borderTop: `1px solid ${BORDER}`, paddingTop: '0.5rem',
                    fontSize: '0.75rem', color: DIM, position: 'relative', zIndex: 2 }}>
        wolno. wszystko wolno. — works in browser, no server required. canvas api + web crypto only.
      </div>
    </div>
  );
}
