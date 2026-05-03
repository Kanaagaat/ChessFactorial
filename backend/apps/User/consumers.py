import json
from channels.generic.websocket import AsyncWebsocketConsumer

class GlobalUserConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope.get("user")
        if not self.user or self.user.is_anonymous:
            await self.close()
            return
            
        self.room_group_name = f"user_{self.user.id}"
        
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, "room_group_name"):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        # We can handle messages from client here if needed
        pass

    async def notification(self, event):
        await self.send(text_data=json.dumps({
            "type": event.get("notification_type"),
            "data": event.get("data", {})
        }))
