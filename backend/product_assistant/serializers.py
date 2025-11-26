from rest_framework import serializers
from .models import Category, Product, ProductReview, UserPreference

class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'icon', 'product_count']

    def get_product_count(self, obj):
        return obj.products.filter(in_stock=True).count()

class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'price', 'category', 'category_name',
            'image_emoji', 'features', 'in_stock', 'stock_quantity', 
            'rating', 'review_count', 'is_featured'
        ]

class ProductDetailSerializer(ProductSerializer):
    reviews = serializers.SerializerMethodField()
    
    class Meta(ProductSerializer.Meta):
        fields = ProductSerializer.Meta.fields + ['reviews']
    
    def get_reviews(self, obj):
        recent_reviews = obj.reviews.order_by('-created_at')[:5]
        return ProductReviewSerializer(recent_reviews, many=True).data

class ProductReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.first_name', read_only=True)
    
    class Meta:
        model = ProductReview
        fields = ['id', 'rating', 'comment', 'user_name', 'created_at']

class UserPreferenceSerializer(serializers.ModelSerializer):
    preferred_categories = CategorySerializer(many=True, read_only=True)
    
    class Meta:
        model = UserPreference
        fields = ['preferred_categories', 'age_group', 'health_conditions']