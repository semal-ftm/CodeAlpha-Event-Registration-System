from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView
)
from .views import (
    EventListAPIView,
    EventDetailAPIView,
    RegistrationCreateAPIView,
    MyRegistrationsAPIView,
    RegistrationDeleteAPIView,
    UserRegistrationAPIView
)

urlpatterns = [
    path(
        'events/',
        EventListAPIView.as_view(),
        name='event-list'
    ),

    path(
        'events/<int:pk>/',
        EventDetailAPIView.as_view(),
        name='event-detail'
    ),

    path(
        'registrations/',
        RegistrationCreateAPIView.as_view(),
        name='registration-create'
    ),

    path(
        'my-registrations/',
        MyRegistrationsAPIView.as_view(),
        name='my-registrations'
    ),

    path(
        'registrations/<int:pk>/cancel/',
        RegistrationDeleteAPIView.as_view(),
        name='registration-cancel'
    ),

    path(
    'auth/register/',
    UserRegistrationAPIView.as_view(),
    name='user-register'
    ),

    path(
    'auth/login/',
    TokenObtainPairView.as_view(),
    name='token-login'
    ),

    path(
    'auth/token/refresh/',
    TokenRefreshView.as_view(),
    name='token-refresh'
    ), 
]