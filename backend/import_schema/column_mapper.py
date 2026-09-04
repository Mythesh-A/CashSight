"""
Column Mapper - Maps user columns to CashSight schema
"""

import pandas as pd

def get_confidence_score(mapping_result):
    """
    Calculate overall confidence score for the mapping
    
    Args:
        mapping_result: dict from analyze_csv
    
    Returns:
        float: confidence score (0-1)
    """
    if not mapping_result or 'mapping' not in mapping_result:
        return 0.0
    
    mapping = mapping_result['mapping']
    if not mapping:
        return 0.0
    
    # Average confidence of all mapped fields
    confidences = [m['confidence'] for m in mapping.values()]
    return round(sum(confidences) / len(confidences), 2)

def map_columns(df, column_mapping, file_type):
    """
    Map user columns to CashSight schema
    
    Args:
        df: pandas DataFrame with original columns
        column_mapping: dict mapping CashSight fields to user column names
                       e.g., {'order_id': 'order_no', 'gross_amount': 'amount'}
        file_type: 'ledger' | 'settlement' | 'bank'
    
    Returns:
        pandas DataFrame with standardized column names
    """
    # Create a new DataFrame with mapped columns
    mapped_df = pd.DataFrame()
    
    # Define the expected schema for each file type
    schemas = {
        'ledger': ['order_id', 'order_date', 'gross_amount', 'customer_id', 'status'],
        'settlement': ['settlement_id', 'utr', 'settlement_date', 'gross_amount', 
                      'razorpay_fee', 'gst_on_fee', 'tds_deducted', 'net_amount'],
        'bank': ['txn_id', 'value_date', 'utr', 'credited_amount', 'narration']
    }
    
    expected_fields = schemas.get(file_type, [])
    
    for field in expected_fields:
        if field in column_mapping:
            user_column = column_mapping[field]
            if user_column in df.columns:
                mapped_df[field] = df[user_column]
            else:
                # Column not found in user data
                mapped_df[field] = None
    
    return mapped_df

def apply_mapping_to_dataframe(df, mapping_dict):
    """
    Apply mapping to existing DataFrame
    
    Args:
        df: pandas DataFrame
        mapping_dict: dict where key is target column, value is source column
    
    Returns:
        dict with original columns renamed
    """
    result = {}
    
    for target, source in mapping_dict.items():
        if source in df.columns:
            result[target] = df[source].tolist()
        else:
            result[target] = None
    
    return result