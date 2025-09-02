from django.db import IntegrityError
from rest_framework import serializers
from rest_framework.exceptions import ValidationError


class InstancePrimaryKeyRelatedField(serializers.PrimaryKeyRelatedField):
    # PrimaryKeyRelatedField
    # SlugRelatedField
    # StringRelatedField
    # HyperlinkedRelatedField
    # SerializerMethodField
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