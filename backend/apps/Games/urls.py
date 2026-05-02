from django.urls import path

from .views import GameCreateView, GameDeleteView, GameDetailView, GameListView


urlpatterns = [
    path("save/", GameCreateView.as_view(), name="games-save"),
    path("list/", GameListView.as_view(), name="games-list"),
    path("<int:id>/single/", GameDetailView.as_view(), name="games-single"),
    path("<int:id>/", GameDetailView.as_view(), name="games-detail"),
    path("<int:id>/delete/", GameDeleteView.as_view(), name="games-delete"),
]
