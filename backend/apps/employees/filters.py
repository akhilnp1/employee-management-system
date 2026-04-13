import django_filters
from .models import Employee


class EmployeeFilter(django_filters.FilterSet):
    name = django_filters.CharFilter(method='filter_name')
    department = django_filters.CharFilter(lookup_expr='icontains')
    position = django_filters.CharFilter(lookup_expr='icontains')
    status = django_filters.ChoiceFilter(choices=Employee.STATUS_CHOICES)
    date_joined_from = django_filters.DateFilter(field_name='date_joined', lookup_expr='gte')
    date_joined_to = django_filters.DateFilter(field_name='date_joined', lookup_expr='lte')
    form = django_filters.NumberFilter(field_name='form__id')
    dynamic_field = django_filters.CharFilter(method='filter_dynamic_field')
    dynamic_value = django_filters.CharFilter(method='filter_dynamic_value')

    class Meta:
        model = Employee
        fields = ['department', 'position', 'status', 'form']

    def filter_name(self, queryset, name, value):
        from django.db.models import Q
        return queryset.filter(
            Q(first_name__icontains=value) | Q(last_name__icontains=value)
        )

    def filter_dynamic_field(self, queryset, name, value):
        # Store field name for combined dynamic filtering
        self._dynamic_field = value
        return queryset

    def filter_dynamic_value(self, queryset, name, value):
        field = getattr(self, '_dynamic_field', None)
        if field and value:
            return queryset.filter(**{f'dynamic_data__{field}__icontains': value})
        return queryset
