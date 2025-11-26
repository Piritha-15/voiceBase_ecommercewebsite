#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'voicecart.settings')
django.setup()

from django.contrib.auth.models import User

try:
    admin = User.objects.get(username='admin')
    admin.set_password('admin123')
    admin.save()
    print("Admin password set to: admin123")
except User.DoesNotExist:
    print("Admin user not found")