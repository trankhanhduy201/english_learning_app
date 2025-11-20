import json
from gtts import gTTS
from io import BytesIO
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from flashcards.models import Vocabulary


def generate_vocab_audio_binary(vocab_ids, user_id=None):
    vocabs = Vocabulary.objects.filter(pk__in=vocab_ids)
    results = {
        'user_id': user_id,
        'vocab_ids': vocab_ids,
        'audios': {}
    }
    if not vocabs.exists():
        return results

    for vocab in vocabs:
        # # For testing purposes, we skip actual TTS generation
        # results['audios'].update({vocab.word: f"test_audio_for_{vocab.word}"})
        # continue

        tts = gTTS(text=vocab.word, lang=vocab.language)
        buffer = BytesIO()
        tts.write_to_fp(buffer)
        audio_binary = buffer.getvalue()
        vocab.__dict__.update({'audio': audio_binary})
        import base64
        audio_base64 = base64.b64encode(audio_binary).decode('utf-8')
        results['audios'].update({vocab.word: audio_base64})
    Vocabulary.objects.bulk_update(vocabs, ['audio'])
    return results


def notify_vocab_audio_hook(task):
    """
    Hook for Django Q task completion.
    Runs after generate_vocab_audio_async finishes.
    """
    if not task.success:
        print("Task failed:", task.result)
        return
    
    result = task.result
    user_id = result.get('user_id', None)
    if user_id is not None:
        message = 'generating_vocab_audio_notify'
        data_json = json.dumps(result.get('audios', {}))
        notify_user(user_id, message, data_json)


def notify_user(user_id, message, data_json):
    if user_id:
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"user_{user_id}",
            {
                "type": "send_notification",
                "message": {
                    "type": message,
                    "data": data_json
                },
            },
        )
