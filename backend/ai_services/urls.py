from django.urls import path
from . import views

urlpatterns = [
    path('voice/process/', views.process_voice_command, name='process-voice-command'),
    path('tts/', views.text_to_speech, name='text-to-speech'),
    path('stt/', views.speech_to_text, name='speech-to-text'),
]