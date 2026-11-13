from django.contrib.auth.models import AnonymousUser
import pytest

from flashcards.models import Topic, TopicMember
from flashcards.permissions import (
    CanBulkDeleteTopic,
    CanBulkDeleteVocab,
    CanSubscribeTopic,
    CanUnsubscribeTopic,
    IsAccessable,
)


@pytest.mark.django_db
class TestCanSubscribeTopic:
    def test_has_permission_allows_authenticated_post(
        self, user_factory, build_permission_request
    ):
        user = user_factory()
        request, view = build_permission_request(user, method='post')

        assert CanSubscribeTopic().has_permission(request, view) is True

    def test_has_permission_rejects_get_requests_and_anonymous_users(
        self, user_factory, build_permission_request
    ):
        requester = user_factory()
        request, view = build_permission_request(requester, method='get')
        assert CanSubscribeTopic().has_permission(request, view) is False

        request, view = build_permission_request(AnonymousUser(), method='post')
        assert CanSubscribeTopic().has_permission(request, view) is False

    def test_has_object_permission_allows_public_topic_without_membership(
        self, user_factory, topic_factory, build_permission_request
    ):
        owner = user_factory()
        topic = topic_factory(created_by=owner, status=Topic.TopicStatusEnums.PUBLIC)
        requester = user_factory()
        request, view = build_permission_request(requester, method='post')

        assert CanSubscribeTopic().has_object_permission(request, view, topic) is True

    def test_has_object_permission_rejects_owner_and_private_topics(
        self, user_factory, topic_factory, build_permission_request
    ):
        owner = user_factory()
        public_topic = topic_factory(created_by=owner, status=Topic.TopicStatusEnums.PUBLIC)
        request, view = build_permission_request(owner, method='post')
        assert CanSubscribeTopic().has_object_permission(request, view, public_topic) is False

        another_user = user_factory()
        private_topic = topic_factory(created_by=user_factory(), status=Topic.TopicStatusEnums.PRIVATE)
        request, view = build_permission_request(another_user, method='post')
        assert CanSubscribeTopic().has_object_permission(request, view, private_topic) is False

    def test_has_object_permission_allows_topic_members_in_leaving_state(
        self, user_factory, topic_factory, topic_member_factory, build_permission_request
    ):
        owner = user_factory()
        topic = topic_factory(created_by=owner, status=Topic.TopicStatusEnums.PUBLIC)
        requester = user_factory()
        topic_member_factory(
            topic=topic,
            member=requester,
            status=TopicMember.TopicMemberStatusEnums.LEAVING,
        )
        request, view = build_permission_request(requester, method='post')

        assert CanSubscribeTopic().has_object_permission(request, view, topic) is True


@pytest.mark.django_db
class TestCanUnsubscribeTopic:
    def test_has_object_permission_allows_pending_editable_and_read_only_members(
        self, user_factory, topic_factory, topic_member_factory, build_permission_request
    ):
        owner = user_factory()
        topic = topic_factory(created_by=owner)
        requester = user_factory()

        for status in [
            TopicMember.TopicMemberStatusEnums.PENDING,
            TopicMember.TopicMemberStatusEnums.EDITABLE,
            TopicMember.TopicMemberStatusEnums.READ_ONLY,
        ]:
            current_requester = user_factory()
            topic_member_factory(topic=topic, member=current_requester, status=status)
            request, view = build_permission_request(current_requester, method='post')
            assert CanUnsubscribeTopic().has_object_permission(request, view, topic) is True

    def test_has_object_permission_rejects_owner_and_blocked_members(
        self, user_factory, topic_factory, topic_member_factory, build_permission_request
    ):
        owner = user_factory()
        topic = topic_factory(created_by=owner)
        request, view = build_permission_request(owner, method='post')
        assert CanUnsubscribeTopic().has_object_permission(request, view, topic) is False

        requester = user_factory()
        topic_member_factory(
            topic=topic,
            member=requester,
            status=TopicMember.TopicMemberStatusEnums.BLOCK,
        )
        request, view = build_permission_request(requester, method='post')
        assert CanUnsubscribeTopic().has_object_permission(request, view, topic) is False


@pytest.mark.django_db
class TestIsAccessable:
    def test_owner_has_access_to_topic_regardless_of_method(
        self, user_factory, topic_factory, build_permission_request
    ):
        owner = user_factory()
        topic = topic_factory(created_by=owner, status=Topic.TopicStatusEnums.PRIVATE)
        request, view = build_permission_request(owner, method='delete')

        assert IsAccessable().has_object_permission(request, view, topic) is True

    def test_private_topic_is_not_readable_by_non_member(
        self, user_factory, topic_factory, build_permission_request
    ):
        owner = user_factory()
        topic = topic_factory(created_by=owner, status=Topic.TopicStatusEnums.PRIVATE)
        requester = user_factory()
        request, view = build_permission_request(requester, method='get')

        assert IsAccessable().has_object_permission(request, view, topic) is False

    def test_private_topic_is_readable_by_member(
        self, user_factory, topic_factory, topic_member_factory, build_permission_request
    ):
        owner = user_factory()
        topic = topic_factory(created_by=owner, status=Topic.TopicStatusEnums.PRIVATE)
        requester = user_factory()
        topic_member_factory(
            topic=topic,
            member=requester,
            status=TopicMember.TopicMemberStatusEnums.EDITABLE,
        )
        request, view = build_permission_request(requester, method='get')

        assert IsAccessable().has_object_permission(request, view, topic) is True

    def test_public_topic_is_readable_by_non_member(self, user_factory, topic_factory, build_permission_request):
        owner = user_factory()
        topic = topic_factory(created_by=owner, status=Topic.TopicStatusEnums.PUBLIC)
        requester = user_factory()
        request, view = build_permission_request(requester, method='get')

        assert IsAccessable().has_object_permission(request, view, topic) is True

    def test_blocked_member_cannot_access_public_topic(self, user_factory, topic_factory, topic_member_factory, build_permission_request):
        owner = user_factory()
        topic = topic_factory(created_by=owner, status=Topic.TopicStatusEnums.PUBLIC)
        requester = user_factory()
        topic_member_factory(
            topic=topic,
            member=requester,
            status=TopicMember.TopicMemberStatusEnums.BLOCK,
        )
        request, view = build_permission_request(requester, method='get')

        assert IsAccessable().has_object_permission(request, view, topic) is False

    def test_editable_member_can_update_topic(self, user_factory, topic_factory, topic_member_factory, build_permission_request):
        owner = user_factory()
        topic = topic_factory(created_by=owner, status=Topic.TopicStatusEnums.PUBLIC)
        requester = user_factory()
        topic_member_factory(
            topic=topic,
            member=requester,
            status=TopicMember.TopicMemberStatusEnums.EDITABLE,
        )
        request, view = build_permission_request(requester, method='put')

        assert IsAccessable().has_object_permission(request, view, topic) is True

    def test_non_owner_cannot_delete_topic_from_member_context(
        self, user_factory, topic_factory, topic_member_factory, build_permission_request
    ):
        owner = user_factory()
        topic = topic_factory(created_by=owner, status=Topic.TopicStatusEnums.PUBLIC)
        requester = user_factory()
        topic_member_factory(
            topic=topic,
            member=requester,
            status=TopicMember.TopicMemberStatusEnums.EDITABLE,
        )
        request, view = build_permission_request(requester, method='delete', basename='topic')

        assert IsAccessable().has_object_permission(request, view, topic) is False

    def test_vocabulary_access_allows_public_topic_reads(self, user_factory, topic_factory, vocabulary_factory, build_permission_request):
        owner = user_factory()
        topic = topic_factory(created_by=owner, status=Topic.TopicStatusEnums.PUBLIC)
        vocabulary = vocabulary_factory(topic=topic, created_by=owner)
        requester = user_factory()
        request, view = build_permission_request(requester, method='get')

        assert IsAccessable().has_object_permission(request, view, vocabulary) is True

    def test_vocabulary_update_requires_vocabulary_ownership(
        self, user_factory, topic_factory, vocabulary_factory, topic_member_factory, build_permission_request
    ):
        owner = user_factory()
        topic = topic_factory(created_by=owner, status=Topic.TopicStatusEnums.PUBLIC)
        vocabulary = vocabulary_factory(topic=topic, created_by=owner)
        requester = user_factory()
        topic_member_factory(
            topic=topic,
            member=requester,
            status=TopicMember.TopicMemberStatusEnums.EDITABLE,
        )
        request, view = build_permission_request(requester, method='put')

        assert IsAccessable().has_object_permission(request, view, vocabulary) is False


@pytest.mark.django_db
class TestCanBulkDeleteTopic:
    def test_has_permission_requires_authenticated_user(self, user_factory, build_permission_request):
        user = user_factory()
        request, view = build_permission_request(user, method='delete', action='bulk_delete')
        assert CanBulkDeleteTopic().has_permission(request, view) is True

        request, view = build_permission_request(AnonymousUser(), method='delete', action='bulk_delete')
        assert CanBulkDeleteTopic().has_permission(request, view) is False


@pytest.mark.django_db
class TestCanBulkDeleteVocab:
    def test_has_permission_requires_authenticated_owner_for_bulk_delete(
        self, user_factory, topic_factory, build_permission_request
    ):
        owner = user_factory()
        topic = topic_factory(created_by=owner)

        request, view = build_permission_request(owner, method='delete', action='bulk_delete', topic_pk=topic.pk)
        assert CanBulkDeleteVocab().has_permission(request, view) is True

        other_user = user_factory()
        request, view = build_permission_request(other_user, method='delete', action='bulk_delete', topic_pk=topic.pk)
        assert CanBulkDeleteVocab().has_permission(request, view) is False

        request, view = build_permission_request(owner, method='delete', action='bulk_delete')
        assert CanBulkDeleteVocab().has_permission(request, view) is False

        request, view = build_permission_request(owner, method='get', action='bulk_delete', topic_pk=topic.pk)
        assert CanBulkDeleteVocab().has_permission(request, view) is True
