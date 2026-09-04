"""
Verified Matches - Stores human-verified matches
"""

# In-memory storage for verified matches
VERIFIED_MATCHES = []

def get_verified_matches():
    """Get all verified matches"""
    return VERIFIED_MATCHES

def add_verified_match(settlement_id, order_ids, notes='', user='system'):
    """Add a verified match"""
    VERIFIED_MATCHES.append({
        'settlement_id': settlement_id,
        'order_ids': order_ids or [],
        'verified_at': __import__('datetime').datetime.now().isoformat(),
        'notes': notes,
        'user': user,
        'source': 'human_review'
    })

def clear_verified_matches():
    """Clear all verified matches (for testing)"""
    VERIFIED_MATCHES.clear()