from rest_framework import serializers

from .models import Category, Note


class CategorySerializer(serializers.ModelSerializer):
    note_count = serializers.IntegerField(read_only=True, default=0)

    class Meta:
        model = Category
        fields = ['id', 'name', 'color', 'bg_color', 'note_count']


class NoteSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    category = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Note
        fields = ['id', 'user', 'category', 'title', 'body', 'created_at', 'updated_at']
        read_only_fields = ['user', 'created_at', 'updated_at']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.category:
            data['category'] = CategorySerializer(instance.category).data
        else:
            data['category'] = None
        return data
