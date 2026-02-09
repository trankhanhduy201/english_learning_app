from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from drf_extra_fields.fields import Base64ImageField
from flashcards.models import UserProfile


class RetrieveUserSerializer(serializers.ModelSerializer):
    avatar = serializers.ImageField(source='profile.avatar', read_only=True)

    class Meta:
        model = get_user_model()
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "avatar",
        ]
        read_only_fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "avatar",
        ]


class CreateUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, trim_whitespace=False, required=True)

    class Meta:
        model = get_user_model()
        fields = [
            "username",
            "password",
            "first_name",
            "last_name",
            "email",
        ]

    def validate_username(self, value):
        username = (value or "").strip()
        if not username:
            raise serializers.ValidationError("Username is required.")

        user_model = get_user_model()
        qs = user_model.objects.filter(username__iexact=username)
        if self.instance is not None:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("Username already exists.")

        return username

    def validate_password(self, value):
        validate_password(value)
        return make_password(value)
    

class UpdateUserSerializer(serializers.ModelSerializer):
    # Accept avatar uploads via JSON (data URL base64), same pattern as TopicSerializer.upload_image
    avatar = Base64ImageField(source="profile.avatar", write_only=True, required=False, allow_null=True)

    class Meta:
        model = get_user_model()
        fields = [
            "first_name",
            "last_name",
            "email",
            "avatar",
        ]

    def update(self, instance, validated_data):
        profile_data = validated_data.pop("profile", None)

        user_update_fields = []
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
            user_update_fields.append(attr)
        if user_update_fields:
            instance.save(update_fields=user_update_fields)

        if profile_data is not None and "avatar" in profile_data:
            try:
                profile = instance.profile
            except UserProfile.DoesNotExist:
                profile = UserProfile(user=instance)

            avatar_value = profile_data.get("avatar")
            if avatar_value is None and getattr(profile, "avatar", None):
                # Ensure old file is removed from storage when explicitly clearing.
                profile.avatar.delete(save=False)

            profile.avatar = avatar_value

            if profile.pk:
                profile.save(update_fields=["avatar"])
            else:
                profile.save()

        return instance