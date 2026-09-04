"""
Data Validator - Checks data quality before reconciliation
"""

import pandas as pd
import numpy as np
from datetime import datetime

class DataQualityReport:
    """Container for data quality report"""
    def __init__(self, valid, issues, summary):
        self.valid = valid
        self.issues = issues
        self.summary = summary
    
    def to_dict(self):
        """Convert to dictionary for JSON response"""
        return {
            'valid': self.valid,
            'issues': self.issues,
            'summary': self.summary
        }
    
    def has_critical_issues(self):
        """Check if there are any critical issues"""
        return any(i.get('severity') == 'error' for i in self.issues)
    
    def get_issue_summary(self):
        """Get a human-readable summary of issues"""
        if not self.issues:
            return "✅ All data quality checks passed!"
        
        lines = []
        for issue in self.issues:
            severity = issue.get('severity', 'info')
            emoji = '🔴' if severity == 'error' else '🟡' if severity == 'warning' else 'ℹ️'
            lines.append(f"{emoji} {issue.get('message', '')}")
        
        return '\n'.join(lines)

def validate_data(ledger_df, settlements_df, bank_df):
    """
    Validate all three data sources for quality issues
    Now with lenient validation - warnings instead of errors for missing columns
    """
    issues = []
    summary = {}
    
    # Validate Ledger
    if ledger_df is not None and not ledger_df.empty:
        ledger_issues = _validate_ledger_lenient(ledger_df)
        issues.extend(ledger_issues)
        summary['orders_loaded'] = len(ledger_df)
    else:
        summary['orders_loaded'] = 0
        issues.append({
            'type': 'missing_data',
            'source': 'ledger',
            'message': 'No ledger data found',
            'severity': 'warning'  # Changed from 'error' to 'warning'
        })
    
    # Validate Settlements
    if settlements_df is not None and not settlements_df.empty:
        settlement_issues = _validate_settlements_lenient(settlements_df)
        issues.extend(settlement_issues)
        summary['settlements_loaded'] = len(settlements_df)
    else:
        summary['settlements_loaded'] = 0
        issues.append({
            'type': 'missing_data',
            'source': 'settlement',
            'message': 'No settlement data found',
            'severity': 'warning'  # Changed from 'error' to 'warning'
        })
    
    # Validate Bank
    if bank_df is not None and not bank_df.empty:
        bank_issues = _validate_bank_lenient(bank_df)
        issues.extend(bank_issues)
        summary['bank_txns_loaded'] = len(bank_df)
    else:
        summary['bank_txns_loaded'] = 0
        issues.append({
            'type': 'missing_data',
            'source': 'bank',
            'message': 'No bank data found',
            'severity': 'warning'  # Changed from 'error' to 'warning'
        })
    
    # Always return valid - let the user continue
    valid = True
    
    summary.update({
        'duplicates': len([i for i in issues if i['type'] == 'duplicate']),
        'missing_utrs': len([i for i in issues if i['type'] == 'missing_utr']),
        'invalid_dates': len([i for i in issues if i['type'] == 'invalid_date']),
        'total_issues': len(issues),
        'critical_issues': 0
    })
    
    return {
        'valid': valid,
        'issues': issues,
        'summary': summary
    }

def _validate_ledger_lenient(df):
    """Validate ledger data - lenient version"""
    issues = []
    
    # Check for recommended columns (not required)
    recommended_cols = ['order_id', 'order_date', 'gross_amount']
    for col in recommended_cols:
        if col not in df.columns:
            issues.append({
                'type': 'missing_column',
                'source': 'ledger',
                'column': col,
                'message': f'Recommended column "{col}" not found - will be mapped',
                'severity': 'info'  # Just info, not an error
            })
    
    # Check duplicates (only if column exists)
    if 'order_id' in df.columns:
        dupes = df[df.duplicated(['order_id'], keep=False)]
        if not dupes.empty:
            issues.append({
                'type': 'duplicate',
                'source': 'ledger',
                'count': len(dupes),
                'details': dupes['order_id'].head(10).tolist(),
                'message': f'Found {len(dupes)} duplicate order IDs',
                'severity': 'warning'
            })
    
    return issues

def _validate_settlements_lenient(df):
    """Validate settlement data - lenient version"""
    issues = []
    
    recommended_cols = ['settlement_id', 'utr', 'settlement_date', 'gross_amount']
    for col in recommended_cols:
        if col not in df.columns:
            issues.append({
                'type': 'missing_column',
                'source': 'settlement',
                'column': col,
                'message': f'Recommended column "{col}" not found - will be mapped',
                'severity': 'info'
            })
    
    if 'utr' in df.columns:
        missing_utrs = df[df['utr'].isna() | (df['utr'] == '')]
        if not missing_utrs.empty:
            issues.append({
                'type': 'missing_utr',
                'source': 'settlement',
                'count': len(missing_utrs),
                'message': f'Found {len(missing_utrs)} settlements missing UTR',
                'severity': 'warning'
            })
    
    return issues

def _validate_bank_lenient(df):
    """Validate bank data - lenient version"""
    issues = []
    
    recommended_cols = ['txn_id', 'utr', 'value_date', 'credited_amount']
    for col in recommended_cols:
        if col not in df.columns:
            issues.append({
                'type': 'missing_column',
                'source': 'bank',
                'column': col,
                'message': f'Recommended column "{col}" not found - will be mapped',
                'severity': 'info'
            })
    
    return issues

def _validate_ledger(df):
    """Validate ledger data"""
    issues = []
    
    # Check required columns
    required_cols = ['order_id', 'order_date', 'gross_amount']
    for col in required_cols:
        if col not in df.columns:
            issues.append({
                'type': 'missing_column',
                'source': 'ledger',
                'column': col,
                'message': f'Required column "{col}" is missing',
                'severity': 'error'
            })
    
    if 'order_id' in df.columns:
        # Check for duplicate order IDs
        dupes = df[df.duplicated(['order_id'], keep=False)]
        if not dupes.empty:
            issues.append({
                'type': 'duplicate',
                'source': 'ledger',
                'count': len(dupes),
                'details': dupes['order_id'].head(10).tolist(),  # First 10
                'message': f'Found {len(dupes)} duplicate order IDs',
                'severity': 'warning'
            })
    
    if 'order_date' in df.columns:
        # Check invalid dates
        try:
            invalid_dates = df[pd.to_datetime(df['order_date'], errors='coerce').isna()]
            if not invalid_dates.empty:
                issues.append({
                    'type': 'invalid_date',
                    'source': 'ledger',
                    'count': len(invalid_dates),
                    'message': f'Found {len(invalid_dates)} invalid dates',
                    'severity': 'warning'
                })
        except:
            pass
    
    if 'gross_amount' in df.columns:
        # Check negative amounts
        negatives = df[df['gross_amount'] < 0]
        if not negatives.empty:
            issues.append({
                'type': 'negative_amount',
                'source': 'ledger',
                'count': len(negatives),
                'message': f'Found {len(negatives)} negative amounts',
                'severity': 'warning'
            })
    
    return issues

def _validate_settlements(df):
    """Validate settlement data"""
    issues = []
    
    required_cols = ['settlement_id', 'utr', 'settlement_date', 'gross_amount']
    for col in required_cols:
        if col not in df.columns:
            issues.append({
                'type': 'missing_column',
                'source': 'settlement',
                'column': col,
                'message': f'Required column "{col}" is missing',
                'severity': 'error'
            })
    
    if 'utr' in df.columns:
        # Check missing UTRs
        missing_utrs = df[df['utr'].isna() | (df['utr'] == '')]
        if not missing_utrs.empty:
            issues.append({
                'type': 'missing_utr',
                'source': 'settlement',
                'count': len(missing_utrs),
                'message': f'Found {len(missing_utrs)} settlements missing UTR',
                'severity': 'warning'
            })
    
    return issues

def _validate_bank(df):
    """Validate bank data"""
    issues = []
    
    required_cols = ['txn_id', 'utr', 'value_date', 'credited_amount']
    for col in required_cols:
        if col not in df.columns:
            issues.append({
                'type': 'missing_column',
                'source': 'bank',
                'column': col,
                'message': f'Required column "{col}" is missing',
                'severity': 'error'
            })
    
    return issues

def _validate_cross_references(ledger_df, settlements_df, bank_df):
    """Cross-validate between datasets"""
    issues = []
    
    # Check UTR consistency between settlements and bank
    if settlements_df is not None and bank_df is not None:
        if 'utr' in settlements_df.columns and 'utr' in bank_df.columns:
            settlement_utrs = set(settlements_df['utr'].dropna().tolist())
            bank_utrs = set(bank_df['utr'].dropna().tolist())
            
            if settlement_utrs and bank_utrs:
                # UTRs in settlements but not in bank
                missing_in_bank = settlement_utrs - bank_utrs
                if missing_in_bank:
                    issues.append({
                        'type': 'cross_reference',
                        'subtype': 'settlement_no_bank',
                        'count': len(missing_in_bank),
                        'message': f'{len(missing_in_bank)} settlements have no matching bank UTR',
                        'severity': 'info'
                    })
    
    return issues