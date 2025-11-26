from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from datetime import timedelta
import uuid
from .models import Order, OrderItem, DeliveryTracking
from .serializers import OrderSerializer, OrderDetailSerializer
from cart.views import get_or_create_cart

def generate_order_id():
    """Generate unique order ID"""
    return f"VC{int(timezone.now().timestamp())}"

@api_view(['POST'])
def create_order(request):
    """Create a new order from cart"""
    # Get customer information
    full_name = request.data.get('full_name')
    phone = request.data.get('phone')
    email = request.data.get('email', '')
    address = request.data.get('address')
    city = request.data.get('city')
    pincode = request.data.get('pincode')
    payment_method = request.data.get('payment_method')
    
    # Validate required fields
    required_fields = ['full_name', 'phone', 'address', 'city', 'pincode', 'payment_method']
    for field in required_fields:
        if not request.data.get(field):
            return Response({
                'error': f'{field.replace("_", " ").title()} is required'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    # Get cart
    cart = get_or_create_cart(request)
    
    if not cart.items.exists():
        return Response({
            'error': 'Cart is empty'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Create order
    order = Order.objects.create(
        user=request.user if request.user.is_authenticated else None,
        session_key=request.session.session_key if not request.user.is_authenticated else None,
        order_id=generate_order_id(),
        full_name=full_name,
        phone=phone,
        email=email,
        address=address,
        city=city,
        pincode=pincode,
        payment_method=payment_method,
        total_amount=cart.total_amount
    )
    
    # Create order items
    for cart_item in cart.items.all():
        OrderItem.objects.create(
            order=order,
            product_name=cart_item.product.name,
            product_price=cart_item.product.price,
            quantity=cart_item.quantity,
            subtotal=cart_item.subtotal
        )
    
    # Create delivery tracking
    tracking_number = f"TRK{order.order_id}"
    estimated_delivery = timezone.now() + timedelta(days=5)  # 5 days from now
    
    DeliveryTracking.objects.create(
        order=order,
        tracking_number=tracking_number,
        estimated_delivery=estimated_delivery
    )
    
    # Clear cart after successful order
    cart.items.all().delete()
    
    serializer = OrderDetailSerializer(order)
    return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(['GET'])
def get_order(request, order_id):
    """Get order details"""
    order = get_object_or_404(Order, order_id=order_id)
    
    # Check if user has permission to view this order
    if request.user.is_authenticated:
        if order.user != request.user:
            return Response({
                'error': 'Permission denied'
            }, status=status.HTTP_403_FORBIDDEN)
    else:
        if order.session_key != request.session.session_key:
            return Response({
                'error': 'Permission denied'
            }, status=status.HTTP_403_FORBIDDEN)
    
    serializer = OrderDetailSerializer(order)
    return Response(serializer.data)

@api_view(['GET'])
def user_orders(request):
    """Get all orders for authenticated user"""
    if not request.user.is_authenticated:
        return Response({
            'error': 'Authentication required'
        }, status=status.HTTP_401_UNAUTHORIZED)
    
    orders = Order.objects.filter(user=request.user)
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def track_order(request, order_id):
    """Track order delivery status"""
    order = get_object_or_404(Order, order_id=order_id)
    
    # Check permissions
    if request.user.is_authenticated:
        if order.user != request.user:
            return Response({
                'error': 'Permission denied'
            }, status=status.HTTP_403_FORBIDDEN)
    else:
        if order.session_key != request.session.session_key:
            return Response({
                'error': 'Permission denied'
            }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        tracking = order.tracking
        return Response({
            'order_id': order.order_id,
            'tracking_number': tracking.tracking_number,
            'current_status': tracking.current_status,
            'estimated_delivery': tracking.estimated_delivery,
            'actual_delivery': tracking.actual_delivery,
            'delivery_notes': tracking.delivery_notes
        })
    except DeliveryTracking.DoesNotExist:
        return Response({
            'error': 'Tracking information not available'
        }, status=status.HTTP_404_NOT_FOUND)