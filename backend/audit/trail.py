"""
Audit Trail - Retrieves and formats audit trails
"""

from backend.audit.logger import get_audit_log

def get_trail(settlement_id):
    """
    Get formatted audit trail for a specific settlement
    
    Args:
        settlement_id: string
    
    Returns:
        list of formatted audit events
    """
    logs = get_audit_log(target=settlement_id)
    
    # Format for display
    trail = []
    for log in logs:
        trail.append({
            'time': log['timestamp'],
            'action': log['action'],
            'description': _format_action(log['action'], log['details']),
            'user': log['user']
        })
    
    return trail

def _format_action(action, details):
    """Format an action for display"""
    descriptions = {
        'reconciliation_started': 'Reconciliation process started',
        'reconciliation_completed': 'Reconciliation completed',
        'batch_matched': f"Batch matched: {details.get('order_count', 0)} orders",
        'exception_detected': f"Exception detected: {details.get('exception_type', 'unknown')}",
        'resolve_exception': f"Exception resolved: {details.get('decision', 'unknown')}",
        'explain_exception': 'Exception explanation requested'
    }
    
    return descriptions.get(action, f"{action} ({details})")