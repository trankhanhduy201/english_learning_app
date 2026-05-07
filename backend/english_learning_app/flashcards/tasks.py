import json
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from flashcards.services.vocabularies import VocabularyAudioService

vocabAudioService = VocabularyAudioService()

def generate_vocab_audio_binary(vocab_ids, user_id=None):
    print("Generating audio for vocab IDs:", vocab_ids)
    results = vocabAudioService.generate_audio(vocab_ids)
    results['user_id'] = user_id
    results['vocab_ids'] = vocab_ids
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
