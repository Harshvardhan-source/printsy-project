#core/urls.py
from django.http import HttpResponse
from django.urls import path, include


urlpatterns = [
    path('api/', include('api.urls')),
]
