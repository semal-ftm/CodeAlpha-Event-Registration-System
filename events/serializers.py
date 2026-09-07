from django.contrib.auth.models import User

from rest_framework import serializers
from .models import Event, Registration


class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = '__all__'


class RegistrationSerializer(serializers.ModelSerializer):
    username = serializers.CharField(
        source='user.username',
        read_only=True
    )

    event_title = serializers.CharField(
        source='event.title',
        read_only=True
    )

    class Meta:
        model = Registration
        fields = [
            'id',
            'user',
            'username',
            'event',
            'event_title',
            'registered_at'
        ]

        read_only_fields = [
            'user',
            'registered_at'
        ]

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        min_length=6
    )

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'password'
        ]

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )

        return user