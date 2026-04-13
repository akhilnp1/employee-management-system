from django.db import models
from django.conf import settings


FIELD_TYPES = [
    ('text', 'Text'),
    ('number', 'Number'),
    ('email', 'Email'),
    ('password', 'Password'),
    ('date', 'Date'),
    ('datetime', 'DateTime'),
    ('textarea', 'Textarea'),
    ('select', 'Select'),
    ('checkbox', 'Checkbox'),
    ('radio', 'Radio'),
    ('file', 'File'),
    ('phone', 'Phone'),
    ('url', 'URL'),
]


class EmployeeForm(models.Model):
    """Dynamic form template for employee data collection"""
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='created_forms'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name


class FormField(models.Model):
    """Individual field within a dynamic form"""
    form = models.ForeignKey(EmployeeForm, on_delete=models.CASCADE, related_name='fields')
    label = models.CharField(max_length=200)
    field_name = models.CharField(max_length=100)
    field_type = models.CharField(max_length=50, choices=FIELD_TYPES, default='text')
    placeholder = models.CharField(max_length=200, blank=True, null=True)
    help_text = models.CharField(max_length=300, blank=True, null=True)
    is_required = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)
    options = models.JSONField(default=list, blank=True)  # For select/radio/checkbox
    default_value = models.CharField(max_length=500, blank=True, null=True)
    validation_rules = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.form.name} - {self.label}"
