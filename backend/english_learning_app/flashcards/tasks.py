from gtts import gTTS
from io import BytesIO
from flashcards.models import Vocabulary


def generate_vocab_audio_binary(vocab_ids):
	vocabs = Vocabulary.objects.filter(pk__in=vocab_ids)
	results = {
		'vocab_ids': vocab_ids,
		'audios': {}
	}
	if not vocabs.exists():
		return results

	for vocab in vocabs:
		tts = gTTS(text=vocab.word, lang=vocab.language)
		buffer = BytesIO()
		tts.write_to_fp(buffer)
		audio_binary = buffer.getvalue()
		vocab.__dict__.update({'audio': audio_binary})
		results['audios'].update({vocab.word: audio_binary})
	Vocabulary.objects.bulk_update(vocabs, ['audio'])
	return results
