"""
Tax & Fee Report - PDF content builder
"""

from reportlab.platypus import Paragraph, Spacer, Table, PageBreak, HRFlowable
from reportlab.lib import colors
from reportlab.lib.units import inch, cm


class TaxFeeReport:
    """Builds the Tax & Fee Analysis Report content"""

    def build(self, tax_result, generator):
        story = []

        summary = tax_result.get('summary', {})
        rates = tax_result.get('rates', {})
        settlements = tax_result.get('settlements', [])
        monthly = tax_result.get('monthly_breakdown', [])
        validation = tax_result.get('validation_status', {})

        # ============================================
        # SECTION 1: TAX & FEE SUMMARY
        # ============================================
        story.append(Paragraph("1. Tax and Fee Summary", generator.styles['SectionHeader']))
        story.append(Paragraph(
            "This section analyzes the deductions applied to gross settlements, including gateway fees, GST on fees, and TDS deducted at source.",
            generator.styles['BodyText']
        ))
        story.append(Spacer(1, 0.1 * inch))
        
        summary_text = f"""
        <b>Gross Settlements:</b> Rs. {summary.get('gross_amount', 0):,.2f}<br/>
        <b>Gateway Fees:</b> Rs. {summary.get('razorpay_fee', 0):,.2f}<br/>
        <b>GST on Fees:</b> Rs. {summary.get('gst_on_fee', 0):,.2f}<br/>
        <b>TDS Deducted:</b> Rs. {summary.get('tds_deducted', 0):,.2f}<br/>
        <b>Total Deductions:</b> Rs. {summary.get('total_deductions', 0):,.2f}<br/>
        <b>Net Settlement:</b> Rs. {summary.get('net_amount', 0):,.2f}
        """
        story.append(Paragraph(summary_text, generator.styles['BodyText']))
        story.append(Spacer(1, 0.3 * inch))

        # ============================================
        # SECTION 2: DEDUCTION RATES
        # ============================================
        story.append(Paragraph("2. Deduction Rates", generator.styles['SectionHeader']))
        
        fee = summary.get('razorpay_fee', 0)
        gst = summary.get('gst_on_fee', 0)
        gst_on_fee_rate = (gst / fee * 100) if fee > 0 else 0
        
        rates_text = f"""
        <b>Effective Deduction Rate:</b> {rates.get('effective_deduction_rate', 0):.2f}%<br/>
        <b>Gateway Fee Rate:</b> {rates.get('fee_rate', 0):.2f}% of gross<br/>
        <b>GST on Fee Rate:</b> {rates.get('gst_fee_rate', 0):.2f}% of gross<br/>
        <b>TDS Rate:</b> {rates.get('tds_rate', 0):.2f}% of gross
        """
        story.append(Paragraph(rates_text, generator.styles['BodyText']))
        story.append(Spacer(1, 0.1 * inch))
        
        # GST Explanation
        story.append(Paragraph("GST Calculation", generator.styles['SubsectionHeader']))
        story.append(Paragraph(f"""
        The total GST of Rs. {gst:,.2f} represents {gst_on_fee_rate:.1f}% of the 
        total gateway fees of Rs. {fee:,.2f}. This is consistent with the GST rate 
        applied to the gateway service charges.
        """, generator.styles['BodyText']))
        story.append(Spacer(1, 0.3 * inch))

        # ============================================
        # SECTION 3: SETTLEMENT-LEVEL BREAKDOWN - ALL DATA
        # ============================================
        if settlements:
            story.append(PageBreak())
            story.append(Paragraph("3. Settlement-Level Breakdown", generator.styles['SectionHeader']))
            story.append(Paragraph(
                f"Total: {len(settlements)} settlements analyzed.",
                generator.styles['BodyTextSmall']
            ))
            story.append(Spacer(1, 0.1 * inch))
            
            settlement_data = [
                ['Settlement ID', 'Gross', 'Fee', 'GST', 'TDS', 'Net', 'Deduction %']
            ]
            
            # Show ALL settlements
            for s in settlements:
                settlement_data.append([
                    s.get('settlement_id', ''),
                    f"Rs. {s.get('gross_amount', 0):,.2f}",
                    f"Rs. {s.get('razorpay_fee', 0):,.2f}",
                    f"Rs. {s.get('gst_on_fee', 0):,.2f}",
                    f"Rs. {s.get('tds_deducted', 0):,.2f}",
                    f"Rs. {s.get('net_amount', 0):,.2f}",
                    f"{s.get('effective_deduction_rate', 0):.2f}%"
                ])
            
            settlement_table = generator._create_table(settlement_data, col_widths=[1*inch, 1*inch, 1*inch, 0.8*inch, 0.8*inch, 1*inch, 0.8*inch])
            story.append(settlement_table)
            story.append(Spacer(1, 0.2 * inch))

        # ============================================
        # SECTION 4: MONTHLY BREAKDOWN
        # ============================================
        if monthly:
            story.append(PageBreak())
            story.append(Paragraph("4. Monthly Breakdown", generator.styles['SectionHeader']))
            story.append(Paragraph(
                f"Total: {len(monthly)} months of data.",
                generator.styles['BodyTextSmall']
            ))
            story.append(Spacer(1, 0.1 * inch))
            
            monthly_data = [
                ['Month', 'Gross', 'Deductions', 'Net', 'Deduction %', 'Settlements']
            ]
            
            for m in monthly:
                monthly_data.append([
                    m.get('month', ''),
                    f"Rs. {m.get('gross', 0):,.2f}",
                    f"Rs. {m.get('total_deductions', 0):,.2f}",
                    f"Rs. {m.get('net', 0):,.2f}",
                    f"{m.get('effective_deduction_rate', 0):.2f}%",
                    str(m.get('settlement_count', 0))
                ])
            
            monthly_table = generator._create_table(monthly_data, col_widths=[1.2*inch, 1.2*inch, 1.2*inch, 1.2*inch, 1*inch, 1*inch])
            story.append(monthly_table)
            story.append(Spacer(1, 0.2 * inch))

        # ============================================
        # SECTION 5: VALIDATION RESULTS
        # ============================================
        if validation.get('mismatches', 0) > 0:
            story.append(PageBreak())
            story.append(Paragraph("5. Validation Results", generator.styles['SectionHeader']))
            story.append(Paragraph(f"""
            <b>Total Settlements:</b> {validation.get('total', 0)}<br/>
            <b>Valid Settlements:</b> {validation.get('valid', 0)}<br/>
            <b>Calculation Mismatches:</b> {validation.get('mismatches', 0)}
            """, generator.styles['BodyText']))
            story.append(Spacer(1, 0.1 * inch))
            
            if validation.get('mismatches', 0) > 0:
                story.append(Paragraph(
                    "Settlement calculations should be reviewed to ensure accuracy.",
                    generator.styles['BodyText']
                ))
            story.append(Spacer(1, 0.3 * inch))

        # ============================================
        # FOOTER
        # ============================================
        story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#dddddd'), spaceAfter=0.2*cm))
        story.append(Paragraph(
            "This report is generated automatically by CashSight based on the uploaded settlement data.",
            generator.styles['BodyTextSmall']
        ))

        return story