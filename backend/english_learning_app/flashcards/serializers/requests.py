from rest_framework.serializers import (
    CharField,
    ChoiceField,
    Serializer,
)
from flashcards.models import LanguageEnums


class RequestImportVocabulariesSerializer(Serializer):
    import_type = ChoiceField(choices=["text", "csv", "json"])
    import_text = CharField()
    language_from = ChoiceField(choices=LanguageEnums.values)
    language_to = ChoiceField(choices=LanguageEnums.values)