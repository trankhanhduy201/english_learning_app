from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(
            code=lambda apps, schema_editor: _copy_user_data(apps, schema_editor),
            reverse_code=lambda apps, schema_editor: _revert_user_data(apps, schema_editor),
        )
    ]


def _safe_get_model(apps, app_label, model_name):
    try:
        return apps.get_model(app_label, model_name)
    except LookupError:
        return None


def _copy_user_data(apps, schema_editor):
    """Copy user-related rows from legacy flashcards.* tables to users.* tables."""
    FlashUserProfile = _safe_get_model(apps, 'flashcards', 'UserProfile')
    FlashUserToken = _safe_get_model(apps, 'flashcards', 'UserToken')
    FlashUserSalt = _safe_get_model(apps, 'flashcards', 'UserSalt')

    UsersUserProfile = apps.get_model('users', 'UserProfile')
    UsersUserToken = apps.get_model('users', 'UserToken')
    UsersUserSalt = apps.get_model('users', 'UserSalt')

    if FlashUserProfile is not None:
        for p in FlashUserProfile.objects.all():
            avatar_val = None
            if getattr(p, 'avatar', None):
                try:
                    avatar_val = p.avatar.name
                except Exception:
                    avatar_val = p.avatar

            UsersUserProfile.objects.update_or_create(
                user_id=p.user_id,
                defaults={'avatar': avatar_val, 'bio': p.bio, 'updated_at': p.updated_at},
            )

    if FlashUserToken is not None:
        for t in FlashUserToken.objects.all():
            UsersUserToken.objects.update_or_create(
                user_id=t.user_id,
                defaults={'refresh_token_version': t.refresh_token_version},
            )

    if FlashUserSalt is not None:
        for s in FlashUserSalt.objects.all():
            UsersUserSalt.objects.update_or_create(
                user_id=s.user_id,
                defaults={'salt': s.salt},
            )


def _revert_user_data(apps, schema_editor):
    """Reverse operation: copy data from users.* back to legacy flashcards.* tables."""
    FlashUserProfile = _safe_get_model(apps, 'flashcards', 'UserProfile')
    FlashUserToken = _safe_get_model(apps, 'flashcards', 'UserToken')
    FlashUserSalt = _safe_get_model(apps, 'flashcards', 'UserSalt')

    UsersUserProfile = apps.get_model('users', 'UserProfile')
    UsersUserToken = apps.get_model('users', 'UserToken')
    UsersUserSalt = apps.get_model('users', 'UserSalt')

    if FlashUserProfile is None:
        return

    for p in UsersUserProfile.objects.all():
        avatar_val = None
        if getattr(p, 'avatar', None):
            try:
                avatar_val = p.avatar.name
            except Exception:
                avatar_val = p.avatar

        FlashUserProfile.objects.update_or_create(
            user_id=p.user_id,
            defaults={'avatar': avatar_val, 'bio': p.bio, 'updated_at': p.updated_at},
        )

    if FlashUserToken is not None:
        for t in UsersUserToken.objects.all():
            FlashUserToken.objects.update_or_create(
                user_id=t.user_id,
                defaults={'refresh_token_version': t.refresh_token_version},
            )

    if FlashUserSalt is not None:
        for s in UsersUserSalt.objects.all():
            FlashUserSalt.objects.update_or_create(
                user_id=s.user_id,
                defaults={'salt': s.salt},
            )

