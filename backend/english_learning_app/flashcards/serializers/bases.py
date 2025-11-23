from django.db import IntegrityError
from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from rest_framework.relations import ManyRelatedField, MANY_RELATION_KWARGS


class CustomManyRelatedField(ManyRelatedField):
    def to_internal_value(self, data):
        if self.child_relation.queryset is None:
            return super().to_internal_value(data)

        if isinstance(data, str) or not hasattr(data, '__iter__'):
            self.fail('not_a_list', input_type=type(data).__name__)
        if not self.allow_empty and len(data) == 0:
            self.fail('empty')

        return [
            self.child_relation.to_internal_value(item)
            for item in self.child_relation.queryset.filter(pk__in=data)
        ]


class CustomPrimaryKeyRelatedField(serializers.PrimaryKeyRelatedField):
    @classmethod
    def many_init(cls, *args, **kwargs):
        list_kwargs = {'child_relation': cls(*args, **kwargs)}
        for key in kwargs:
            if key in MANY_RELATION_KWARGS:
                list_kwargs[key] = kwargs[key]
        return CustomManyRelatedField(**list_kwargs)

    def to_internal_value(self, data):
        if isinstance(data, self.queryset.model):
            return data
        return super().to_internal_value(data)


class BaseListSerializer(serializers.ListSerializer):
    def update(self, instances, validated_data):
        instance_hash = {index: instance for index, instance in enumerate(instances)}
        result = [
            self.child.update(instance_hash[index], attrs)
            for index, attrs in enumerate(validated_data)
        ]
        
        writable_fields = [
            x for x in self.child.Meta.fields
            if x not in self.child.Meta.read_only_fields
        ]
        try:
            self.child.Meta.model.objects.bulk_update(result, writable_fields)
        except IntegrityError as e:
            raise ValidationError(e)
        
        return result
    
    def create(self, validated_data):
        model_class = self.child.Meta.model
        instances = [model_class(**item) for item in validated_data]
        model_class.objects.bulk_create(instances)
        return instances


class BaseSerializer(serializers.ModelSerializer):
    class Meta:
        list_serializer_class = BaseListSerializer

    def get_fields(self):
        fields = super().get_fields()

        # Make fields read-only on update
        for name in getattr(self.Meta, "read_only_fields_on_update", []):
            if self.instance is not None and name in fields:
                fields[name].read_only = True

        return fields