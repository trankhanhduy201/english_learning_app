from django.db import migrations


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(
            code=lambda apps, schema_editor: _copy_user_data(apps, schema_editor),
            reverse_code=lambda apps, schema_editor: _revert_user_data(apps, schema_editor),
        )
    ]


def _copy_user_data(apps, schema_editor):
    """Copy user-related rows from flashcards.* tables to users.* tables."""
    FlashUserProfile = apps.get_model('flashcards', 'UserProfile')
    FlashUserToken = apps.get_model('flashcards', 'UserToken')
    FlashUserSalt = apps.get_model('flashcards', 'UserSalt')

    UsersUserProfile = apps.get_model('users', 'UserProfile')
    UsersUserToken = apps.get_model('users', 'UserToken')
    UsersUserSalt = apps.get_model('users', 'UserSalt')

    # Copy profiles
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

    # Copy tokens
    for t in FlashUserToken.objects.all():
        UsersUserToken.objects.update_or_create(
            user_id=t.user_id,
            defaults={'refresh_token_version': t.refresh_token_version},
        )

    # Copy salts
    for s in FlashUserSalt.objects.all():
        UsersUserSalt.objects.update_or_create(
            user_id=s.user_id,
            defaults={'salt': s.salt},
        )


def _revert_user_data(apps, schema_editor):
    """Reverse operation: copy data from users.* back to flashcards.* tables."""
    FlashUserProfile = apps.get_model('flashcards', 'UserProfile')
    FlashUserToken = apps.get_model('flashcards', 'UserToken')
    FlashUserSalt = apps.get_model('flashcards', 'UserSalt')

    UsersUserProfile = apps.get_model('users', 'UserProfile')
    UsersUserToken = apps.get_model('users', 'UserToken')
    UsersUserSalt = apps.get_model('users', 'UserSalt')

    # Copy profiles back
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

    # Copy tokens back
    for t in UsersUserToken.objects.all():
        FlashUserToken.objects.update_or_create(
            user_id=t.user_id,
            defaults={'refresh_token_version': t.refresh_token_version},
        )

    # Copy salts back
    for s in UsersUserSalt.objects.all():
        FlashUserSalt.objects.update_or_create(
            user_id=s.user_id,
            defaults={'salt': s.salt},
        )

