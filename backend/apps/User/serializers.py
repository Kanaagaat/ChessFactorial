from django.contrib.auth import get_user_model
from rest_framework import serializers


User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8, required=True)
    rating = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "city",
            "games_won",
            "games_played",
            "rating",
            "password",
        )
        read_only_fields = ("id", "games_won", "games_played", "rating")

    def get_rating(self, obj):
        return 1200 + obj.games_won * 10 - max(obj.games_played - obj.games_won, 0) * 2

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

from .models import Friendship

class FriendshipSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    receiver = UserSerializer(read_only=True)

    class Meta:
        model = Friendship
        fields = ("id", "sender", "receiver", "status", "created_at")
