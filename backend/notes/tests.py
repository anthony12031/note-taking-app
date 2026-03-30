from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Category, Note

User = get_user_model()

SEEDED_CATEGORY_NAMES = frozenset({'Random Thoughts', 'School', 'Personal', 'Drama'})


class CategoryAPITests(APITestCase):
    def setUp(self):
        self.url = reverse('category-list')
        self.user = User.objects.create_user(
            username='cat@example.com',
            email='cat@example.com',
            password='testpass123',
        )
        self.other = User.objects.create_user(
            username='other@example.com',
            email='other@example.com',
            password='testpass123',
        )
        self.categories = list(Category.objects.order_by('id'))
        self.assertEqual(len(self.categories), 4)

    def _auth(self, user):
        token_url = reverse('login')
        r = self.client.post(
            token_url,
            {'username': user.email, 'password': 'testpass123'},
            format='json',
        )
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        access = r.json()['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access}')

    def test_list_categories_returns_four_seeded_with_note_count(self):
        self._auth(self.user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        rows = response.json()
        self.assertEqual(len(rows), 4)
        names = {row['name'] for row in rows}
        self.assertEqual(names, SEEDED_CATEGORY_NAMES)
        for row in rows:
            self.assertIn('note_count', row)
            self.assertIsInstance(row['note_count'], int)

    def test_note_count_only_includes_requesting_users_notes(self):
        drama = Category.objects.get(name='Drama')
        school = Category.objects.get(name='School')
        Note.objects.create(user=self.user, category=drama, title='Mine', body='')
        Note.objects.create(user=self.user, category=school, title='Mine2', body='')
        Note.objects.create(user=self.other, category=drama, title='Theirs', body='')

        self._auth(self.user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        by_name = {row['name']: row['note_count'] for row in response.json()}
        self.assertEqual(by_name['Drama'], 1)
        self.assertEqual(by_name['School'], 1)
        self.assertEqual(by_name['Random Thoughts'], 0)
        self.assertEqual(by_name['Personal'], 0)

        self.client.credentials()
        self._auth(self.other)
        response = self.client.get(self.url)
        by_name_other = {row['name']: row['note_count'] for row in response.json()}
        self.assertEqual(by_name_other['Drama'], 1)
        self.assertEqual(by_name_other['School'], 0)

    def test_unauthenticated_list_categories_returns_401(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class NoteAPITests(APITestCase):
    def setUp(self):
        self.list_url = reverse('note-list')
        self.user = User.objects.create_user(
            username='notes@example.com',
            email='notes@example.com',
            password='notespass123',
        )
        self.other = User.objects.create_user(
            username='othernotes@example.com',
            email='othernotes@example.com',
            password='notespass123',
        )
        self.first_category = Category.objects.order_by('id').first()
        self.school = Category.objects.get(name='School')
        self.personal = Category.objects.get(name='Personal')
        self.assertIsNotNone(self.first_category)

    def _auth(self, user, password='notespass123'):
        r = self.client.post(
            reverse('login'),
            {'username': user.email, 'password': password},
            format='json',
        )
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {r.json()['access']}")

    def test_create_note_with_category_returns_201_and_nested_category(self):
        self._auth(self.user)
        response = self.client.post(
            self.list_url,
            {'title': 'T', 'body': 'B', 'category': self.school.id},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        data = response.json()
        self.assertEqual(data['title'], 'T')
        self.assertEqual(data['body'], 'B')
        self.assertIsInstance(data['category'], dict)
        self.assertEqual(data['category']['id'], self.school.id)
        self.assertEqual(data['category']['name'], 'School')

    def test_create_note_without_category_defaults_to_first_category_by_id(self):
        self._auth(self.user)
        response = self.client.post(
            self.list_url,
            {'title': 'No cat', 'body': ''},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        data = response.json()
        self.assertIsNotNone(data['category'])
        self.assertEqual(data['category']['id'], self.first_category.id)

    def test_list_notes_only_own(self):
        self._auth(self.user)
        self.client.post(
            self.list_url,
            {'title': 'Mine', 'body': '', 'category': self.school.id},
            format='json',
        )
        self.client.credentials()
        self._auth(self.other, password='notespass123')
        self.client.post(
            self.list_url,
            {'title': 'Theirs', 'body': '', 'category': self.personal.id},
            format='json',
        )
        self.client.credentials()
        self._auth(self.user)
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        titles = {row['title'] for row in response.json()}
        self.assertEqual(titles, {'Mine'})

    def test_retrieve_note_nested_category(self):
        self._auth(self.user)
        create = self.client.post(
            self.list_url,
            {'title': 'One', 'body': 'Body text', 'category': self.personal.id},
            format='json',
        )
        note_id = create.json()['id']
        detail_url = reverse('note-detail', kwargs={'pk': note_id})
        response = self.client.get(detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(data['title'], 'One')
        self.assertEqual(data['body'], 'Body text')
        self.assertEqual(data['category']['name'], 'Personal')

    def test_update_note_title_body_category(self):
        self._auth(self.user)
        create = self.client.post(
            self.list_url,
            {'title': 'Old', 'body': 'Old body', 'category': self.school.id},
            format='json',
        )
        note_id = create.json()['id']
        detail_url = reverse('note-detail', kwargs={'pk': note_id})
        response = self.client.patch(
            detail_url,
            {'title': 'New', 'body': 'New body', 'category': self.personal.id},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(data['title'], 'New')
        self.assertEqual(data['body'], 'New body')
        self.assertEqual(data['category']['id'], self.personal.id)
        note = Note.objects.get(pk=note_id)
        self.assertEqual(note.title, 'New')
        self.assertEqual(note.category_id, self.personal.id)

    def test_delete_note_returns_204_and_removes_note(self):
        self._auth(self.user)
        create = self.client.post(
            self.list_url,
            {'title': 'Delete me', 'body': '', 'category': self.school.id},
            format='json',
        )
        note_id = create.json()['id']
        detail_url = reverse('note-detail', kwargs={'pk': note_id})
        response = self.client.delete(detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Note.objects.filter(pk=note_id).exists())

    def test_cannot_access_other_users_note_returns_404(self):
        other_note = Note.objects.create(
            user=self.other,
            category=self.school,
            title='Secret',
            body='',
        )
        self._auth(self.user)
        detail_url = reverse('note-detail', kwargs={'pk': other_note.pk})
        self.assertEqual(self.client.get(detail_url).status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(self.client.patch(detail_url, {'title': 'X'}, format='json').status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(self.client.delete(detail_url).status_code, status.HTTP_404_NOT_FOUND)

    def test_unauthenticated_note_requests_return_401(self):
        self.assertEqual(self.client.get(self.list_url).status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(
            self.client.post(self.list_url, {'title': 'N', 'body': ''}, format='json').status_code,
            status.HTTP_401_UNAUTHORIZED,
        )
