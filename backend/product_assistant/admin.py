from django.contrib import admin
from .models import Category, Product, ProductReview, UserPreference

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'description', 'icon', 'created_at']
    search_fields = ['name']

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'price', 'in_stock', 'rating', 'is_featured']
    list_filter = ['category', 'in_stock', 'is_featured', 'created_at']
    search_fields = ['name', 'description']
    list_editable = ['price', 'in_stock', 'is_featured']

@admin.register(ProductReview)
class ProductReviewAdmin(admin.ModelAdmin):
    list_display = ['product', 'user', 'rating', 'created_at']
    list_filter = ['rating', 'created_at']

@admin.register(UserPreference)
class UserPreferenceAdmin(admin.ModelAdmin):
    list_display = ['user', 'age_group', 'created_at']
    filter_horizontal = ['preferred_categories']