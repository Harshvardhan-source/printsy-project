#api/urls.py
from django.urls import path
from api import views

urlpatterns = [
    
    path('health/',                        views.health),
    path('auth/send-otp/',                 views.send_otp),
    path('auth/register/',                 views.register),
    path('auth/login/',                    views.login),
    path('auth/me/',                       views.me),
    path('shops/nearby/',                  views.shops_nearby),
    path('shops/heartbeat/',               views.shop_heartbeat),
    path('jobs/',                          views.jobs_list),
    path('jobs/calculate-cost/', views.calculate_cost), 
    path('jobs/create/',                   views.jobs_create),
    path('jobs/<str:job_id>/',             views.job_detail),
    path('jobs/<str:job_id>/cancel/',      views.job_cancel),
    path('cost/',                          views.calculate_cost),
    path('terminal/search/<str:short_id>/',views.terminal_search),
    path('terminal/verify/',               views.terminal_verify),
]
