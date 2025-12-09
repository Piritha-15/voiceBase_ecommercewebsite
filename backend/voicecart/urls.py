"""
URL configuration for voicecart project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/accounts/', include('accounts.urls')),
    path('api/voice/', include('voice_auth.urls')),
    path('api/products/', include('product_assistant.urls')),
    path('api/cart/', include('cart.urls')),
    path('api/checkout/', include('checkout.urls')),
    path('api/payments/', include('payments.urls')),
    path('api/ai/', include('ai_services.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)