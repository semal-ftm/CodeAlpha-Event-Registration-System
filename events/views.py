from rest_framework.generics import (
    ListAPIView,
    RetrieveAPIView,
    CreateAPIView,
    DestroyAPIView
)

from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError

from .models import Event, Registration
from .serializers import (
    EventSerializer,
    RegistrationSerializer,
    UserRegistrationSerializer
)


class EventListAPIView(ListAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer


class EventDetailAPIView(RetrieveAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer


class RegistrationCreateAPIView(CreateAPIView):
    queryset = Registration.objects.all()
    serializer_class = RegistrationSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        event = serializer.validated_data['event']
        user = self.request.user

        # Prevent duplicate registration
        if Registration.objects.filter(
            user=user,
            event=event
        ).exists():
            raise ValidationError(
                {"error": "You are already registered for this event."}
            )

        # Check event capacity
        current_registrations = Registration.objects.filter(
            event=event
        ).count()

        if current_registrations >= event.capacity:
            raise ValidationError(
                {"error": "This event is full."}
            )

        serializer.save(user=user)


class MyRegistrationsAPIView(ListAPIView):
    serializer_class = RegistrationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Registration.objects.filter(
            user=self.request.user
        )


class RegistrationDeleteAPIView(DestroyAPIView):
    serializer_class = RegistrationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Registration.objects.filter(
            user=self.request.user
        )


class UserRegistrationAPIView(CreateAPIView):
    serializer_class = UserRegistrationSerializer
    permission_classes = []