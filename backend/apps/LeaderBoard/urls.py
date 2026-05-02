from django.urls import path

from .views import LeaderboardTopView


urlpatterns = [
    path("top/", LeaderboardTopView.as_view(), name="leaderboard-top"),
]
