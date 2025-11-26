from rest_framework import serializers
from .models import Order, OrderItem, DeliveryTracking

class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['product_name', 'product_price', 'quantity', 'subtotal']

class DeliveryTrackingSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeliveryTracking
        fields = ['tracking_number', 'current_status', 'estimated_delivery', 'actual_delivery']

class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = [
            'order_id', 'full_name', 'status', 'payment_method', 
            'total_amount', 'created_at'
        ]

class OrderDetailSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    tracking = DeliveryTrackingSerializer(read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'order_id', 'full_name', 'phone', 'email', 'address', 
            'city', 'pincode', 'status', 'payment_method', 
            'total_amount', 'items', 'tracking', 'created_at', 'updated_at'
        ]