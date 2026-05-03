"""
ASGI config for chess_api project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/6.0/howto/deployment/asgi/
"""

import os

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "chess_api.settings")
django_asgi_app = get_asgi_application()

from chess_api.middleware import JWTAuthMiddlewareStack
import chess_api.routing

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": JWTAuthMiddlewareStack(
        URLRouter(
            chess_api.routing.websocket_urlpatterns
        )
    ),
})
