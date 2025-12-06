from django.contrib import admin
from .models import (
    Topic, TopicMember, Vocabulary, Translation,
    UserToken, UserSalt
)
# from django.contrib.auth.admin import UserAdmin
# from .models import CustomUser

# @admin.register(CustomUser)
# class CustomUserAdmin(UserAdmin):
#     model = CustomUser
#     fieldsets = UserAdmin.fieldsets + (
#         ("Additional Info", {"fields": ("refresh_token_version")}),
#     )


class TopicMemberInline(admin.TabularInline):
    model = TopicMember
    extra = 0
    autocomplete_fields = ['member']


@admin.register(Topic)
class TopicAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'name', 'learning_language', 'status', 'created_by'
    )
    list_filter = ('learning_language', 'status')
    search_fields = ('name',)
    inlines = [TopicMemberInline]
    autocomplete_fields = ['created_by']
    readonly_fields = ('id',)


@admin.register(TopicMember)
class TopicMemberAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'member', 'topic', 'status', 'joined_at'
    )
    list_filter = ('status', 'joined_at')
    search_fields = ('member__username', 'topic__name')
    autocomplete_fields = ['member', 'topic']
    readonly_fields = ('joined_at',)


@admin.register(Vocabulary)
class VocabularyAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'word', 'topic', 'language', 'created_by'
    )
    list_filter = ('language', 'topic')
    search_fields = ('word',)
    autocomplete_fields = ['topic', 'created_by']


@admin.register(Translation)
class TranslationAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'translation', 'language', 'vocabulary', 'type', 'created_by'
    )
    list_filter = ('language', 'type')
    search_fields = ('translation',)
    autocomplete_fields = ['vocabulary', 'created_by']


@admin.register(UserToken)
class UserTokenAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'refresh_token_version')
    autocomplete_fields = ['user']


@admin.register(UserSalt)
class UserSaltAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'salt')
    search_fields = ('user__username',)
    autocomplete_fields = ['user']
