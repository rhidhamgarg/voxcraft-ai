import sys
import io
import json
import time
import os
import numpy as np
import soundfile as sf
import warnings

warnings.filterwarnings("ignore")
os.environ["HF_HUB_DISABLE_SYMLINKS_WARNING"] = "1"

def run_cli():
    """
    Synthesize speech from stdin JSON:
    { "text": "...", "voice": "af_heart", "speed": 1.0, "output_path": "..." }
    """
    from kokoro import KPipeline

    try:
        raw_input = sys.stdin.read().strip()
        if not raw_input and len(sys.argv) > 1:
            raw_input = sys.argv[1]

        data = json.loads(raw_input)
        text = data.get("text", "").strip()
        voice = data.get("voice", "af_heart")
        speed = float(data.get("speed", 1.0))
        output_path = data.get("output_path")

        if not text:
            print(json.dumps({"error": "No text provided"}), file=sys.stderr)
            sys.exit(1)

        lang_code = 'b' if voice.startswith('b') else 'a'
        pipeline = KPipeline(lang_code=lang_code, repo_id='hexgrad/Kokoro-82M')

        t0 = time.time()
        generator = pipeline(text, voice=voice, speed=speed, split_pattern=r'\n+')
        audio_chunks = []
        for _, _, audio in generator:
            if audio is not None and len(audio) > 0:
                audio_chunks.append(audio)

        if not audio_chunks:
            print(json.dumps({"error": "Empty audio generated"}), file=sys.stderr)
            sys.exit(1)

        full_audio = np.concatenate(audio_chunks)
        duration = len(full_audio) / 24000.0

        if output_path:
            sf.write(output_path, full_audio, 24000, format='WAV', subtype='PCM_16')
            result = {
                "success": True,
                "output_path": output_path,
                "duration": duration,
                "sample_rate": 24000,
                "time_taken": time.time() - t0
            }
            print(json.dumps(result))
        else:
            wav_io = io.BytesIO()
            sf.write(wav_io, full_audio, 24000, format='WAV', subtype='PCM_16')
            sys.stdout.buffer.write(wav_io.getvalue())

    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    run_cli()
