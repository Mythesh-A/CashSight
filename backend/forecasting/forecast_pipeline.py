"""
forecast_pipeline.py - Simplified Synthetic Forecast

This module now serves as a wrapper around the synthetic forecast.
Monte Carlo forecasting will be added in future versions when
sufficient historical data is available.

The actual forecast logic is now in routes.py to keep it simpler
and more maintainable.
"""

def run_forecast(reconciliation_result, settlements, current_cash=None, pending_amount=None):
    """
    Wrapper for synthetic forecast.
    The actual implementation is in routes.py.
    This function is kept for backward compatibility.
    """
    from backend.routes import UPLOAD_CACHE
    
    # If data not provided, use cache
    if current_cash is None or pending_amount is None:
        bank = UPLOAD_CACHE.get('bank', [])
        exceptions = UPLOAD_CACHE.get('exceptions', [])
        
        current_cash = sum(b.get('credited_amount', 0) for b in bank)
        pending_settlements = [
            e for e in exceptions 
            if e.get('exception_type') == 'missing_bank_credit'
        ]
        pending_amount = sum(e.get('amount', 0) for e in pending_settlements)
    
    # Calculate total expected
    total_expected = current_cash + pending_amount
    
    return {
        'current_cash': round(current_cash, 2),
        'pending_amount': pending_amount,
        'total_expected': round(total_expected, 2),
        'forecast_type': 'synthetic',
        'disclaimer': (
            "⚠️ Insufficient historical data for Monte Carlo forecast. "
            "This version uses synthetic scenarios for demonstration."
        ),
        'data_source': UPLOAD_CACHE.get('data_source', 'sample')
    }


def get_cash_position(reconciliation_result, settlements_df):
    """
    Calculate current cash position from reconciliation results
    """
    # Calculate total reconciled amount
    reconciled_amount = sum(
        s.get('net_amount', 0) 
        for s in reconciliation_result.get('matches', [])
    )
    
    # Calculate pending amount
    pending_amount = sum(
        s.get('net_amount', 0) 
        for s in reconciliation_result.get('exceptions', [])
    )
    
    return {
        'current_cash': reconciled_amount,
        'pending_settlements': pending_amount,
        'total_expected': reconciled_amount + pending_amount,
        'reconciled_count': len(reconciliation_result.get('matches', [])),
        'pending_count': len(reconciliation_result.get('exceptions', []))
    }