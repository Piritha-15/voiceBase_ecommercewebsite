#!/usr/bin/env python
"""
Script to create sample data for VoiceCart
Run this after migrations: python create_sample_data.py
"""

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'voicecart.settings')
django.setup()

from product_assistant.models import Category, Product

def create_sample_data():
    print("Creating sample data...")
    
    # Create categories
    health_cat, created = Category.objects.get_or_create(
        name="health",
        defaults={
            "description": "Medical devices, health monitoring equipment, and wellness products for seniors",
            "icon": "🏥"
        }
    )
    
    nutrition_cat, created = Category.objects.get_or_create(
        name="nutrition",
        defaults={
            "description": "Vitamins, supplements, and nutritional products for healthy aging",
            "icon": "🥗"
        }
    )
    
    essentials_cat, created = Category.objects.get_or_create(
        name="essentials",
        defaults={
            "description": "Daily living aids, mobility support, and comfort items",
            "icon": "🏠"
        }
    )
    
    print(f"Created categories: {health_cat.name}, {nutrition_cat.name}, {essentials_cat.name}")
    
    # Create products
    products_data = [
        {
            "name": "Blood Pressure Monitor",
            "description": "Digital blood pressure monitor with large display, perfect for seniors. Features easy-to-read numbers and voice announcements.",
            "price": 2500.00,
            "category": health_cat,
            "image_emoji": "🩺",
            "features": [
                "Large LCD display with backlight",
                "Voice announcement of readings",
                "Memory for 60 readings",
                "Irregular heartbeat detection",
                "One-touch operation"
            ],
            "stock_quantity": 25,
            "rating": 4.50,
            "review_count": 128,
            "is_featured": True
        },
        {
            "name": "Vitamin D Tablets",
            "description": "High-quality Vitamin D3 supplements for bone health and immunity support. Easy-to-swallow tablets.",
            "price": 450.00,
            "category": nutrition_cat,
            "image_emoji": "💊",
            "features": [
                "1000 IU Vitamin D3 per tablet",
                "Supports bone health",
                "Boosts immune system",
                "Easy to swallow",
                "60 tablets per bottle"
            ],
            "stock_quantity": 100,
            "rating": 4.30,
            "review_count": 89,
            "is_featured": True
        },
        {
            "name": "Walking Stick",
            "description": "Adjustable aluminum walking stick with ergonomic handle and anti-slip rubber tip for safe mobility.",
            "price": 800.00,
            "category": essentials_cat,
            "image_emoji": "🦯",
            "features": [
                "Adjustable height (70-95 cm)",
                "Lightweight aluminum construction",
                "Ergonomic foam handle",
                "Anti-slip rubber tip",
                "Wrist strap included"
            ],
            "stock_quantity": 50,
            "rating": 4.20,
            "review_count": 67,
            "is_featured": True
        },
        {
            "name": "Glucose Monitor",
            "description": "Digital glucose monitoring system with voice guidance and large display for easy diabetes management.",
            "price": 1800.00,
            "category": health_cat,
            "image_emoji": "🔬",
            "features": [
                "Voice-guided testing",
                "Large, easy-to-read display",
                "500 test memory",
                "Fast 5-second results",
                "Includes 25 test strips"
            ],
            "stock_quantity": 30,
            "rating": 4.40,
            "review_count": 95,
            "is_featured": False
        },
        {
            "name": "Calcium Supplements",
            "description": "Calcium carbonate tablets with Vitamin D for strong bones and teeth. Specially formulated for seniors.",
            "price": 350.00,
            "category": nutrition_cat,
            "image_emoji": "🦴",
            "features": [
                "500mg Calcium per tablet",
                "Added Vitamin D3",
                "Supports bone density",
                "Easy to digest",
                "90 tablets per bottle"
            ],
            "stock_quantity": 80,
            "rating": 4.10,
            "review_count": 72,
            "is_featured": False
        },
        {
            "name": "Reading Glasses",
            "description": "Comfortable reading glasses with anti-glare coating and spring hinges for extended wear.",
            "price": 600.00,
            "category": essentials_cat,
            "image_emoji": "👓",
            "features": [
                "Multiple strength options",
                "Anti-glare coating",
                "Spring hinges for comfort",
                "Lightweight frame",
                "Includes protective case"
            ],
            "stock_quantity": 60,
            "rating": 4.00,
            "review_count": 54,
            "is_featured": False
        },
        {
            "name": "Digital Thermometer",
            "description": "Fast and accurate digital thermometer with large display and fever alarm for health monitoring.",
            "price": 350.00,
            "category": health_cat,
            "image_emoji": "🌡️",
            "features": [
                "10-second fast reading",
                "Large LCD display",
                "Fever alarm",
                "Memory recall",
                "Waterproof design"
            ],
            "stock_quantity": 75,
            "rating": 4.25,
            "review_count": 43,
            "is_featured": False
        },
        {
            "name": "Pulse Oximeter",
            "description": "Fingertip pulse oximeter for monitoring oxygen saturation and pulse rate with clear OLED display.",
            "price": 1200.00,
            "category": health_cat,
            "image_emoji": "📱",
            "features": [
                "OLED display",
                "Measures SpO2 and pulse",
                "Low battery indicator",
                "Auto power off",
                "Includes lanyard"
            ],
            "stock_quantity": 40,
            "rating": 4.35,
            "review_count": 61,
            "is_featured": False
        },
        {
            "name": "Omega-3 Capsules",
            "description": "High-quality fish oil capsules rich in EPA and DHA for heart and brain health support.",
            "price": 800.00,
            "category": nutrition_cat,
            "image_emoji": "🐟",
            "features": [
                "1000mg fish oil per capsule",
                "Rich in EPA and DHA",
                "Supports heart health",
                "Brain function support",
                "60 capsules per bottle"
            ],
            "stock_quantity": 90,
            "rating": 4.15,
            "review_count": 38,
            "is_featured": False
        },
        {
            "name": "Multivitamins",
            "description": "Complete multivitamin formula designed for seniors with essential vitamins and minerals.",
            "price": 600.00,
            "category": nutrition_cat,
            "image_emoji": "🌈",
            "features": [
                "Complete vitamin formula",
                "Designed for 50+ adults",
                "Supports energy levels",
                "Immune system support",
                "30 tablets per bottle"
            ],
            "stock_quantity": 70,
            "rating": 4.05,
            "review_count": 52,
            "is_featured": False
        },
        {
            "name": "Magnifying Glass",
            "description": "LED illuminated magnifying glass with 3x magnification for reading small text and detailed work.",
            "price": 400.00,
            "category": essentials_cat,
            "image_emoji": "🔍",
            "features": [
                "3x magnification",
                "LED illumination",
                "Ergonomic handle",
                "Battery operated",
                "Scratch-resistant lens"
            ],
            "stock_quantity": 45,
            "rating": 3.95,
            "review_count": 29,
            "is_featured": False
        },
        {
            "name": "Pill Organizer",
            "description": "7-day pill organizer with large compartments and easy-open lids for medication management.",
            "price": 250.00,
            "category": essentials_cat,
            "image_emoji": "💊",
            "features": [
                "7-day organization",
                "Large compartments",
                "Easy-open lids",
                "Clear labeling",
                "Compact design"
            ],
            "stock_quantity": 85,
            "rating": 4.20,
            "review_count": 76,
            "is_featured": False
        }
    ]
    
    created_count = 0
    for product_data in products_data:
        product, created = Product.objects.get_or_create(
            name=product_data["name"],
            defaults=product_data
        )
        if created:
            created_count += 1
            print(f"Created product: {product.name}")
        else:
            print(f"Product already exists: {product.name}")
    
    print(f"\nSample data creation complete!")
    print(f"Categories: {Category.objects.count()}")
    print(f"Products: {Product.objects.count()}")
    print(f"New products created: {created_count}")

if __name__ == "__main__":
    create_sample_data()