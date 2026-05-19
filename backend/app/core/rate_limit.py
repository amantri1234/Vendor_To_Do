from slowapi import Limiter


def get_real_ip(request):
    return request.client.host if request.client else "127.0.0.1"


limiter = Limiter(key_func=get_real_ip, default_limits=["200/hour"])
