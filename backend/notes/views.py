from django.db.models import Count, Q
from rest_framework import mixins, viewsets
from rest_framework.permissions import IsAuthenticated

from .models import Category, Note
from .serializers import CategorySerializer, NoteSerializer


class CategoryViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Category.objects.annotate(
            note_count=Count('notes', filter=Q(notes__user=self.request.user)),
        ).order_by('name')


class NoteViewSet(viewsets.ModelViewSet):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Note.objects.filter(user=self.request.user).select_related('category')

    def perform_create(self, serializer):
        category = serializer.validated_data.get('category')
        if category is None:
            category = Category.objects.order_by('id').first()
        serializer.save(user=self.request.user, category=category)
