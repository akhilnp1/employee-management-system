from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EmployeeFormViewSet

router = DefaultRouter()
router.register('', EmployeeFormViewSet, basename='forms')

urlpatterns = [
    path('', include(router.urls)),
]
