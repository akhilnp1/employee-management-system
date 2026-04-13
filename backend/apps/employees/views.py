from rest_framework import viewsets, permissions, status, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count
from .models import Employee
from .serializers import EmployeeSerializer, EmployeeListSerializer, EmployeeCreateSerializer
from .filters import EmployeeFilter


class EmployeeViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = EmployeeFilter
    search_fields = ['first_name', 'last_name', 'email', 'department', 'position']
    ordering_fields = ['first_name', 'last_name', 'created_at', 'date_joined', 'department']
    ordering = ['-created_at']

    def get_queryset(self):
        return Employee.objects.select_related('form', 'created_by').all()

    def get_serializer_class(self):
        if self.action == 'list':
            return EmployeeListSerializer
        if self.action in ['create', 'update', 'partial_update']:
            return EmployeeCreateSerializer
        return EmployeeSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        total = Employee.objects.count()
        active = Employee.objects.filter(status='active').count()
        inactive = Employee.objects.filter(status='inactive').count()
        on_leave = Employee.objects.filter(status='on_leave').count()
        terminated = Employee.objects.filter(status='terminated').count()
        by_department = (
            Employee.objects.values('department')
            .annotate(count=Count('id'))
            .order_by('-count')[:5]
        )
        return Response({
            'total': total,
            'active': active,
            'inactive': inactive,
            'on_leave': on_leave,
            'terminated': terminated,
            'by_department': list(by_department),
        })

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return Response({'message': 'Employee deleted successfully.'}, status=status.HTTP_200_OK)
