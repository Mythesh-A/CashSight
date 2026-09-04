"""
Exception Resolver - Handles human decisions on exceptions
"""

import json
from datetime import datetime

# Store verified matches (in memory for demo)
VERIFIED_MATCHES = []

def resolve_exception(exception_id, decision, selected_combination=None, notes=''):
    """
    Resolve an exception with human decision
    
    Args:
        exception_id: string, ID of the exception
        decision: 'confirm' | 'reject' | 'investigate'
        selected_combination: list of order IDs (for ambiguous_batch)
        notes: string, optional notes
    
    Returns:
        dict with resolution result
    """
    result = {
        'exception_id': exception_id,
        'decision': decision,
        'timestamp': datetime.now().isoformat(),
        'status': 'resolved'
    }
    
    if decision == 'confirm':
        result['selected_combination'] = selected_combination or []
        result['message'] = f'Exception {exception_id} confirmed with {len(result["selected_combination"])} orders'
        
        # Store verified match
        add_verified_match(exception_id, selected_combination, notes)
    
    elif decision == 'reject':
        result['message'] = f'Exception {exception_id} rejected'
    
    elif decision == 'investigate':
        result['status'] = 'investigating'
        result['message'] = f'Exception {exception_id} marked for investigation'
    
    return result

def add_verified_match(settlement_id, order_ids, notes=''):
    """Store a verified match for future reference"""
    VERIFIED_MATCHES.append({
        'settlement_id': settlement_id,
        'order_ids': order_ids or [],
        'verified_at': datetime.now().isoformat(),
        'notes': notes,
        'source': 'human_review'
    })

def get_verified_matches():
    """Get all verified matches"""
    return VERIFIED_MATCHES