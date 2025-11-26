from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.voice_register, name='voice-register'),
    path('login/', views.voice_login, name='voice-login'),
    path('verify/', views.voice_verify, name='voice-verify'),
]