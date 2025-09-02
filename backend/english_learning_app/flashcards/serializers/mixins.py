from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework.exceptions import ValidationError
from rest_framework_simplejwt.settings import api_settings
from flashcards.authentications import check_token_version


class TokenSerializerMixin:
    def validate(self, attrs):
        if hasattr(self, 'token_class'):
            token = self.token_class(attrs[self.token_class.token_type])
        else:
            token = UntypedToken(attrs["token"])

        user_id = token.payload.get(api_settings.USER_ID_CLAIM, None)
        token_version = token.payload.get('token_version', None)
        if check_token_version(user_id, token_version) is False:
            raise ValidationError("Token has been revoked")
        return super().validate(attrs)