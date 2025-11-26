from django.db import models
from checkout.models import Order

class Payment(models.Model):
    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ]
    
    GATEWAY_CHOICES = [
        ('stripe', 'Stripe'),
        ('razorpay', 'Razorpay'),
        ('cod', 'Cash on Delivery'),
    ]
    
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='payment')
    payment_id = models.CharField(max_length=100, unique=True)
    gateway = models.CharField(max_length=20, choices=GATEWAY_CHOICES)
    gateway_payment_id = models.CharField(max_length=100, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    gateway_response = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Payment {self.payment_id} - {self.status}"

class PaymentAttempt(models.Model):
    payment = models.ForeignKey(Payment, on_delete=models.CASCADE, related_name='attempts')
    gateway_response = models.JSONField(default=dict)
    success = models.BooleanField(default=False)
    error_message = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        status = "Success" if self.success else "Failed"
        return f"Payment attempt {status} - {self.created_at}"