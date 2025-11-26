from django.contrib import admin
from .models import Payment, PaymentAttempt

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['payment_id', 'order', 'gateway', 'amount', 'status', 'created_at']
    list_filter = ['gateway', 'status', 'created_at']
    search_fields = ['payment_id', 'gateway_payment_id', 'order__order_id']

@admin.register(PaymentAttempt)
class PaymentAttemptAdmin(admin.ModelAdmin):
    list_display = ['payment', 'success', 'created_at']
    list_filter = ['success', 'created_at']