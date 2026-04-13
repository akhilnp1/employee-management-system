from rest_framework import serializers
from .models import Employee
from apps.forms.serializers import EmployeeFormSerializer


class EmployeeSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    form_details = EmployeeFormSerializer(source='form', read_only=True)
    created_by_name = serializers.SerializerMethodField()

    class Meta:
        model = Employee
        fields = (
            'id', 'form', 'form_details', 'first_name', 'last_name', 'full_name',
            'email', 'phone', 'department', 'position', 'status',
            'date_joined', 'avatar', 'dynamic_data',
            'created_by', 'created_by_name', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'created_by', 'created_at', 'updated_at')

    def get_created_by_name(self, obj):
        if obj.created_by:
            return obj.created_by.get_full_name() or obj.created_by.email
        return None


class EmployeeListSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    form_name = serializers.SerializerMethodField()

    class Meta:
        model = Employee
        fields = (
            'id', 'first_name', 'last_name', 'full_name', 'email',
            'phone', 'department', 'position', 'status',
            'date_joined', 'avatar', 'form_name', 'dynamic_data', 'created_at'
        )

    def get_form_name(self, obj):
        return obj.form.name if obj.form else None


class EmployeeCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = (
            'id', 'form', 'first_name', 'last_name', 'email', 'phone',
            'department', 'position', 'status', 'date_joined', 'avatar', 'dynamic_data'
        )
        read_only_fields = ('id',)
