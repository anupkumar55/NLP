from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from googletrans import Translator, LANGUAGES
from gtts import gTTS
from fastapi.responses import StreamingResponse
import io
from fastapi import UploadFile, File
import speech_recognition as sr
import os
from pydub import AudioSegment

app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://172.17.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

translator = Translator()

class TranslationRequest(BaseModel):
    text: str
    source_lang: str
    dest_lang: str

class TextToSpeechRequest(BaseModel):
    text: str
    lang: str


@app.get('/')
def welcome():
    return {'msg': 'Welcome to translator API backend.'}

@app.get("/languages")
def get_supported_languages():
    return LANGUAGES

@app.post("/translate")
def translate_text(request: TranslationRequest):
    translated = translator.translate(request.text, src=request.source_lang, dest=request.dest_lang)
    return {"translated_text": translated.text}

@app.post("/text-to-speech")
def text_to_speech(request: TextToSpeechRequest):
    tts = gTTS(text=request.text, lang=request.lang)
    audio_file = io.BytesIO()
    tts.write_to_fp(audio_file)
    audio_file.seek(0)
    return StreamingResponse(audio_file, media_type="audio/mpeg")

@app.post("/recognize-and-translate")
async def recognize_and_translate(file: UploadFile = File(...), dest_lang: str = "en"):
    audio_bytes = await file.read()
    webm_path = "temp_audio.webm"
    wav_path = "temp_audio.wav"
    with open(webm_path, "wb") as f:
        f.write(audio_bytes)
    # Convert webm to wav
    audio = AudioSegment.from_file(webm_path, format="webm")
    audio.export(wav_path, format="wav")
    recognizer = sr.Recognizer()
    try:
        with sr.AudioFile(wav_path) as source:
            audio_data = recognizer.record(source)
        text = recognizer.recognize_google(audio_data)
        translated = translator.translate(text, dest=dest_lang)
        result = {"transcription": text, "translated_text": translated.text}
    except Exception as e:
        result = {"error": f"Speech recognition failed: {str(e)}"}
    finally:
        for path in [webm_path, wav_path]:
            try:
                if os.path.exists(path):
                    os.remove(path)
            except Exception as del_err:
                print(f"Error deleting {path}: {del_err}")
    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="localhost", port=8000)
