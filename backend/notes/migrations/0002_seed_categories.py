from django.db import migrations


def seed_categories(apps, schema_editor):
    Category = apps.get_model('notes', 'Category')
    rows = [
        ('Random Thoughts', '#E07C4F', '#F5D6C3'),
        ('School', '#C4B44E', '#E8DDB5'),
        ('Personal', '#7A9B5E', '#C8D5B9'),
        ('Drama', '#D4A574', '#F0DCC8'),
    ]
    for name, color, bg_color in rows:
        Category.objects.get_or_create(
            name=name,
            defaults={'color': color, 'bg_color': bg_color},
        )


def unseed_categories(apps, schema_editor):
    Category = apps.get_model('notes', 'Category')
    Category.objects.filter(
        name__in=[
            'Random Thoughts',
            'School',
            'Personal',
            'Drama',
        ],
    ).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('notes', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(seed_categories, unseed_categories),
    ]
