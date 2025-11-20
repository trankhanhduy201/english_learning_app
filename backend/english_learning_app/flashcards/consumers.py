import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async


class NotificationConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        from flashcards.services.users import UserSignatureService
        self.user_signature_service = UserSignatureService()

    @database_sync_to_async
    def validate(self, sign_user_id):
        try:
            parts = sign_user_id.strip().split(':')
            if len(parts) != 2:
                raise Exception('Invalid format of sign_user_id')
            
            user_id, signature = parts
            self.user_signature_service.unsign(user_id, sign_user_id)
            return (
                user_id, 
                signature
            )
        except Exception as e:
            raise e

    async def connect(self):
        print(self.scope['headers'])
        try:
            sign_user_id = self.scope["url_route"]["kwargs"]["user_id"]
            user_id, signature = await self.validate(sign_user_id)
            self.group_name = f"user_{user_id}"
            await self.channel_layer.group_add(self.group_name, self.channel_name)
            await self.accept()
        except Exception as e:
            print(str(e))
            await self.close(code=4001)
            return

    async def disconnect(self, close_code):
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        # Optionally handle messages from frontend
        pass

    async def send_notification(self, event):
        await self.send(text_data=json.dumps(event["message"]))