from rest_framework import serializers
from drf_extra_fields.fields import Base64ImageField


class UploadImageSerializer(serializers.Serializer):
    name = serializers.CharField(required=False)
    size = serializers.IntegerField(required=False)
    type = serializers.CharField(required=False)
    base64 = Base64ImageField(write_only=True, required=False)
    url = serializers.CharField(read_only=True)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['name'] = instance.name.split('/')[-1]
        import mimetypes
        mime, _ = mimetypes.guess_type(instance.name)
        data['type'] = mime
        return data