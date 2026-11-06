from urllib.parse import urlsplit

from drf_extra_fields.fields import Base64ImageField
from rest_framework import serializers


class RelativeBase64ImageField(Base64ImageField):
    def to_representation(self, value):
        url = super().to_representation(value)
        if url is None:
            return None

        if not isinstance(url, str):
            return url

        parsed_url = urlsplit(url)
        if parsed_url.scheme and parsed_url.netloc:
            return parsed_url.path or url

        return url


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
