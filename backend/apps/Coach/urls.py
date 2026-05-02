from django.urls import path

from .views import AnalyzeGameView


urlpatterns = [
    path("games/<int:id>/analyse/", AnalyzeGameView.as_view(), name="coach-analyze"),
]
