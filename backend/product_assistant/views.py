from rest_framework import generics, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Q
from .models import Category, Product, ProductReview
from .serializers import (
    CategorySerializer, ProductSerializer, ProductDetailSerializer,
    ProductReviewSerializer
)

class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class ProductListView(generics.ListAPIView):
    serializer_class = ProductSerializer
    
    def get_queryset(self):
        queryset = Product.objects.filter(in_stock=True)
        
        # Filter by category
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category__name__iexact=category)
        
        # Filter by price range
        max_price = self.request.query_params.get('max_price')
        if max_price:
            try:
                queryset = queryset.filter(price__lte=float(max_price))
            except ValueError:
                pass
        
        # Search functionality
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | 
                Q(description__icontains=search)
            )
        
        # Sort functionality
        sort_by = self.request.query_params.get('sort')
        if sort_by == 'price_low':
            queryset = queryset.order_by('price')
        elif sort_by == 'price_high':
            queryset = queryset.order_by('-price')
        elif sort_by == 'rating':
            queryset = queryset.order_by('-rating')
        elif sort_by == 'name':
            queryset = queryset.order_by('name')
        
        return queryset

class ProductDetailView(generics.RetrieveAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductDetailSerializer

class FeaturedProductsView(generics.ListAPIView):
    queryset = Product.objects.filter(is_featured=True, in_stock=True)
    serializer_class = ProductSerializer

@api_view(['GET'])
def product_recommendations(request):
    """
    Get personalized product recommendations based on user preferences
    """
    # For now, return popular products
    # In production, this would use ML algorithms
    recommended_products = Product.objects.filter(
        in_stock=True,
        rating__gte=4.0
    ).order_by('-rating', '-review_count')[:6]
    
    serializer = ProductSerializer(recommended_products, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def voice_search(request):
    """
    Process voice search queries and return relevant products
    """
    query = request.data.get('query', '').lower()
    
    if not query:
        return Response({'error': 'No search query provided'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    # Simple keyword matching - in production, use NLP
    products = Product.objects.filter(
        Q(name__icontains=query) | 
        Q(description__icontains=query) |
        Q(category__name__icontains=query),
        in_stock=True
    )[:10]
    
    serializer = ProductSerializer(products, many=True)
    
    return Response({
        'query': query,
        'results': serializer.data,
        'count': len(serializer.data)
    })

@api_view(['GET'])
def category_products(request, category_name):
    """
    Get products by category name
    """
    try:
        category = Category.objects.get(name__iexact=category_name)
        products = Product.objects.filter(category=category, in_stock=True)
        
        # Apply filters
        max_price = request.query_params.get('max_price')
        if max_price:
            try:
                products = products.filter(price__lte=float(max_price))
            except ValueError:
                pass
        
        # Apply sorting
        sort_by = request.query_params.get('sort')
        if sort_by == 'price_low':
            products = products.order_by('price')
        elif sort_by == 'price_high':
            products = products.order_by('-price')
        elif sort_by == 'rating':
            products = products.order_by('-rating')
        elif sort_by == 'name':
            products = products.order_by('name')
        
        serializer = ProductSerializer(products, many=True)
        return Response({
            'category': category.name,
            'products': serializer.data
        })
        
    except Category.DoesNotExist:
        return Response({'error': 'Category not found'}, 
                       status=status.HTTP_404_NOT_FOUND)