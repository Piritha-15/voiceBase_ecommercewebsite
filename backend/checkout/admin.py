from django.contrib import admin
from .models import Order, OrderItem, DeliveryTracking

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['order_id', 'full_name', 'status', 'payment_method', 'total_amount', 'created_at']
    list_filter = ['status', 'payment_method', 'created_at']
    search_fields = ['order_id', 'full_name', 'phone', 'email']
    inlines = [OrderItemInline]

@admin.register(DeliveryTracking)
class DeliveryTrackingAdmin(admin.ModelAdmin):
    list_display = ['order', 'tracking_number', 'current_status', 'estimated_delivery']
    list_filter = ['current_status', 'estimated_delivery']
    search_fields = ['tracking_number', 'order__order_id']