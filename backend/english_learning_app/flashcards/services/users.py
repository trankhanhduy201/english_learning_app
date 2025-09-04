import secrets
from django.shortcuts import get_object_or_404
from django.core.signing import Signer, BadSignature
from flashcards.models import UserSalt


class UserSignatureService:
    def sign(self, user_id, value):
        user_salt = UserSalt.objects.filter(user_id=user_id).first()
        if not user_salt:
            user_salt = UserSalt.objects.create(
                user_id=user_id,
                salt=secrets.token_hex(16)
            )

        signer = Signer(salt=user_salt.salt)
        return signer.sign(value)
    
    def unsign(self, user_id, signature):
        try:
            user_salt = get_object_or_404(UserSalt, user_id=user_id)
            signer = Signer(salt=user_salt.salt)
            return signer.unsign(signature)
        except BadSignature as e:
            raise e