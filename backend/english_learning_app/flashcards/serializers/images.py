from rest_framework import serializers
from drf_extra_fields.fields import Base64ImageField
from flashcards.serializers.fields import StringListField


class UploadImageSerializer(serializers.Serializer):
    name = serializers.SerializerMethodField()
    size = serializers.IntegerField()
    types = serializers.SerializerMethodField()
    url = serializers.CharField()

    def _get_name(self, instance):
        return instance.name.split('/')[-1]

    def _guess_type(self, instance):
        import mimetypes
        mime, _ = mimetypes.guess_type(instance.name)

        file_name = self._get_name(instance)
        name, extension = file_name.split('.')
        return [mime, extension]
    
    def get_name(self, instance):
        return self._get_name(instance)
    
    def get_types(self, instance):
        return self._guess_type(instance)