from django_q.tasks import async_task
from flashcards.tasks import generate_vocab_audio_binary


def generate_vocab_audio_async(vocab_ids, user_id=None, chunk_size=20):
	vocab_ids = [vocab_ids[i:i + chunk_size] for i in range(0, len(vocab_ids), chunk_size)]
	for ids in vocab_ids:
		async_task(generate_vocab_audio_binary, ids, user_id, hook='flashcards.tasks.notify_vocab_audio_hook')
