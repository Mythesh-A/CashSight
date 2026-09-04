"""
Reconciliation Report - PDF content builder
"""

from datetime import datetime
from reportlab.platypus import Paragraph, Spacer, Table, PageBreak, HRFlowable
from reportlab.lib import colors
from reportlab.lib.units import inch,cm


class ReconciliationReport:
    """Builds the Reconciliation Report content"""

    def build(self, matches, exceptions, settlements, bank, generator):
        story = []

        # ============================================
        # SECTION 1: EXECUTIVE SUMMARY
        # ============================================
        story.append(Paragraph("1. Executive Summary", generator.styles['SectionHeader']))
        
        total_settlements = len(matches) + len(exceptions)
        matched_count = len(matches)
        exception_count = len(exceptions)
        current_cash = sum(b.get('credited_amount', 0) for b in bank) if bank else 0
        pending = sum(e.get('amount', 0) for e in exceptions)
        
        summary_text = f"""
        CashSight processed {total_settlements} settlement records, of which 
        {matched_count} were successfully reconciled and {exception_count} 
        require further review. The current cash position is Rs. {current_cash:,.2f}, 
        with Rs. {pending:,.2f} in pending settlements requiring investigation.
        """
        story.append(Paragraph(summary_text, generator.styles['BodyText']))
        story.append(Spacer(1, 0.2 * inch))

        # ============================================
        # SECTION 2: RECONCILIATION SUMMARY
        # ============================================
        story.append(Paragraph("2. Reconciliation Summary", generator.styles['SectionHeader']))
        
        summary_data = [
            ['Metric', 'Value'],
            ['Total Settlements', str(total_settlements)],
            ['Matched Settlements', str(matched_count)],
            ['Exceptions', str(exception_count)],
            ['Match Rate', f"{round(matched_count / total_settlements * 100, 1) if total_settlements > 0 else 0}%"],
            ['Current Cash', f"Rs. {current_cash:,.2f}"],
            ['Pending Amount', f"Rs. {pending:,.2f}"],
        ]
        
        summary_table = generator._create_table(summary_data, col_widths=[3*inch, 3*inch])
        story.append(summary_table)
        story.append(Spacer(1, 0.3 * inch))

        # ============================================
        # SECTION 3: MATCHED SETTLEMENTS - ALL DATA
        # ============================================
        if matches:
            story.append(PageBreak())
            story.append(Paragraph("3. Matched Settlements", generator.styles['SectionHeader']))
            story.append(Paragraph(
                f"Total: {len(matches)} settlements successfully matched.",
                generator.styles['BodyTextSmall']
            ))
            story.append(Spacer(1, 0.1 * inch))
            
            match_data = [
                ['Settlement ID', 'UTR', 'Date', 'Gross', 'Net', 'Type']
            ]
            
            # Show ALL matches
            for m in matches:
                match_data.append([
                    m.get('settlement_id', ''),
                    m.get('utr', ''),
                    m.get('settlement_date', ''),
                    f"Rs. {m.get('gross_amount', 0):,.2f}",
                    f"Rs. {m.get('net_amount', 0):,.2f}",
                    m.get('match_type', '').replace('_', ' ').title()
                ])
            
            # Use smaller font for large tables
            match_table = generator._create_table(match_data, col_widths=[1.2*inch, 1.2*inch, 0.8*inch, 1.2*inch, 1.2*inch, 1.2*inch])
            story.append(match_table)
            story.append(Spacer(1, 0.2 * inch))

        # ============================================
        # SECTION 4: EXCEPTIONS - NO DETAILS COLUMN
        # ============================================
        if exceptions:
            story.append(PageBreak())
            story.append(Paragraph("4. Exceptions Requiring Attention", generator.styles['SectionHeader']))
            story.append(Paragraph(
                f"Total: {len(exceptions)} exceptions requiring review.",
                generator.styles['BodyTextSmall']
            ))
            story.append(Spacer(1, 0.1 * inch))
            
            exception_data = [
                ['Settlement ID', 'UTR', 'Exception Type', 'Amount']
            ]
            
            for e in exceptions:
                exception_data.append([
                    e.get('settlement_id', '') or e.get('txn_id', ''),
                    e.get('utr', ''),
                    e.get('exception_type', '').replace('_', ' ').title(),
                    f"Rs. {e.get('amount', 0):,.2f}"
                ])
            
            exception_table = generator._create_table(exception_data, col_widths=[1.5*inch, 1.5*inch, 2*inch, 1.5*inch])
            story.append(exception_table)
            story.append(Spacer(1, 0.2 * inch))

        # ============================================
        # SECTION 5: KEY FINDINGS
        # ============================================
        story.append(PageBreak())
        story.append(Paragraph("5. Key Findings and Recommendations", generator.styles['SectionHeader']))
        
        findings = []
        if matched_count > 0:
            findings.append(f"• {matched_count} settlements were successfully reconciled, representing a {round(matched_count / total_settlements * 100, 1) if total_settlements > 0 else 0}% match rate.")
        if exception_count > 0:
            findings.append(f"• {exception_count} exceptions were identified and require investigation.")
        if pending > 0:
            findings.append(f"• Rs. {pending:,.2f} in pending settlements need to be resolved.")
        
        if matched_count == total_settlements:
            findings.append("• All settlements have been successfully reconciled.")
        
        for finding in findings:
            story.append(Paragraph(finding, generator.styles['BodyText']))
        
        story.append(Spacer(1, 0.2 * inch))
        
        # Recommendations
        story.append(Paragraph("Recommendations", generator.styles['SubsectionHeader']))
        
        recommendations = []
        if exception_count > 0:
            recommendations.append("Review and resolve all exceptions to achieve complete reconciliation.")
        if pending > 0:
            recommendations.append("Investigate pending settlements and reconcile with bank records.")
        if matched_count < total_settlements:
            recommendations.append("Improve reconciliation processes to increase the match rate.")
        
        if not recommendations:
            recommendations.append("All settlements have been successfully reconciled. Continue regular monitoring.")
        
        for rec in recommendations:
            story.append(Paragraph(f"• {rec}", generator.styles['BodyText']))
        
        story.append(Spacer(1, 0.3 * inch))
        story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#dddddd'), spaceAfter=0.2*cm))
        story.append(Paragraph(
            "This report is generated automatically by CashSight based on the uploaded data.",
            generator.styles['BodyTextSmall']
        ))

        return story