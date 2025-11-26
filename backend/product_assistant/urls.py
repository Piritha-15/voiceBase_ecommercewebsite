from django.urls import path
from . import views

urlpatterns = [
    path('categories/', views.CategoryListView.as_view(), name='category-list'),
    path('', views.ProductListView.as_view(), name='product-list'),
    path('<int:pk>/', views.ProductDetailView.as_view(), name='product-detail'),
    path('featured/', views.FeaturedProductsView.as_view(), name='featured-products'),
    path('recommendations/', views.product_recommendations, name='product-recommendations'),
    path('search/voice/', views.voice_search, name='voice-search'),
    path('category/<str:category_name>/', views.category_products, name='category-products'),
]