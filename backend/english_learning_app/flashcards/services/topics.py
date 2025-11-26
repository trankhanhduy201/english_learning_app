from flashcards.models import Topic


class TopicService:
	def get_create_update_members(self, topic, updating_members):
		for member in updating_members:
			if 'topic' in member and isinstance(member['topic'], int) and member['topic'] != topic.pk:
				raise ValueError('The topic is not existed')
			member['topic'] = topic
		return updating_members