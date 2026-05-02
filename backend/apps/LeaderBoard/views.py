from django.contrib.auth import get_user_model
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView


User = get_user_model()


class LeaderboardTopView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        city = request.query_params.get("city")
        queryset = User.objects.all()
        if city:
            queryset = queryset.filter(city=city)
        rows = queryset.order_by("-games_won", "-games_played")[:20]
        data = [
            {
                "username": row.username,
                "city": row.city,
                "games_won": row.games_won,
                "games_played": row.games_played,
            }
            for row in rows
        ]
        return Response(data)
