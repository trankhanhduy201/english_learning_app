from rest_framework.serializers import (
    CharField,
    ChoiceField,
    IntegerField,
    Serializer,
)
from flashcards.models import LanguageEnums


class RequestImportVocabulariesSerializer(Serializer):
    import_type = ChoiceField(choices=["text", "csv", "json"])
    topic_id = IntegerField()
    import_text = CharField()
    language_from = ChoiceField(choices=LanguageEnums.values)
    language_to = ChoiceField(choices=LanguageEnums.values)