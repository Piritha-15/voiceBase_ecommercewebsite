from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
import re

@api_view(['POST'])
def process_voice_command(request):
    """Process voice commands and return appropriate responses"""
    command = request.data.get('command', '').lower().strip()
    
    if not command:
        return Response({
            'error': 'No command provided'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Simple NLP processing for voice commands
    response = process_command(command)
    
    return Response({
        'command': command,
        'response': response,
        'action': response.get('action'),
        'parameters': response.get('parameters', {})
    })

def process_command(command):
    """Process voice command and return structured response"""
    
    # Navigation commands
    if any(phrase in command for phrase in ['go to home', 'home page', 'main page']):
        return {
            'action': 'navigate',
            'parameters': {'route': '/'},
            'message': 'Going to home page'
        }
    
    if 'go to cart' in command or 'show cart' in command:
        return {
            'action': 'navigate',
            'parameters': {'route': '/cart'},
            'message': 'Opening your cart'
        }
    
    if 'checkout' in command:
        return {
            'action': 'navigate',
            'parameters': {'route': '/checkout'},
            'message': 'Going to checkout'
        }
    
    # Category navigation
    if 'health' in command and ('category' in command or 'go to' in command):
        return {
            'action': 'navigate',
            'parameters': {'route': '/category/health'},
            'message': 'Opening health category'
        }
    
    if 'nutrition' in command and ('category' in command or 'go to' in command):
        return {
            'action': 'navigate',
            'parameters': {'route': '/category/nutrition'},
            'message': 'Opening nutrition category'
        }
    
    if 'essentials' in command and ('category' in command or 'go to' in command):
        return {
            'action': 'navigate',
            'parameters': {'route': '/category/essentials'},
            'message': 'Opening essentials category'
        }
    
    # Search commands
    search_match = re.search(r'search for (.+)', command)
    if search_match:
        search_term = search_match.group(1).strip()
        return {
            'action': 'search',
            'parameters': {'query': search_term},
            'message': f'Searching for {search_term}'
        }
    
    # Filter commands
    price_match = re.search(r'under (?:₹|rs\.?|rupees?) ?(\d+)', command)
    if price_match and 'filter' in command:
        price = price_match.group(1)
        return {
            'action': 'filter',
            'parameters': {'max_price': price},
            'message': f'Filtering products under ₹{price}'
        }
    
    # Cart actions
    if 'add to cart' in command:
        return {
            'action': 'add_to_cart',
            'parameters': {},
            'message': 'Adding item to cart'
        }
    
    if 'remove' in command and 'cart' in command:
        # Try to extract item number
        item_match = re.search(r'item (\d+)', command)
        if item_match:
            item_number = item_match.group(1)
            return {
                'action': 'remove_from_cart',
                'parameters': {'item_number': int(item_number)},
                'message': f'Removing item {item_number} from cart'
            }
        return {
            'action': 'remove_from_cart',
            'parameters': {},
            'message': 'Which item would you like to remove?'
        }
    
    # Quantity updates
    quantity_match = re.search(r'(?:increase|add) (\d+)', command)
    if quantity_match and 'quantity' in command:
        quantity = quantity_match.group(1)
        return {
            'action': 'update_quantity',
            'parameters': {'quantity': int(quantity)},
            'message': f'Updating quantity to {quantity}'
        }
    
    # Help commands
    if any(phrase in command for phrase in ['help', 'what can i say', 'commands']):
        return {
            'action': 'help',
            'parameters': {},
            'message': 'You can say: Go to home, Show cart, Search for products, Add to cart, Go to checkout, Filter by price, or ask for help'
        }
    
    # Payment commands
    if 'pay with' in command:
        if 'upi' in command:
            return {
                'action': 'select_payment',
                'parameters': {'method': 'upi'},
                'message': 'Selected UPI payment method'
            }
        elif 'card' in command:
            return {
                'action': 'select_payment',
                'parameters': {'method': 'card'},
                'message': 'Selected card payment method'
            }
        elif 'cash' in command or 'cod' in command:
            return {
                'action': 'select_payment',
                'parameters': {'method': 'cod'},
                'message': 'Selected cash on delivery'
            }
    
    if 'confirm' in command and ('order' in command or 'payment' in command):
        return {
            'action': 'confirm_order',
            'parameters': {},
            'message': 'Confirming your order'
        }
    
    # Default response
    return {
        'action': 'unknown',
        'parameters': {},
        'message': 'I did not understand that command. Try saying: Go to home, Show cart, Search for products, or ask for help'
    }

@api_view(['POST'])
def text_to_speech(request):
    """Convert text to speech parameters"""
    text = request.data.get('text', '')
    
    if not text:
        return Response({
            'error': 'No text provided'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Return TTS parameters for frontend
    return Response({
        'text': text,
        'voice_settings': {
            'rate': 0.8,  # Slower for seniors
            'pitch': 1.0,
            'volume': 1.0
        }
    })

@api_view(['POST'])
def speech_to_text(request):
    """Process speech to text (placeholder for ASR integration)"""
    # In production, this would integrate with speech recognition services
    audio_data = request.data.get('audio_data')
    
    if not audio_data:
        return Response({
            'error': 'No audio data provided'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Simulate speech recognition
    # In production, integrate with services like Google Speech-to-Text, Azure Speech, etc.
    
    return Response({
        'transcript': 'Simulated transcript from audio',
        'confidence': 0.95
    })