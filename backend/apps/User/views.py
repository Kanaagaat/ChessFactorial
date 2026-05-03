from django.contrib.auth import get_user_model
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import UserSerializer


User = get_user_model()


class EmailOrUsernameTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        login_value = attrs.get(self.username_field, "")
        if login_value and "@" in login_value:
            try:
                user = User.objects.get(email__iexact=login_value)
                attrs[self.username_field] = user.get_username()
            except User.DoesNotExist:
                pass
        return super().validate(attrs)


class EmailOrUsernameTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailOrUsernameTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "user": UserSerializer(user).data,
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            },
            status=status.HTTP_201_CREATED,
        )


class MeView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

from django.db.models import Q
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Friendship
from .serializers import FriendshipSerializer

class FriendListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        friendships = Friendship.objects.filter(
            (Q(sender=user) | Q(receiver=user)), 
            status='ACCEPTED'
        )
        friend_ids = [f.receiver.id if f.sender == user else f.sender.id for f in friendships]
        return User.objects.filter(id__in=friend_ids)

class PendingRequestsView(generics.ListAPIView):
    serializer_class = FriendshipSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Friendship.objects.filter(receiver=self.request.user, status='PENDING')

class SendFriendRequestView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        username = request.data.get('username')
        if not username:
            return Response({"error": "Username required"}, status=status.HTTP_400_BAD_REQUEST)
        if username == request.user.username:
            return Response({"error": "Cannot friend yourself"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            receiver = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        existing = Friendship.objects.filter(
            Q(sender=request.user, receiver=receiver) | Q(sender=receiver, receiver=request.user)
        ).first()

        if existing and existing.status in ['PENDING', 'ACCEPTED']:
            return Response({"error": "Friendship or request already exists"}, status=status.HTTP_400_BAD_REQUEST)

        if existing and existing.status == 'REJECTED':
            existing.sender = request.user
            existing.receiver = receiver
            existing.status = 'PENDING'
            existing.save()
            friendship = existing
        else:
            friendship = Friendship.objects.create(sender=request.user, receiver=receiver, status='PENDING')

        from channels.layers import get_channel_layer
        from asgiref.sync import async_to_sync
        channel_layer = get_channel_layer()
        if channel_layer:
            async_to_sync(channel_layer.group_send)(
                f"user_{receiver.id}",
                {
                    "type": "notification",
                    "notification_type": "friend_request_received",
                    "data": {
                        "sender_username": request.user.username,
                        "sender_id": request.user.id,
                        "request_id": friendship.id,
                    }
                }
            )

        return Response({"status": "Request sent"}, status=status.HTTP_201_CREATED)

class AcceptFriendRequestView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk=None):
        request_id = pk or request.data.get('request_id')
        friendship = get_object_or_404(Friendship, pk=request_id, receiver=request.user, status='PENDING')
        friendship.status = 'ACCEPTED'
        friendship.save()
        
        from channels.layers import get_channel_layer
        from asgiref.sync import async_to_sync
        channel_layer = get_channel_layer()
        if channel_layer:
            async_to_sync(channel_layer.group_send)(
                f"user_{friendship.sender.id}",
                {
                    "type": "notification",
                    "notification_type": "friend_request_accepted",
                    "data": {
                        "accepter_username": request.user.username,
                        "accepter_id": request.user.id,
                    }
                }
            )
        return Response({"status": "Accepted"})

class RejectFriendRequestView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk=None):
        request_id = pk or request.data.get('request_id')
        friendship = get_object_or_404(Friendship, pk=request_id, status='PENDING')
        if friendship.receiver == request.user:
            friendship.status = 'REJECTED'
            friendship.save()
            recipient_id = friendship.sender.id
            notification_type = 'friend_request_rejected'
        elif friendship.sender == request.user:
            friendship.delete()
            recipient_id = friendship.receiver.id
            notification_type = 'friend_request_cancelled'
        else:
            return Response({"error": "Not authorized"}, status=status.HTTP_403_FORBIDDEN)

        from channels.layers import get_channel_layer
        from asgiref.sync import async_to_sync
        channel_layer = get_channel_layer()
        if channel_layer:
            async_to_sync(channel_layer.group_send)(
                f"user_{recipient_id}",
                {
                    "type": "notification",
                    "notification_type": notification_type,
                    "data": {
                        "request_id": request_id,
                        "sender_username": request.user.username,
                        "sender_id": request.user.id,
                    }
                }
            )

        return Response({"status": "Rejected"})

class SendGameInviteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        receiver_username = request.data.get('username')
        game_config = request.data.get('gameConfig', {})
        game_id = request.data.get('gameId')

        if not receiver_username or not game_id:
            return Response({"error": "Missing username or gameId"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            receiver = User.objects.get(username=receiver_username)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        from channels.layers import get_channel_layer
        from asgiref.sync import async_to_sync
        channel_layer = get_channel_layer()
        if channel_layer:
            async_to_sync(channel_layer.group_send)(
                f"user_{receiver.id}",
                {
                    "type": "notification",
                    "notification_type": "game_invite_received",
                    "data": {
                        "sender_username": request.user.username,
                        "sender_id": request.user.id,
                        "game_id": game_id,
                        "game_config": game_config,
                    }
                }
            )

        return Response({"status": "Invite sent"})

class SearchUsersView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        query = self.request.query_params.get('q', '').strip()
        qs = User.objects.exclude(id=self.request.user.id)
        if query:
            qs = qs.filter(username__icontains=query)
        return qs.order_by('username')[:20]
