from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from .models import VoiceProfile, VoiceAuthAttempt

def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

@api_view(['POST'])
def voice_register(request):
    """Register a new voice profile"""
    username = request.data.get('username')
    voice_data = request.data.get('voice_data')
    
    if not username or not voice_data:
        return Response({
            'error': 'Username and voice data are required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = User.objects.get(username=username)
        
        # In production, process voice_data with ML models
        # For now, we'll simulate voice signature creation
        voice_signature = f"voice_sig_{username}_{len(voice_data)}"
        
        voice_profile, created = VoiceProfile.objects.get_or_create(
            user=user,
            defaults={
                'voice_signature': voice_signature,
                'is_verified': True
            }
        )
        
        if not created:
            voice_profile.voice_signature = voice_signature
            voice_profile.is_verified = True
            voice_profile.save()
        
        return Response({
            'message': 'Voice profile registered successfully',
            'user_id': user.id
        })
        
    except User.DoesNotExist:
        return Response({
            'error': 'User not found'
        }, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
def voice_login(request):
    """Authenticate user using voice biometrics"""
    username = request.data.get('username')
    voice_data = request.data.get('voice_data')
    
    if not username or not voice_data:
        return Response({
            'error': 'Username and voice data are required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    ip_address = get_client_ip(request)
    user_agent = request.META.get('HTTP_USER_AGENT', '')
    
    try:
        user = User.objects.get(username=username)
        voice_profile = VoiceProfile.objects.get(user=user, is_verified=True)
        
        # In production, compare voice_data with stored voice_signature using ML
        # For now, simulate voice matching
        confidence_score = 0.95  # Simulated confidence
        
        if confidence_score > 0.8:  # Threshold for successful authentication
            login(request, user)
            
            # Log successful attempt
            VoiceAuthAttempt.objects.create(
                user=user,
                success=True,
                confidence_score=confidence_score,
                ip_address=ip_address,
                user_agent=user_agent
            )
            
            return Response({
                'message': 'Voice authentication successful',
                'user_id': user.id,
                'username': user.username,
                'confidence_score': confidence_score
            })
        else:
            # Log failed attempt
            VoiceAuthAttempt.objects.create(
                user=user,
                success=False,
                confidence_score=confidence_score,
                ip_address=ip_address,
                user_agent=user_agent
            )
            
            return Response({
                'error': 'Voice authentication failed',
                'confidence_score': confidence_score
            }, status=status.HTTP_401_UNAUTHORIZED)
            
    except User.DoesNotExist:
        # Log failed attempt without user
        VoiceAuthAttempt.objects.create(
            success=False,
            ip_address=ip_address,
            user_agent=user_agent
        )
        
        return Response({
            'error': 'User not found'
        }, status=status.HTTP_404_NOT_FOUND)
        
    except VoiceProfile.DoesNotExist:
        return Response({
            'error': 'Voice profile not found. Please register your voice first.'
        }, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
def voice_verify(request):
    """Verify voice for secure transactions"""
    voice_data = request.data.get('voice_data')
    
    if not voice_data:
        return Response({
            'error': 'Voice data is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    if not request.user.is_authenticated:
        return Response({
            'error': 'User must be logged in'
        }, status=status.HTTP_401_UNAUTHORIZED)
    
    try:
        voice_profile = VoiceProfile.objects.get(user=request.user, is_verified=True)
        
        # Simulate voice verification
        confidence_score = 0.92
        
        if confidence_score > 0.85:
            return Response({
                'verified': True,
                'confidence_score': confidence_score,
                'message': 'Voice verification successful'
            })
        else:
            return Response({
                'verified': False,
                'confidence_score': confidence_score,
                'message': 'Voice verification failed'
            }, status=status.HTTP_401_UNAUTHORIZED)
            
    except VoiceProfile.DoesNotExist:
        return Response({
            'error': 'Voice profile not found'
        }, status=status.HTTP_404_NOT_FOUND)