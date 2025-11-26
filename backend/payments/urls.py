from django.urls import path
from . import views

urlpatterns = [
    path('create/', views.create_payment, name='create-payment'),
    path('process/', views.process_payment, name='process-payment'),
    path('status/<str:payment_id>/', views.payment_status, name='payment-status'),
    path('refund/', views.refund_payment, name='refund-payment'),
]