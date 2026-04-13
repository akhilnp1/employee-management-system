from django.contrib import admin
from .models import Employee


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'email', 'department', 'position', 'status', 'date_joined')
    list_filter = ('status', 'department')
    search_fields = ('first_name', 'last_name', 'email', 'department')
    readonly_fields = ('created_at', 'updated_at')
