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
    def get_delete_field_name(self):
        return 'is_remove'

    # def run_child_validation(self, data):
    #     for item in self.child.Meta.model.objects.all():
    #         if 'id' in data and item.pk == data['id']:
    #             self.child.instance = item
    #             self.child.initial_data = data
    #             break
    #     return self.child.run_validation(data)

    def update(self, instances, validated_data):
        # instance_hash = {index: instance for index, instance in enumerate(instances)}
        # result = [
        #     self.child.update(instance_hash[index], attrs)
        #     for index, attrs in enumerate(validated_data)
        # ]
        updating_data = []
        if isinstance(validated_data, list) and len(validated_data) > 0:
            """
            There are some ways to get items
            1. self.child.Meta.fields.items() -> List[str]
            2. self.child.get_fields() -> Dict(<key>:<field>)
            """
            read_only_fields = getattr(self.child.Meta, 'read_only_fields', [])
            writable_fields = [
                name for name, field in self.child.get_fields().items()
                if name not in read_only_fields and not getattr(field, 'read_only', False)
            ]
            
            delete_field_name = self.get_delete_field_name()
            has_delete_field_db = delete_field_name in [
                field.name for field in self.child.Meta.model._meta.get_fields()
            ]

            enable_delete = False
            if not has_delete_field_db and delete_field_name in writable_fields:
                idx = next((index for index, item in enumerate(writable_fields) if item == delete_field_name), None)
                writable_fields.pop(idx)
                enable_delete = True
                
            delete_ids = []
            instance_hash = {instance.pk: instance for index, instance in enumerate(instances)}
            for data in self.initial_data:
                new_data = {'id': data['id'] if 'id' in data else None}
                for key, value in data.items():
                    if enable_delete and key == delete_field_name and value:
                        delete_ids.append(new_data['id'])
                    if key in writable_fields:
                        new_data[key] = value
                    
                child_instance = instance_hash[new_data['id']]
                child_instance.__dict__.update(new_data)
                updating_data.append(child_instance)

            try:
                self.child.Meta.model.objects.bulk_update(updating_data, writable_fields)
                self.child.Meta.model.objects.bulk_delete(delete_ids)
            except IntegrityError as e:
                raise ValidationError(e)
            
        return updating_data
    
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