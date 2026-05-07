from io import BytesIO
from gtts import gTTS


def get_tts_audio(text, language):
        tts = gTTS(text=text, lang=language)
        buffer = BytesIO()
        tts.write_to_fp(buffer)
        return buffer.getvalue()