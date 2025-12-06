from django.db.models import Prefetch, Subquery, OuterRef, Count, IntegerField
from flashcards.models import Translation, TopicMember


def get_translation_prefetch_related(params=None):
	qs = Translation.objects.all()
	if params:
		lang = params.get('lang', None)
		if lang:
			qs = qs.filter(language=lang)
	return Prefetch('translations', queryset=qs)

def get_topic_member_prefetch_related(params=None):
	qs = TopicMember.objects \
		.select_related('member') \
		.order_by('-joined_at') \
		.only('id', 'status', 'joined_at', 'member', 'topic','member__id', 'member__username')

	return Prefetch('topic_members', queryset=qs)

def get_member_count_subquery():
	return Subquery(
		TopicMember.objects
			.filter(topic=OuterRef('id'))
			.values('topic_id')
			.annotate(count=Count('id'))
			.values('count')
		, output_field=IntegerField()
	)


