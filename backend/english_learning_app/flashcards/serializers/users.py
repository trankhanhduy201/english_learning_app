from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from drf_extra_fields.fields import Base64ImageField
from flashcards.models import UserProfile


class RetrieveUserSerializer(serializers.ModelSerializer):
    avatar = serializers.ImageField(source='profile.avatar', read_only=True)
    bio = serializers.CharField(source="profile.bio", read_only=True)

    class Meta:
        model = get_user_model()
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "avatar",
            "bio",
        ]
        read_only_fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "avatar",
            "bio",
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
    avatar = Base64ImageField(write_only=True, required=False, allow_null=True)
    bio = serializers.CharField(write_only=True, required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = get_user_model()
        fields = [
            "first_name",
            "last_name",
            "email",
            "avatar",   
            "bio",
        ]

    def update(self, instance, validated_data):
        self.update_profile(instance, validated_data)
        return super().update(instance, validated_data)
    
    def update_profile(self, instance, validated_data):
        profile, _ = UserProfile.objects.get_or_create(user=instance)
        profile.bio = validated_data.pop("bio", None)

        if "avatar" in validated_data:
            if getattr(profile, "avatar", None):
                profile.avatar.delete(save=False)
            profile.avatar = validated_data.pop("avatar", None)

        profile.save()
        return profile