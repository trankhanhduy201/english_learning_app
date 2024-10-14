from rest_framework import generics, viewsets
from django_filters.rest_framework import DjangoFilterBackend
from flashcards.serializers import VocabularySerializer
from flashcards.models import Vocabulary, Translation
from flashcards.filters import VocabularyFilter


class VocabularyViewSet(viewsets.ModelViewSet):
	queryset = Vocabulary.objects.all()
	serializer_class = VocabularySerializer
	filter_backends = [DjangoFilterBackend]
	filterset_class = VocabularyFilter

	# Below code for using simple filtering without defining filterset
	# Note that using filterset_fields and filterset_class together is not supported.
	# filter_backends = [DjangoFilterBackend]
	# filterset_fields = ['topic__id']

	# Below code for using search field that is pass to query url
	# This can combine with OtherFilter
	# filter_backends = [filters.SearchFilter]
	# search_fields = ['word', 'translations__translation']

	def perform_create(self, serializer):
		validated_data = serializer.validated_data
		translations = validated_data.pop('translations')
		vocabulary = serializer.save(**validated_data)
		if len(translations) > 0:
			translations = [Translation(vocabulary=vocabulary, **translation) for translation in translations]
			Translation.objects.bulk_create(translations)
		return vocabulary


