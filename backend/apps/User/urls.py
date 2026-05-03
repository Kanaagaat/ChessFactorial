from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    EmailOrUsernameTokenObtainPairView, 
    MeView, 
    RegisterView,
    FriendListView,
    PendingRequestsView,
    SendFriendRequestView,
    AcceptFriendRequestView,
    RejectFriendRequestView,
    SearchUsersView,
    SendGameInviteView
)

urlpatterns = [
    path("register/", RegisterView.as_view(), name="auth-register"),
    path("token/", EmailOrUsernameTokenObtainPairView.as_view(), name="token-obtain"),
    path("token/login/", EmailOrUsernameTokenObtainPairView.as_view(), name="token-login"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("me/", MeView.as_view(), name="auth-me"),
    path("friends/", FriendListView.as_view(), name="friend-list"),
    path("friends/requests/", PendingRequestsView.as_view(), name="friend-requests"),
    path("friends/send/", SendFriendRequestView.as_view(), name="friend-send"),
    path("friends/accept/", AcceptFriendRequestView.as_view(), name="friend-accept"),
    path("friends/accept/<int:pk>/", AcceptFriendRequestView.as_view()),
    path("friends/reject/", RejectFriendRequestView.as_view(), name="friend-reject"),
    path("friends/reject/<int:pk>/", RejectFriendRequestView.as_view()),
    path("users/search/", SearchUsersView.as_view(), name="user-search"),
    path("game/invite/", SendGameInviteView.as_view(), name="game-invite"),
]
