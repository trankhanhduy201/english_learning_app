

class OwnerMixin():
    def with_owner(self):
        return self.select_related(
            'created_by'
        )

    def with_owner_profile(self):
        return self.select_related(
            'created_by__profile'
        )
