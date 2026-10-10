from flashcards.services.vocabularies import vocabulary_audio_service


def generate_vocab_audio_binary(vocab_ids, user_id=None):
    print("Generating audio for vocab IDs:", vocab_ids)
    results = vocabulary_audio_service.generate_audio(vocab_ids)
    results['user_id'] = user_id
    results['vocab_ids'] = vocab_ids
    return results
