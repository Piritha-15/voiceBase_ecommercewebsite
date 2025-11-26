from django.contrib import admin
from .models import VoiceProfile, VoiceAuthAttempt

@admin.register(VoiceProfile)
class VoiceProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'is_verified', 'created_at', 'updated_at']
    list_filter = ['is_verified', 'created_at']
    search_fields = ['user__username', 'user__email']

@admin.register(VoiceAuthAttempt)
class VoiceAuthAttemptAdmin(admin.ModelAdmin):
    list_display = ['user', 'success', 'confidence_score', 'ip_address', 'created_at']
    list_filter = ['success', 'created_at']
    search_fields = ['user__username', 'ip_address']