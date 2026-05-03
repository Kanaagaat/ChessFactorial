from rest_framework import generics, permissions

from .models import Game
from .serializers import GameSerializer


class GameCreateView(generics.CreateAPIView):
    serializer_class = GameSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        game = serializer.save(user=self.request.user)
        user = self.request.user
        if game.mode == "ai":
            user.games_played += 1
            if game.result == Game.RESULT_WIN:
                user.games_won += 1
            user.save(update_fields=["games_played", "games_won"])


class GameListView(generics.ListAPIView):
    serializer_class = GameSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Game.objects.filter(user=self.request.user).order_by("-created_at")


class GameDetailView(generics.RetrieveAPIView):
    serializer_class = GameSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = "id"

    def get_queryset(self):
        return Game.objects.filter(user=self.request.user)


class GameDeleteView(generics.DestroyAPIView):
    serializer_class = GameSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = "id"

    def get_queryset(self):
        return Game.objects.filter(user=self.request.user)
