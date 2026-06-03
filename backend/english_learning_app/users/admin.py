from django.contrib import admin
from users.models import UserProfile, UserSalt
from tokens.models import UserToken


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'updated_at')
    search_fields = ('user__username',)
    autocomplete_fields = ['user']
    readonly_fields = ('updated_at',)


@admin.register(UserToken)
class UserTokenAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'refresh_token_version')
    autocomplete_fields = ['user']


@admin.register(UserSalt)
class UserSaltAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'salt')
    search_fields = ('user__username',)
    autocomplete_fields = ['user']
