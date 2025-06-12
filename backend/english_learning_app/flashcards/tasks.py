from gtts import gTTS
from io import BytesIO
from flashcards.models import Vocabulary


def generate_vocab_audio_binary(vocab_ids):
	vocabs = Vocabulary.objects.filter(pk__in=vocab_ids)
	for vocab in vocabs:
		tts = gTTS(text=vocab.word, lang=vocab.language)
		buffer = BytesIO()
		tts.write_to_fp(buffer)
		vocab.__dict__.update({
			'audio': buffer.getvalue()
		})
	Vocabulary.objects.bulk_update(vocabs, ['audio'])
	return vocabs
