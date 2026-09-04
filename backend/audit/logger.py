"""
Audit Logger - Logs every action for traceability
"""

from datetime import datetime
import json

# In-memory audit log (use database in production)
AUDIT_LOG = []

def log_action(action, target, details=None, user='system'):
    """
    Log an action to the audit trail
    
    Args:
        action: string, action performed
        target: string, target ID (settlement_id, exception_id, etc.)
        details: dict, additional details
        user: string, user identifier
    """
    log_entry = {
        'timestamp': datetime.now().isoformat(),
        'action': action,
        'target': target,
        'user': user,
        'details': details or {}
    }
    
    AUDIT_LOG.append(log_entry)
    
    # Keep only last 1000 entries (for demo)
    if len(AUDIT_LOG) > 1000:
        AUDIT_LOG.pop(0)
    
    return log_entry

def get_audit_log(target=None, action=None, limit=100):
    """
    Get audit log entries with optional filtering
    
    Args:
        target: string, filter by target
        action: string, filter by action
        limit: int, max entries to return
    """
    logs = AUDIT_LOG
    
    if target:
        logs = [l for l in logs if l['target'] == target]
    
    if action:
        logs = [l for l in logs if l['action'] == action]
    
    # Return most recent first
    return logs[-limit:][::-1]