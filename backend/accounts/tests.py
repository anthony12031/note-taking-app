from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()


class RegistrationAPITests(APITestCase):
    def setUp(self):
        self.url = reverse('register')

    def test_successful_registration_returns_201_user_and_tokens(self):
        payload = {'email': 'new@example.com', 'password': 'securepass123'}
        response = self.client.post(self.url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        data = response.json()
        self.assertIn('user', data)
        self.assertEqual(data['user']['email'], 'new@example.com')
        self.assertIn('id', data['user'])
        self.assertIn('access', data)
        self.assertIn('refresh', data)
        self.assertTrue(data['access'])
        self.assertTrue(data['refresh'])
        self.assertTrue(User.objects.filter(email='new@example.com').exists())

    def test_duplicate_email_returns_400(self):
        User.objects.create_user(username='taken@example.com', email='taken@example.com', password='password123')
        response = self.client.post(
            self.url,
            {'email': 'taken@example.com', 'password': 'anotherpwd12'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_password_too_short_returns_400(self):
        response = self.client.post(
            self.url,
            {'email': 'shortpw@example.com', 'password': 'short'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_missing_fields_return_400(self):
        self.assertEqual(
            self.client.post(self.url, {}, format='json').status_code,
            status.HTTP_400_BAD_REQUEST,
        )
        self.assertEqual(
            self.client.post(self.url, {'email': 'only@example.com'}, format='json').status_code,
            status.HTTP_400_BAD_REQUEST,
        )
        self.assertEqual(
            self.client.post(self.url, {'password': 'onlypassword123'}, format='json').status_code,
            status.HTTP_400_BAD_REQUEST,
        )


class LoginAPITests(APITestCase):
    def setUp(self):
        self.url = reverse('login')
        self.email = 'login@example.com'
        self.password = 'loginpass123'
        User.objects.create_user(username=self.email, email=self.email, password=self.password)

    def test_successful_login_returns_tokens(self):
        response = self.client.post(
            self.url,
            {'username': self.email, 'password': self.password},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertIn('access', data)
        self.assertIn('refresh', data)
        self.assertTrue(data['access'])

    def test_wrong_password_returns_401(self):
        response = self.client.post(
            self.url,
            {'username': self.email, 'password': 'wrongpassword'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_nonexistent_user_returns_401(self):
        response = self.client.post(
            self.url,
            {'username': 'nobody@example.com', 'password': 'somepassword123'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
