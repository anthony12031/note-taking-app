from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import CategoryViewSet, NoteViewSet

router = DefaultRouter()
router.register('categories', CategoryViewSet, basename='category')
router.register('notes', NoteViewSet, basename='note')

urlpatterns = [
    path('', include(router.urls)),
]
