from rest_framework import serializers
from .models import EmployeeForm, FormField


class FormFieldSerializer(serializers.ModelSerializer):
    class Meta:
        model = FormField
        fields = ('id', 'label', 'field_name', 'field_type', 'placeholder',
                  'help_text', 'is_required', 'order', 'options', 'default_value',
                  'validation_rules')


class EmployeeFormSerializer(serializers.ModelSerializer):
    fields = FormFieldSerializer(many=True, read_only=True)
    created_by_name = serializers.SerializerMethodField()

    class Meta:
        model = EmployeeForm
        fields = ('id', 'name', 'description', 'fields', 'created_by',
                  'created_by_name', 'created_at', 'updated_at', 'is_active')
        read_only_fields = ('id', 'created_by', 'created_at', 'updated_at')

    def get_created_by_name(self, obj):
        return obj.created_by.get_full_name() or obj.created_by.email


class EmployeeFormCreateSerializer(serializers.ModelSerializer):
    fields = FormFieldSerializer(many=True)

    class Meta:
        model = EmployeeForm
        fields = ('id', 'name', 'description', 'fields', 'is_active')
        read_only_fields = ('id',)

    def create(self, validated_data):
        fields_data = validated_data.pop('fields', [])
        form = EmployeeForm.objects.create(**validated_data)
        for i, field_data in enumerate(fields_data):
            field_data['order'] = field_data.get('order', i)
            FormField.objects.create(form=form, **field_data)
        return form

    def update(self, instance, validated_data):
        fields_data = validated_data.pop('fields', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if fields_data is not None:
            instance.fields.all().delete()
            for i, field_data in enumerate(fields_data):
                field_data['order'] = field_data.get('order', i)
                FormField.objects.create(form=instance, **field_data)

        return instance


class EmployeeFormListSerializer(serializers.ModelSerializer):
    field_count = serializers.SerializerMethodField()
    created_by_name = serializers.SerializerMethodField()

    class Meta:
        model = EmployeeForm
        fields = ('id', 'name', 'description', 'field_count', 'created_by_name',
                  'created_at', 'updated_at', 'is_active')

    def get_field_count(self, obj):
        return obj.fields.count()

    def get_created_by_name(self, obj):
        return obj.created_by.get_full_name() or obj.created_by.email
