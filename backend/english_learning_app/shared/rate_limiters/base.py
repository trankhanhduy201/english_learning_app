from abc import ABC, abstractmethod

from django_redis import get_redis_connection


class AbstractRedisRateLimiter(ABC):
    _INCREMENT_SCRIPT = """
    local current = redis.call('INCR', KEYS[1])
    if current == 1 then
        redis.call('EXPIRE', KEYS[1], ARGV[1])
    end
    return current
    """

    def __init__(self, *, redis_alias="default"):
        self._redis_alias = redis_alias
        self._redis_client = None
        self._increment_script = None

    @abstractmethod
    def get_limit_count(self):
        pass

    @abstractmethod
    def get_window_seconds(self):
        pass

    @abstractmethod
    def get_key_prefix(self):
        pass

    def get_rate_limit_key(self, subject_id):
        if subject_id is None:
            raise ValueError("subject_id is required.")
        return f"{self.get_key_prefix()}:{subject_id}"

    def get_redis_client(self):
        if self._redis_client is None:
            self._redis_client = get_redis_connection(self._redis_alias)
        return self._redis_client

    def get_increment_script(self):
        if self._increment_script is None:
            self._increment_script = self.get_redis_client().register_script(self._INCREMENT_SCRIPT)
        return self._increment_script

    def should_send(self, subject_id):
        current_count = int(
            self.get_increment_script()(
                keys=[self.get_rate_limit_key(subject_id)],
                args=[self.get_window_seconds()],
            )
        )
        return current_count <= self.get_limit_count()
