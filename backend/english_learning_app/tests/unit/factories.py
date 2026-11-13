import uuid

from django.contrib.auth import get_user_model

from flashcards.models import Topic, TopicMember, Vocabulary

User = get_user_model()


def make_user(**kwargs):
    username = kwargs.pop('username', f'user_{uuid.uuid4().hex[:8]}')
    email = kwargs.pop('email', f'{username}@example.com')
    password = kwargs.pop('password', 'Password123!')
    defaults = {'username': username, 'email': email, 'password': password}
    defaults.update(kwargs)
    return User.objects.create_user(**defaults)


def make_topic(created_by=None, **kwargs):
    created_by = created_by or make_user()
    defaults = {
        'name': kwargs.pop('name', f'Topic {uuid.uuid4().hex[:6]}'),
        'status': kwargs.pop('status', Topic.TopicStatusEnums.PUBLIC),
        'created_by': created_by,
    }
    defaults.update(kwargs)
    return Topic.objects.create(**defaults)


def make_topic_member(topic=None, member=None, **kwargs):
    topic = topic or make_topic()
    member = member or make_user()
    defaults = {
        'topic': topic,
        'member': member,
        'status': kwargs.pop('status', TopicMember.TopicMemberStatusEnums.READ_ONLY),
    }
    defaults.update(kwargs)
    return TopicMember.objects.create(**defaults)


def make_vocabulary(topic=None, created_by=None, **kwargs):
    topic = topic or make_topic()
    created_by = created_by or topic.created_by or make_user()
    defaults = {
        'word': kwargs.pop('word', f'word_{uuid.uuid4().hex[:6]}'),
        'topic': topic,
        'created_by': created_by,
    }
    defaults.update(kwargs)
    return Vocabulary.objects.create(**defaults)
