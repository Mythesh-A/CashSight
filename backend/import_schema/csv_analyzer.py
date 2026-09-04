"""
CSV Analyzer - Detects column types and suggests mappings
"""

import re
from datetime import datetime

# Common column name patterns for each data type
LEDGER_PATTERNS = {
    'order_id': ['order_id', 'orderid', 'order number', 'order_no', 'order_no', 'order', 'id'],
    'order_date': ['order_date', 'orderdate', 'date', 'order date', 'created_at', 'createdat', 'transaction_date', 'txn_date'],
    'gross_amount': ['gross_amount', 'amount', 'gross', 'order_amount', 'orderamount', 'total', 'total_amount', 'value'],
    'customer_id': ['customer_id', 'customerid', 'customer', 'user_id', 'userid', 'client_id', 'clientid'],
    'status': ['status', 'order_status', 'payment_status', 'state', 'current_status']
}

SETTLEMENT_PATTERNS = {
    'settlement_id': ['settlement_id', 'settlementid', 'settlement no', 'settlement_no', 'stl_id', 'ref_id'],
    'utr': ['utr', 'utr_number', 'utr_no', 'bank_ref', 'reference_no', 'ref_no', 'transaction_id'],
    'settlement_date': ['settlement_date', 'settlementdate', 'date', 'settlement date', 'txn_date', 'value_date'],
    'gross_amount': ['gross_amount', 'gross', 'total_amount', 'amount', 'bill_amount', 'settlement_amount'],
    'razorpay_fee': ['razorpay_fee', 'fee', 'razorpay_fees', 'platform_fee', 'service_fee', 'pg_charge'],
    'gst_on_fee': ['gst_on_fee', 'gst', 'tax', 'gst_amount', 'tax_amount'],
    'tds_deducted': ['tds_deducted', 'tds', 'tds_amount', 'withholding_tax'],
    'net_amount': ['net_amount', 'net', 'net_settlement', 'settled_amount', 'credited_amount']
}

BANK_PATTERNS = {
    'txn_id': ['txn_id', 'transaction_id', 'txnid', 'transaction_no', 'bank_ref_no', 'reference_id'],
    'value_date': ['value_date', 'valuedate', 'value date', 'date', 'transaction_date', 'txn_date', 'bank_date'],
    'utr': ['utr', 'utr_number', 'utr_no', 'bank_utr', 'reference_no', 'ref_no'],
    'credited_amount': ['credited_amount', 'credit_amount', 'credit', 'amount', 'deposit', 'inflow', 'received'],
    'narration': ['narration', 'description', 'remarks', 'particulars', 'details', 'transaction_details']
}

def _score_column_name(column_name, patterns):
    """Score how well a column name matches a pattern"""
    col_lower = column_name.lower().strip()
    col_normalized = re.sub(r'[_\s]+', '_', col_lower)
    
    best_score = 0
    best_match = None
    
    for key, pattern_list in patterns.items():
        for pattern in pattern_list:
            pattern_normalized = re.sub(r'[_\s]+', '_', pattern.lower())
            
            # Exact match
            if col_normalized == pattern_normalized:
                return 1.0, key
            
            # Contains match (partial)
            if pattern_normalized in col_normalized:
                score = 0.8
                if score > best_score:
                    best_score = score
                    best_match = key
            
            # Word match (for multi-word column names)
            col_words = set(col_normalized.split('_'))
            pattern_words = set(pattern_normalized.split('_'))
            common_words = col_words.intersection(pattern_words)
            if common_words:
                score = 0.6 * (len(common_words) / max(len(pattern_words), 1))
                if score > best_score:
                    best_score = score
                    best_match = key
    
    return best_score, best_match

def detect_file_type(headers):
    """Detect which type of file this is based on headers"""
    header_str = ' '.join(headers).lower()
    
    # Count matches for each type
    scores = {
        'ledger': 0,
        'settlement': 0,
        'bank': 0
    }
    
    # Check for unique identifiers
    if any(word in header_str for word in ['order_id', 'orderid', 'customer_id']):
        scores['ledger'] += 3
    if any(word in header_str for word in ['settlement_id', 'settlementid', 'utr', 'tds']):
        scores['settlement'] += 3
    if any(word in header_str for word in ['txn_id', 'transaction_id', 'narration']):
        scores['bank'] += 3
    
    # Check amounts
    if 'gross_amount' in header_str or 'order_amount' in header_str:
        scores['ledger'] += 2
    if 'net_amount' in header_str or 'razorpay_fee' in header_str:
        scores['settlement'] += 2
    if 'credited_amount' in header_str or 'credit' in header_str:
        scores['bank'] += 2
    
    # Check dates
    if 'order_date' in header_str:
        scores['ledger'] += 2
    if 'settlement_date' in header_str:
        scores['settlement'] += 2
    if 'value_date' in header_str:
        scores['bank'] += 2
    
    # Determine type
    file_type = max(scores, key=scores.get)
    confidence = scores[file_type] / max(sum(scores.values()), 1)
    
    return file_type, min(confidence, 1.0)

def analyze_csv(df, filename):
    """
    Analyze CSV structure and suggest mappings
    
    Args:
        df: pandas DataFrame
        filename: string, original filename
    
    Returns:
        dict with mapping suggestions
    """
    headers = df.columns.tolist()
    
    # Detect file type
    file_type, confidence = detect_file_type(headers)
    
    # Select appropriate patterns
    if file_type == 'ledger':
        patterns = LEDGER_PATTERNS
    elif file_type == 'settlement':
        patterns = SETTLEMENT_PATTERNS
    else:
        patterns = BANK_PATTERNS
    
    # Score each header against patterns
    mapping = {}
    mapped_headers = set()
    
    for header in headers:
        best_score, best_field = _score_column_name(header, patterns)
        if best_score >= 0.5:  # Only suggest if confidence is decent
            mapping[best_field] = {
                'column': header,
                'confidence': round(best_score, 2)
            }
            mapped_headers.add(header)
    
    # Handle unmapped headers with low confidence
    for header in headers:
        if header not in mapped_headers:
            # Try to find any match
            for field, pattern_list in patterns.items():
                if field not in mapping:  # Only if field isn't already mapped
                    score, _ = _score_column_name(header, {field: pattern_list})
                    if score >= 0.3:
                        mapping[field] = {
                            'column': header,
                            'confidence': round(score, 2)
                        }
                        break
    
    return {
        'file_type': file_type,
        'confidence': round(confidence, 2),
        'mapping': mapping,
        'unmapped_headers': [h for h in headers if h not in mapped_headers]
    }