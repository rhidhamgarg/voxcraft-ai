/**
 * In-memory high-fidelity PCM WAV synthesizer.
 * Generates harmonic vocal-simulating waveforms with dynamic frequency,
 * envelope shaping (ADSR), and cadence based on voice pitch and settings.
 */

export function generateSynthesizedWavBuffer(
  text: string,
  voiceGender: 'male' | 'female' | 'non-binary',
  speed: number = 1.0,
  stability: number = 0.5
): Buffer {
  // Approximate duration: ~150-180 words per minute
  const words = text.trim().split(/\s+/).length;
  const baseSeconds = Math.max(1.8, (words / 2.5) / speed);
  const sampleRate = 24000;
  const totalSamples = Math.floor(sampleRate * baseSeconds);
  const numChannels = 1;
  const bytesPerSample = 2; // 16-bit PCM

  // Data buffer size
  const dataSize = totalSamples * numChannels * bytesPerSample;
  const buffer = Buffer.alloc(44 + dataSize);

  // --- RIFF Header ---
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);

  // --- fmt subchunk ---
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  buffer.writeUInt16LE(1, 20); // AudioFormat (1 = PCM)
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * numChannels * bytesPerSample, 28); // ByteRate
  buffer.writeUInt16LE(numChannels * bytesPerSample, 32); // BlockAlign
  buffer.writeUInt16LE(16, 34); // BitsPerSample

  // --- data subchunk ---
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  // Base fundamental frequency (F0)
  const f0 = voiceGender === 'male' ? 120 : voiceGender === 'female' ? 220 : 165;
  const jitterAmount = (1 - stability) * 0.08;

  let offset = 44;
  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;

    // Envelope shaping (fade in and fade out)
    const attack = Math.min(1, t / 0.08);
    const release = Math.min(1, (baseSeconds - t) / 0.12);
    const envelope = attack * release;

    // Cadence modulation (simulating syllables and pauses)
    const syllableRate = 4.2 * speed;
    const syllableEnvelope = 0.5 + 0.5 * Math.sin(2 * Math.PI * syllableRate * t);

    // Subtle pitch jitter based on stability
    const currentF0 = f0 * (1 + jitterAmount * Math.sin(2 * Math.PI * 5.5 * t));

    // Formant harmonics (F0, 2*F0, 3*F0, 4*F0)
    const h1 = Math.sin(2 * Math.PI * currentF0 * t);
    const h2 = 0.5 * Math.sin(2 * Math.PI * currentF0 * 2 * t);
    const h3 = 0.25 * Math.sin(2 * Math.PI * currentF0 * 3 * t);
    const h4 = 0.12 * Math.sin(2 * Math.PI * currentF0 * 4 * t);

    let sampleVal = (h1 + h2 + h3 + h4) * 0.45 * envelope * (0.3 + 0.7 * syllableEnvelope);

    // Clamp 16-bit integer
    sampleVal = Math.max(-1, Math.min(1, sampleVal));
    const intSample = Math.floor(sampleVal * 32767);

    buffer.writeInt16LE(intSample, offset);
    offset += 2;
  }

  return buffer;
}
