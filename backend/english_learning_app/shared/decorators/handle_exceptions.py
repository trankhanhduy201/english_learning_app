from functools import wraps


def handle_exceptions(reraise=True, default_return=None, log_error=True):
    """
    Decorator to handle exceptions at function level.
    
    Args:
        reraise (bool): Whether to re-raise the exception after handling. Default: True
        default_return: Value to return if exception occurs and reraise=False. Default: None
        log_error (bool): Whether to print the error. Default: True
    
    Example:
        @handle_exceptions(reraise=True)
        def my_function():
            # Logic here - exceptions will be caught and re-raised
            pass
        
        @handle_exceptions(reraise=False, default_return=None)
        def another_function():
            # Exceptions will be caught, logged, and None returned
            pass
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            try:
                return func(*args, **kwargs)
            except Exception as e:
                if log_error:
                    print(f"[{func.__name__}] Error: {str(e)}")
                if reraise:
                    raise e
                return default_return
        return wrapper
    return decorator
