from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    city = models.CharField(max_length=100, blank=True)
    games_won = models.PositiveIntegerField(default=0)
    games_played = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.username

class Friendship(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('ACCEPTED', 'Accepted'),
        ('REJECTED', 'Rejected'),
    )
    sender = models.ForeignKey(User, related_name='sent_requests', on_delete=models.CASCADE)
    receiver = models.ForeignKey(User, related_name='received_requests', on_delete=models.CASCADE)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('sender', 'receiver')
        constraints = [
            models.CheckConstraint(check=~models.Q(sender=models.F('receiver')), name='prevent_self_friendship')
        ]
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.sender.username} -> {self.receiver.username} ({self.status})"
