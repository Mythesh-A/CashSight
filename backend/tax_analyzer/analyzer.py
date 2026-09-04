"""
Tax & Fee Analyzer - Core analysis logic
"""

from datetime import datetime
from collections import defaultdict


class TaxAnalyzer:
    """Analyzes tax and fee data from settlements"""

    def __init__(self, settlements):
        self.settlements = settlements
        self.analysis = None

    def analyze(self):
        """Run full analysis on settlements data"""
        if not self.settlements:
            return self._empty_result()

        # Validate and process each settlement
        processed_settlements = []
        exceptions = []
        total_gross = 0
        total_fee = 0
        total_gst = 0
        total_tds = 0
        total_net = 0
        valid_count = 0
        mismatch_count = 0

        # Monthly aggregation
        monthly_data = defaultdict(lambda: {
            'gross': 0,
            'fee': 0,
            'gst': 0,
            'tds': 0,
            'net': 0,
            'count': 0
        })

        for settlement in self.settlements:
            # Extract values
            settlement_id = settlement.get('settlement_id', '')
            utr = settlement.get('utr', '')
            settlement_date = settlement.get('settlement_date', '')
            gross = float(settlement.get('gross_amount', 0))
            fee = float(settlement.get('razorpay_fee', 0))
            gst = float(settlement.get('gst_on_fee', 0))
            tds = float(settlement.get('tds_deducted', 0))
            net = float(settlement.get('net_amount', 0))

            # Validate calculation
            calculated_net = gross - fee - gst - tds
            is_valid = abs(calculated_net - net) <= 0.01

            # Flag issues
            issues = []
            if not is_valid:
                issues.append({
                    'type': 'CALCULATION_MISMATCH',
                    'source_net': net,
                    'calculated_net': round(calculated_net, 2),
                    'difference': round(calculated_net - net, 2)
                })
                mismatch_count += 1
            else:
                valid_count += 1

            if gross < 0:
                issues.append({'type': 'NEGATIVE_GROSS', 'value': gross})
            if fee < 0:
                issues.append({'type': 'NEGATIVE_FEE', 'value': fee})
            if gst < 0:
                issues.append({'type': 'NEGATIVE_GST', 'value': gst})
            if tds < 0:
                issues.append({'type': 'NEGATIVE_TDS', 'value': tds})

            total_deductions = fee + gst + tds

            # Check excessive deductions
            if total_deductions > gross and gross > 0:
                issues.append({
                    'type': 'EXCESSIVE_DEDUCTIONS',
                    'deductions': round(total_deductions, 2),
                    'gross': round(gross, 2)
                })

            # Calculate effective deduction rate for this settlement
            deduction_rate = (total_deductions / gross * 100) if gross > 0 else 0

            # Add to processed list
            processed_settlements.append({
                'settlement_id': settlement_id,
                'utr': utr,
                'settlement_date': settlement_date,
                'gross_amount': round(gross, 2),
                'razorpay_fee': round(fee, 2),
                'gst_on_fee': round(gst, 2),
                'tds_deducted': round(tds, 2),
                'net_amount': round(net, 2),
                'calculated_net': round(calculated_net, 2),
                'total_deductions': round(total_deductions, 2),
                'effective_deduction_rate': round(deduction_rate, 2),
                'is_valid': is_valid,
                'issues': issues
            })

            # Aggregate totals
            total_gross += gross
            total_fee += fee
            total_gst += gst
            total_tds += tds
            total_net += net

            # Monthly aggregation
            if settlement_date:
                try:
                    date_obj = datetime.strptime(settlement_date, "%Y-%m-%d")
                    month_key = date_obj.strftime("%Y-%m")
                    monthly_data[month_key]['gross'] += gross
                    monthly_data[month_key]['fee'] += fee
                    monthly_data[month_key]['gst'] += gst
                    monthly_data[month_key]['tds'] += tds
                    monthly_data[month_key]['net'] += net
                    monthly_data[month_key]['count'] += 1
                except:
                    pass

        # Calculate summary
        total_deductions = total_fee + total_gst + total_tds
        effective_rate = (total_deductions / total_gross * 100) if total_gross > 0 else 0
        fee_rate = (total_fee / total_gross * 100) if total_gross > 0 else 0
        gst_rate = (total_gst / total_gross * 100) if total_gross > 0 else 0
        tds_rate = (total_tds / total_gross * 100) if total_gross > 0 else 0

        # Monthly breakdown
        monthly_breakdown = []
        for month_key in sorted(monthly_data.keys()):
            data = monthly_data[month_key]
            month_deductions = data['fee'] + data['gst'] + data['tds']
            monthly_breakdown.append({
                'month': month_key,
                'gross': round(data['gross'], 2),
                'fee': round(data['fee'], 2),
                'gst': round(data['gst'], 2),
                'tds': round(data['tds'], 2),
                'total_deductions': round(month_deductions, 2),
                'net': round(data['net'], 2),
                'settlement_count': data['count'],
                'effective_deduction_rate': round((month_deductions / data['gross'] * 100), 2) if data['gross'] > 0 else 0
            })

        # Collect exceptions
        exception_list = []
        for s in processed_settlements:
            if s['issues']:
                for issue in s['issues']:
                    exception_list.append({
                        'settlement_id': s['settlement_id'],
                        'utr': s['utr'],
                        'issue': issue
                    })

        return {
            'summary': {
                'total_settlements': len(self.settlements),
                'gross_amount': round(total_gross, 2),
                'razorpay_fee': round(total_fee, 2),
                'gst_on_fee': round(total_gst, 2),
                'tds_deducted': round(total_tds, 2),
                'total_deductions': round(total_deductions, 2),
                'net_amount': round(total_net, 2),
                'valid_count': valid_count,
                'mismatch_count': mismatch_count
            },
            'rates': {
                'effective_deduction_rate': round(effective_rate, 2),
                'fee_rate': round(fee_rate, 2),
                'gst_fee_rate': round(gst_rate, 2),
                'tds_rate': round(tds_rate, 2)
            },
            'settlements': processed_settlements,
            'monthly_breakdown': monthly_breakdown,
            'exceptions': exception_list,
            'validation_status': {
                'total': len(self.settlements),
                'valid': valid_count,
                'mismatches': mismatch_count,
                'has_errors': mismatch_count > 0
            }
        }

    def _empty_result(self):
        """Return empty result when no settlements data"""
        return {
            'summary': {
                'total_settlements': 0,
                'gross_amount': 0,
                'razorpay_fee': 0,
                'gst_on_fee': 0,
                'tds_deducted': 0,
                'total_deductions': 0,
                'net_amount': 0,
                'valid_count': 0,
                'mismatch_count': 0
            },
            'rates': {
                'effective_deduction_rate': 0,
                'fee_rate': 0,
                'gst_fee_rate': 0,
                'tds_rate': 0
            },
            'settlements': [],
            'monthly_breakdown': [],
            'exceptions': [],
            'validation_status': {
                'total': 0,
                'valid': 0,
                'mismatches': 0,
                'has_errors': False
            }
        }