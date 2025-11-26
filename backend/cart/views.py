from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Cart, CartItem
from .serializers import CartSerializer, CartItemSerializer
from product_assistant.models import Product

def get_or_create_cart(request):
    """Get or create cart for user or session"""
    if request.user.is_authenticated:
        cart, created = Cart.objects.get_or_create(user=request.user)
    else:
        session_key = request.session.session_key
        if not session_key:
            request.session.create()
            session_key = request.session.session_key
        cart, created = Cart.objects.get_or_create(session_key=session_key)
    return cart

@api_view(['GET'])
def get_cart(request):
    """Get current user's cart"""
    cart = get_or_create_cart(request)
    serializer = CartSerializer(cart)
    return Response(serializer.data)

@api_view(['POST'])
def add_to_cart(request):
    """Add item to cart"""
    product_id = request.data.get('product_id')
    quantity = request.data.get('quantity', 1)
    
    if not product_id:
        return Response({'error': 'Product ID is required'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    try:
        quantity = int(quantity)
        if quantity <= 0:
            return Response({'error': 'Quantity must be positive'}, 
                           status=status.HTTP_400_BAD_REQUEST)
    except ValueError:
        return Response({'error': 'Invalid quantity'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    product = get_object_or_404(Product, id=product_id, in_stock=True)
    cart = get_or_create_cart(request)
    
    # Check if item already exists in cart
    cart_item, created = CartItem.objects.get_or_create(
        cart=cart,
        product=product,
        defaults={'quantity': quantity}
    )
    
    if not created:
        cart_item.quantity += quantity
        cart_item.save()
    
    serializer = CartItemSerializer(cart_item)
    return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(['PUT'])
def update_cart_item(request, item_id):
    """Update cart item quantity"""
    quantity = request.data.get('quantity')
    
    if quantity is None:
        return Response({'error': 'Quantity is required'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    try:
        quantity = int(quantity)
        if quantity < 0:
            return Response({'error': 'Quantity cannot be negative'}, 
                           status=status.HTTP_400_BAD_REQUEST)
    except ValueError:
        return Response({'error': 'Invalid quantity'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    cart = get_or_create_cart(request)
    cart_item = get_object_or_404(CartItem, id=item_id, cart=cart)
    
    if quantity == 0:
        cart_item.delete()
        return Response({'message': 'Item removed from cart'})
    else:
        cart_item.quantity = quantity
        cart_item.save()
        serializer = CartItemSerializer(cart_item)
        return Response(serializer.data)

@api_view(['DELETE'])
def remove_from_cart(request, item_id):
    """Remove item from cart"""
    cart = get_or_create_cart(request)
    cart_item = get_object_or_404(CartItem, id=item_id, cart=cart)
    cart_item.delete()
    return Response({'message': 'Item removed from cart'})

@api_view(['DELETE'])
def clear_cart(request):
    """Clear all items from cart"""
    cart = get_or_create_cart(request)
    cart.items.all().delete()
    return Response({'message': 'Cart cleared'})