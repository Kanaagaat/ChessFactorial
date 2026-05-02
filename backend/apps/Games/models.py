from django.db import models
from django.conf import settings


class Game(models.Model):
    RESULT_WIN = "win"
    RESULT_LOSS = "loss"
    RESULT_DRAW = "draw"
    RESULT_RESIGNED = "resigned"
    RESULT_CHOICES = (
        (RESULT_WIN, "Win"),
        (RESULT_LOSS, "Loss"),
        (RESULT_DRAW, "Draw"),
        (RESULT_RESIGNED, "Resigned"),
    )

    MODE_HUMAN = "human"
    MODE_AI = "ai"
    MODE_CHOICES = (
        (MODE_HUMAN, "Human"),
        (MODE_AI, "AI"),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="games")
    pgn = models.TextField()
    result = models.CharField(max_length=10, choices=RESULT_CHOICES)
    mode = models.CharField(max_length=10, choices=MODE_CHOICES)
    ai_level = models.PositiveSmallIntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    analysis = models.JSONField(null=True, blank=True)

    class Meta:
        ordering = ("-created_at",)

    def __str__(self):
        return f"{self.user.username} - {self.result} ({self.created_at:%Y-%m-%d})"
