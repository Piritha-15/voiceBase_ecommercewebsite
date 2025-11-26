from django.urls import path
from . import views

urlpatterns = [
    path('create/', views.create_order, name='create-order'),
    path('order/<str:order_id>/', views.get_order, name='get-order'),
    path('orders/', views.user_orders, name='user-orders'),
    path('track/<str:order_id>/', views.track_order, name='track-order'),
]