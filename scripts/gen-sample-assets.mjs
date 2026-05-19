/**
 * Generates self-hosted demo assets into public/samples/:
 *   - 8 placeholder SVG images (6 exhibits + 2 museum logos)
 *   - 2 short WAV audio clips (ja / en guide samples)
 *
 * These are committed to the repo so the demo never depends on external
 * hosts (picsum.photos / soundhelix.com block hotlinking with HTTP 403).
 *
 *   node scripts/gen-sample-assets.mjs
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const dir = join(process.cwd(), 'public', 'samples');
mkdirSync(dir, { recursive: true });

// ---------------------------------------------------------------- WAV audio
function makeWav(name, { freqs, seconds = 6, sampleRate = 16000 }) {
  const n = Math.floor(seconds * sampleRate);
  const data = Buffer.alloc(n * 2);
  for (let i = 0; i < n; i += 1) {
    const t = i / sampleRate;
    const fade = Math.min(1, t / 0.8, (seconds - t) / 0.8); // fade in / out
    const tremolo = 0.85 + 0.15 * Math.sin(2 * Math.PI * 0.5 * t); // gentle pulse
    let s = 0;
    for (const f of freqs) s += Math.sin(2 * Math.PI * f * t);
    s = (s / freqs.length) * fade * tremolo * 0.5;
    const clamped = Math.max(-1, Math.min(1, s));
    data.writeInt16LE((clamped * 32767) | 0, i * 2);
  }
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + data.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(1, 22); // mono
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(data.length, 40);
  writeFileSync(join(dir, name), Buffer.concat([header, data]));
}

makeWav('guide-ja.wav', { freqs: [220, 277.18, 329.63] }); // A major-ish chord
makeWav('guide-en.wav', { freqs: [261.63, 329.63, 392.0] }); // C major-ish chord

// ---------------------------------------------------------------- SVG images
function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * SVGs are generated at a 1:1 aspect so they survive `object-cover` cropping
 * in square tiles. Text is wrapped automatically by inserting line breaks at
 * a max-char threshold and is centered horizontally so it stays visible
 * regardless of the container shape.
 */
function wrap(text, max) {
  const out = [];
  let line = '';
  for (const ch of text) {
    if ((line + ch).length > max && line.length > 0) {
      out.push(line);
      line = '';
    }
    line += ch;
  }
  if (line) out.push(line);
  return out;
}

function makeSvg(name, { title, subtitle, from, to, accent }) {
  const titleLines = wrap(title, 9);
  const subtitleLines = wrap(subtitle, 22);
  const titleSize = titleLines.length > 1 ? 68 : 84;
  const subtitleSize = 28;
  const titleLineHeight = titleSize * 1.15;
  const blockHeight =
    titleLines.length * titleLineHeight +
    (subtitle ? 24 + subtitleLines.length * (subtitleSize * 1.25) : 0);
  const startY = 400 - blockHeight / 2 + titleSize * 0.85;

  const titleEls = titleLines
    .map(
      (line, i) =>
        `<text x="400" y="${startY + i * titleLineHeight}" font-family="sans-serif" font-size="${titleSize}" font-weight="700" fill="#ffffff" text-anchor="middle">${esc(line)}</text>`,
    )
    .join('\n  ');
  const subtitleEls = subtitleLines
    .map((line, i) => {
      const y =
        startY +
        titleLines.length * titleLineHeight +
        20 +
        (i + 1) * subtitleSize * 1.25;
      return `<text x="400" y="${y}" font-family="sans-serif" font-size="${subtitleSize}" fill="#ffffff" opacity="0.9" text-anchor="middle">${esc(line)}</text>`;
    })
    .join('\n  ');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${from}"/>
      <stop offset="1" stop-color="${to}"/>
    </linearGradient>
  </defs>
  <rect width="800" height="800" fill="url(#g)"/>
  <circle cx="660" cy="180" r="190" fill="${accent}" opacity="0.26"/>
  <circle cx="140" cy="660" r="160" fill="${accent}" opacity="0.18"/>
  ${titleEls}
  ${subtitleEls}
</svg>
`;
  writeFileSync(join(dir, name), svg);
}

const warm = { from: '#8a6c3c', to: '#3a2f22', accent: '#e9dfcd' };
const blue = { from: '#1f4e6b', to: '#0c2230', accent: '#bfe3ef' };

makeSvg('art-1.svg', { title: '朝の港', subtitle: 'Harbor at Dawn', ...warm });
makeSvg('art-2.svg', { title: '赤い椅子のある室内', subtitle: 'Interior with a Red Chair', ...warm });
makeSvg('art-3.svg', { title: '山の記憶', subtitle: 'Memory of the Mountain', ...warm });
makeSvg('aqua-1.svg', { title: 'クラゲの遊泳', subtitle: 'Drifting Jellyfish', ...blue });
makeSvg('aqua-2.svg', { title: '深海の生きものたち', subtitle: 'Creatures of the Deep Sea', ...blue });
makeSvg('aqua-3.svg', { title: 'サンゴ礁の世界', subtitle: 'The Coral Reef', ...blue });
makeSvg('logo-art.svg', { title: '湊町近代美術館', subtitle: 'MINATO MACHI ART', ...warm });
makeSvg('logo-aqua.svg', { title: 'うみのいろ水族館', subtitle: 'UMINOIRO AQUARIUM', ...blue });

console.log('Generated demo assets in public/samples/');
