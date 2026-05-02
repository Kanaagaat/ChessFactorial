from rest_framework import serializers

from .models import Game


class GameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = ("id", "user", "pgn", "result", "mode", "ai_level", "created_at", "analysis")
        read_only_fields = ("id", "user", "created_at", "analysis")
