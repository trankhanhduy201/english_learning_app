from django.db.models import Prefetch
from flashcards.models import Translation


def get_translation_prefetch_related(params):
	qs = Translation.objects.all()
	lang = params.get('lang', None)
	
	if lang:
		qs = qs.filter(language=lang)
	return Prefetch('translations', queryset=qs)
