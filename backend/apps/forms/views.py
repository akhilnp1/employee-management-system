from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import EmployeeForm, FormField
from .serializers import (
    EmployeeFormSerializer, EmployeeFormCreateSerializer,
    EmployeeFormListSerializer, FormFieldSerializer
)


class EmployeeFormViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return EmployeeForm.objects.filter(is_active=True).prefetch_related('fields')

    def get_serializer_class(self):
        if self.action == 'list':
            return EmployeeFormListSerializer
        if self.action in ['create', 'update', 'partial_update']:
            return EmployeeFormCreateSerializer
        return EmployeeFormSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['get'])
    def with_fields(self, request, pk=None):
        form = self.get_object()
        serializer = EmployeeFormSerializer(form)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def active(self, request):
        forms = EmployeeForm.objects.filter(is_active=True)
        serializer = EmployeeFormListSerializer(forms, many=True)
        return Response(serializer.data)
