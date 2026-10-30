import os
import io
import time
import re
import numpy as np
import soundfile as sf
import uvicorn
from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List, Dict
import warnings

# Suppress benign PyTorch and HuggingFace warnings
warnings.filterwarnings("ignore")
os.environ["HF_HUB_DISABLE_SYMLINKS_WARNING"] = "1"

app = FastAPI(
    title="VoxCraft Kokoro-82M TTS Microservice",
    description="High-fidelity local neural TTS inference powered by Kokoro-82M",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global pipeline cache by lang_code
PIPELINES = {}

SUPPORTED_VOICES = [
    # American English (lang_code='a')
    {"id": "af_heart", "name": "Heart (Warm & Expressive)", "gender": "Female", "accent": "American", "lang_code": "a", "sample_rate": 24000, "traits": ["Warm", "Expressive", "Conversational"]},
    {"id": "af_bella", "name": "Bella (Clear & Friendly)", "gender": "Female", "accent": "American", "lang_code": "a", "sample_rate": 24000, "traits": ["Friendly", "Clear", "Polite"]},
    {"id": "af_nicole", "name": "Nicole (Crisp & Direct)", "gender": "Female", "accent": "American", "lang_code": "a", "sample_rate": 24000, "traits": ["Crisp", "Professional", "Direct"]},
    {"id": "af_aoede", "name": "Aoede (Melodic & Soft)", "gender": "Female", "accent": "American", "lang_code": "a", "sample_rate": 24000, "traits": ["Melodic", "Gentle", "Narrative"]},
    {"id": "af_kore", "name": "Kore (Dynamic & Youthful)", "gender": "Female", "accent": "American", "lang_code": "a", "sample_rate": 24000, "traits": ["Dynamic", "Youthful", "Bright"]},
    {"id": "af_sarah", "name": "Sarah (Neutral & Crisp)", "gender": "Female", "accent": "American", "lang_code": "a", "sample_rate": 24000, "traits": ["Neutral", "Audiobook", "Crisp"]},
    {"id": "af_sky", "name": "Sky (Ethereal & Calm)", "gender": "Female", "accent": "American", "lang_code": "a", "sample_rate": 24000, "traits": ["Ethereal", "Calm", "Meditative"]},
    {"id": "am_adam", "name": "Adam (Deep & Authoritative)", "gender": "Male", "accent": "American", "lang_code": "a", "sample_rate": 24000, "traits": ["Deep", "Authoritative", "Studio Narration"]},
    {"id": "am_michael", "name": "Michael (Executive & Steady)", "gender": "Male", "accent": "American", "lang_code": "a", "sample_rate": 24000, "traits": ["Executive", "Steady", "News"]},
    {"id": "am_echo", "name": "Echo (Resonant & Confident)", "gender": "Male", "accent": "American", "lang_code": "a", "sample_rate": 24000, "traits": ["Resonant", "Confident", "Commercial"]},
    {"id": "am_eric", "name": "Eric (Conversational & Warm)", "gender": "Male", "accent": "American", "lang_code": "a", "sample_rate": 24000, "traits": ["Conversational", "Warm", "Podcast"]},
    {"id": "am_fenrir", "name": "Fenrir (Intense & Cinematic)", "gender": "Male", "accent": "American", "lang_code": "a", "sample_rate": 24000, "traits": ["Cinematic", "Gritty", "Dramatic"]},
    {"id": "am_liam", "name": "Liam (Natural & Engaging)", "gender": "Male", "accent": "American", "lang_code": "a", "sample_rate": 24000, "traits": ["Natural", "Engaging", "Casual"]},
    {"id": "am_onyx", "name": "Onyx (Deep Bass & Rich)", "gender": "Male", "accent": "American", "lang_code": "a", "sample_rate": 24000, "traits": ["Bass", "Rich", "Trailer"]},
    {"id": "am_puck", "name": "Puck (Playful & Energetic)", "gender": "Male", "accent": "American", "lang_code": "a", "sample_rate": 24000, "traits": ["Playful", "Energetic", "Upbeat"]},

    # British English (lang_code='b')
    {"id": "bf_emma", "name": "Emma (Polished British)", "gender": "Female", "accent": "British", "lang_code": "b", "sample_rate": 24000, "traits": ["Polished", "RP British", "Documentary"]},
    {"id": "bf_isabella", "name": "Isabella (Classic London)", "gender": "Female", "accent": "British", "lang_code": "b", "sample_rate": 24000, "traits": ["Classic", "London", "Literary"]},
    {"id": "bf_alice", "name": "Alice (Crisp Oxford)", "gender": "Female", "accent": "British", "lang_code": "b", "sample_rate": 24000, "traits": ["Oxford", "Academic", "Articulate"]},
    {"id": "bf_lily", "name": "Lily (Gentle British)", "gender": "Female", "accent": "British", "lang_code": "b", "sample_rate": 24000, "traits": ["Gentle", "Warm", "Storytelling"]},
    {"id": "bm_george", "name": "George (Aristocratic & Rich)", "gender": "Male", "accent": "British", "lang_code": "b", "sample_rate": 24000, "traits": ["Aristocratic", "Rich", "BBC Style"]},
    {"id": "bm_lewis", "name": "Lewis (Modern British Male)", "gender": "Male", "accent": "British", "lang_code": "b", "sample_rate": 24000, "traits": ["Modern", "Youthful", "Podcast"]},
    {"id": "bm_fable", "name": "Fable (Enigmatic Storyteller)", "gender": "Male", "accent": "British", "lang_code": "b", "sample_rate": 24000, "traits": ["Enigmatic", "Storyteller", "Atmospheric"]},
    {"id": "bm_daniel", "name": "Daniel (Precise & Clear)", "gender": "Male", "accent": "British", "lang_code": "b", "sample_rate": 24000, "traits": ["Precise", "Documentary", "Educational"]}
]

def get_pipeline(lang_code: str = 'a'):
    """Lazy load or retrieve pipeline for a specific language code."""
    from kokoro import KPipeline
    if lang_code not in PIPELINES:
        print(f"[Kokoro Engine] Initializing KPipeline for lang_code='{lang_code}'...")
        PIPELINES[lang_code] = KPipeline(lang_code=lang_code, repo_id='hexgrad/Kokoro-82M')
        print(f"[Kokoro Engine] KPipeline('{lang_code}') loaded and ready.")
    return PIPELINES[lang_code]

def detect_lang_code(voice_id: str, requested_lang: Optional[str] = None) -> str:
    """Infer lang_code from voice id prefix if not explicitly specified."""
    if requested_lang and requested_lang in ['a', 'b', 'e', 'f', 'h', 'i', 'j', 'p', 'z']:
        return requested_lang
    if voice_id.startswith('b'):
        return 'b'
    elif voice_id.startswith('e'):
        return 'e'
    elif voice_id.startswith('f'):
        return 'f'
    elif voice_id.startswith('h'):
        return 'h'
    elif voice_id.startswith('i'):
        return 'i'
    elif voice_id.startswith('j'):
        return 'j'
    elif voice_id.startswith('p'):
        return 'p'
    elif voice_id.startswith('z'):
        return 'z'
    return 'a'

@app.on_event("startup")
async def startup_event():
    print("[Kokoro Microservice] Warming up American English pipeline ('a')...")
    get_pipeline('a')
    print("[Kokoro Microservice] Server is operational on http://127.0.0.1:8880")

class SynthesizeRequest(BaseModel):
    input: str = Field(..., description="The text script to synthesize")
    voice: Optional[str] = Field("af_heart", description="Voice ID (e.g. af_heart, am_adam, bf_emma)")
    speed: Optional[float] = Field(1.0, ge=0.5, le=2.0, description="Speech rate multiplier (0.5 to 2.0)")
    lang_code: Optional[str] = Field(None, description="Optional override for language code ('a', 'b', 'e', etc.)")
    response_format: Optional[str] = Field("wav", description="Audio container format: 'wav'")

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "voxcraft-kokoro-tts",
        "model": "hexgrad/Kokoro-82M",
        "sample_rate": 24000,
        "loaded_pipelines": list(PIPELINES.keys()),
        "default_voice": "af_heart"
    }

@app.get("/v1/voices")
def list_voices():
    return {
        "voices": SUPPORTED_VOICES,
        "total": len(SUPPORTED_VOICES)
    }

@app.post("/v1/audio/speech")
def synthesize_speech(req: SynthesizeRequest):
    text = req.input.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Input text cannot be empty.")

    voice = req.voice or "af_heart"
    speed = float(req.speed) if req.speed else 1.0
    lang_code = detect_lang_code(voice, req.lang_code)

    t0 = time.time()
    try:
        pipeline = get_pipeline(lang_code)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load pipeline for '{lang_code}': {str(e)}")

    try:
        generator = pipeline(text, voice=voice, speed=speed, split_pattern=r'\n+')
        audio_chunks = []
        for _, _, audio in generator:
            if audio is not None and len(audio) > 0:
                audio_chunks.append(audio)

        if not audio_chunks:
            raise HTTPException(status_code=500, detail="Inference returned empty audio buffer.")

        full_audio = np.concatenate(audio_chunks)
        duration = len(full_audio) / 24000.0

        # Encode to standard 24kHz 16-bit PCM WAV in memory
        wav_io = io.BytesIO()
        sf.write(wav_io, full_audio, 24000, format='WAV', subtype='PCM_16')
        wav_bytes = wav_io.getvalue()

        process_time = time.time() - t0
        print(f"[Synthesize] Generated {duration:.2f}s of audio with voice '{voice}' in {process_time:.2f}s (Speed: {duration/process_time:.1f}x real-time)")

        return Response(
            content=wav_bytes,
            media_type="audio/wav",
            headers={
                "Content-Type": "audio/wav",
                "Content-Disposition": f'attachment; filename="kokoro_{voice}_{int(time.time())}.wav"',
                "X-Audio-Duration": f"{duration:.3f}",
                "X-Audio-Sample-Rate": "24000",
                "X-Audio-Voice": voice,
                "X-Generation-Time": f"{process_time:.3f}"
            }
        )
    except Exception as e:
        print(f"[Synthesize Error] {str(e)}")
        raise HTTPException(status_code=500, detail=f"Kokoro synthesis failed: {str(e)}")

if __name__ == "__main__":
    uvicorn.run("kokoro_server:app", host="127.0.0.1", port=8880, log_level="info")
