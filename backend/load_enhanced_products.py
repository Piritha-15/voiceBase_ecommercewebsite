import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'voicecart.settings')
django.setup()

from product_assistant.models import Product, Category

def load_enhanced_products():
    print("🚀 Loading enhanced products...")
    
    # Load JSON data with UTF-8 encoding
    with open('enhanced_products.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Clear existing data
    print("🗑️ Clearing existing products and categories...")
    Product.objects.all().delete()
    Category.objects.all().delete()
    
    # Create categories
    print("📁 Creating categories...")
    category_map = {}
    for cat_data in data['categories']:
        category = Category.objects.create(
            name=cat_data['name'],
            description=cat_data['description']
        )
        category_map[cat_data['name']] = category
        print(f"  ✅ Created category: {category.name}")
    
    # Create products
    print("📦 Creating products...")
    for prod_data in data['products']:
        category = category_map[prod_data['category']]
        product = Product.objects.create(
            name=prod_data['name'],
            description=prod_data['description'],
            price=prod_data['price'],
            category=category,
            stock_quantity=prod_data.get('stock', 50),
            in_stock=prod_data.get('stock', 50) > 0,
            image_emoji=prod_data.get('image', '📦'),
            rating=prod_data.get('rating', 4.0),
            review_count=prod_data.get('reviews', 0)
        )
        print(f"  ✅ Created product: {product.name} (₹{product.price})")
    
    print(f"\n✅ Successfully loaded {len(data['products'])} products in {len(data['categories'])} categories!")
    print("\n📊 Summary:")
    for category in Category.objects.all():
        count = Product.objects.filter(category=category).count()
        print(f"  {category.name}: {count} products")

if __name__ == '__main__':
    load_enhanced_products()
