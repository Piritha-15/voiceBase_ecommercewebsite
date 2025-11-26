from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import Payment, PaymentAttempt
from checkout.models import Order
import uuid

def generate_payment_id():
    """Generate unique payment ID"""
    return f"PAY{int(timezone.now().timestamp())}"

@api_view(['POST'])
def create_payment(request):
    """Create payment for an order"""
    order_id = request.data.get('order_id')
    payment_method = request.data.get('payment_method')
    
    if not order_id or not payment_method:
        return Response({
            'error': 'Order ID and payment method are required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    order = get_object_or_404(Order, order_id=order_id)
    
    # Check if payment already exists
    if hasattr(order, 'payment'):
        return Response({
            'error': 'Payment already exists for this order'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Map payment method to gateway
    gateway_map = {
        'card': 'stripe',
        'upi': 'razorpay',
        'cod': 'cod'
    }
    
    gateway = gateway_map.get(payment_method, 'stripe')
    
    # Create payment record
    payment = Payment.objects.create(
        order=order,
        payment_id=generate_payment_id(),
        gateway=gateway,
        amount=order.total_amount,
        status='pending'
    )
    
    return Response({
        'payment_id': payment.payment_id,
        'order_id': order.order_id,
        'amount': float(payment.amount),
        'gateway': payment.gateway,
        'status': payment.status
    }, status=status.HTTP_201_CREATED)

@api_view(['POST'])
def process_payment(request):
    """Process payment (simulate payment gateway integration)"""
    payment_id = request.data.get('payment_id')
    gateway_data = request.data.get('gateway_data', {})
    
    if not payment_id:
        return Response({
            'error': 'Payment ID is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    payment = get_object_or_404(Payment, payment_id=payment_id)
    
    if payment.status != 'pending':
        return Response({
            'error': 'Payment is not in pending status'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Update payment status to processing
    payment.status = 'processing'
    payment.save()
    
    # Simulate payment processing based on gateway
    success = True  # In production, integrate with actual payment gateways
    
    if payment.gateway == 'cod':
        # Cash on delivery is always successful
        payment.status = 'completed'
        payment.gateway_payment_id = f"COD_{payment.payment_id}"
        success = True
    else:
        # Simulate card/UPI payment
        # In production, integrate with Stripe/Razorpay APIs
        payment.gateway_payment_id = f"GW_{payment.payment_id}"
        payment.status = 'completed' if success else 'failed'
    
    payment.gateway_response = gateway_data
    payment.save()
    
    # Log payment attempt
    PaymentAttempt.objects.create(
        payment=payment,
        gateway_response=gateway_data,
        success=success,
        error_message='' if success else 'Simulated payment failure'
    )
    
    # Update order status if payment successful
    if success:
        payment.order.status = 'confirmed'
        payment.order.save()
    
    return Response({
        'payment_id': payment.payment_id,
        'status': payment.status,
        'gateway_payment_id': payment.gateway_payment_id,
        'success': success
    })

@api_view(['GET'])
def payment_status(request, payment_id):
    """Get payment status"""
    payment = get_object_or_404(Payment, payment_id=payment_id)
    
    return Response({
        'payment_id': payment.payment_id,
        'order_id': payment.order.order_id,
        'amount': float(payment.amount),
        'status': payment.status,
        'gateway': payment.gateway,
        'gateway_payment_id': payment.gateway_payment_id,
        'created_at': payment.created_at,
        'updated_at': payment.updated_at
    })

@api_view(['POST'])
def refund_payment(request):
    """Process payment refund"""
    payment_id = request.data.get('payment_id')
    refund_amount = request.data.get('refund_amount')
    
    if not payment_id:
        return Response({
            'error': 'Payment ID is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    payment = get_object_or_404(Payment, payment_id=payment_id)
    
    if payment.status != 'completed':
        return Response({
            'error': 'Only completed payments can be refunded'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    if refund_amount and float(refund_amount) > float(payment.amount):
        return Response({
            'error': 'Refund amount cannot exceed payment amount'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Process refund (simulate)
    payment.status = 'refunded'
    payment.save()
    
    # Update order status
    payment.order.status = 'cancelled'
    payment.order.save()
    
    return Response({
        'message': 'Refund processed successfully',
        'payment_id': payment.payment_id,
        'refund_amount': refund_amount or float(payment.amount)
    })