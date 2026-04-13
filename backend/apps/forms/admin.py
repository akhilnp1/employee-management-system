from django.contrib import admin
from .models import EmployeeForm, FormField


class FormFieldInline(admin.TabularInline):
    model = FormField
    extra = 1


@admin.register(EmployeeForm)
class EmployeeFormAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_by', 'is_active', 'created_at')
    inlines = [FormFieldInline]


@admin.register(FormField)
class FormFieldAdmin(admin.ModelAdmin):
    list_display = ('label', 'form', 'field_type', 'is_required', 'order')
