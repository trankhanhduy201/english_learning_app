

class OwnerMixin():
    def with_owner(self):
        return self.select_related(
            'created_by',
            'created_by__profile'
        )
