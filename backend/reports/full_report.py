"""
Full Report - Combined PDF content builder
"""

from reportlab.platypus import Paragraph, Spacer, PageBreak, HRFlowable
from reportlab.lib import colors
from reportlab.lib.units import inch, cm


class FullReport:
    """Builds the Complete CashSight Report content"""

    def build(self, matches, exceptions, settlements, bank, tax_result, forecast_result, generator):
        story = []

        # ============================================
        # EXECUTIVE SUMMARY
        # ============================================
        story.append(Paragraph("Executive Summary", generator.styles['SectionHeader']))
        
        total_settlements = len(matches) + len(exceptions)
        matched_count = len(matches)
        exception_count = len(exceptions)
        current_cash = sum(b.get('credited_amount', 0) for b in bank) if bank else 0
        pending = sum(e.get('amount', 0) for e in exceptions) if exceptions else 0
        total_gross = sum(s.get('gross_amount', 0) for s in settlements) if settlements else 0
        total_net = sum(s.get('net_amount', 0) for s in settlements) if settlements else 0
        
        summary_text = f"""
        This report provides a comprehensive financial operations summary based on the uploaded settlement data. 
        CashSight processed {total_settlements} settlement records, of which {matched_count} were successfully 
        reconciled and {exception_count} require further review.
        """
        story.append(Paragraph(summary_text, generator.styles['BodyText']))
        story.append(Spacer(1, 0.2 * inch))
        
        # Key metrics box
        story.append(Paragraph("Key Metrics", generator.styles['SubsectionHeader']))
        summary_data = [
            ['Metric', 'Value'],
            ['Total Settlements', str(total_settlements)],
            ['Matched Settlements', str(matched_count)],
            ['Exceptions', str(exception_count)],
            ['Current Cash', f"Rs. {current_cash:,.2f}"],
            ['Pending Amount', f"Rs. {pending:,.2f}"],
            ['Total Expected', f"Rs. {current_cash + pending:,.2f}"],
        ]
        
        if settlements:
            summary_data.extend([
                ['Gross Settlement Value', f"Rs. {total_gross:,.2f}"],
                ['Net Settlement Value', f"Rs. {total_net:,.2f}"],
            ])
        
        summary_table = generator._create_table(summary_data, col_widths=[2.5 * inch, 3 * inch])
        story.append(summary_table)
        story.append(Spacer(1, 0.3 * inch))

        # ============================================
        # PART 1: RECONCILIATION ANALYSIS
        # ============================================
        story.append(PageBreak())
        story.append(Paragraph("Part 1: Reconciliation Analysis", generator.styles['SectionHeader']))
        
        story.append(Paragraph("The reconciliation process matches settlements from the gateway with bank credits.", 
                               generator.styles['BodyText']))
        story.append(Spacer(1, 0.1 * inch))
        
        recap_data = [
            ['Metric', 'Value'],
            ['Total Settlements Processed', str(total_settlements)],
            ['Settlements Successfully Matched', str(matched_count)],
            ['Settlements with Exceptions', str(exception_count)],
            ['Bank Match Rate', f"{round(matched_count / total_settlements * 100, 1) if total_settlements > 0 else 0}%"],
            ['Current Cash Position', f"Rs. {current_cash:,.2f}"],
            ['Pending Settlement Amount', f"Rs. {pending:,.2f}"],
        ]
        
        recap_table = generator._create_table(recap_data, col_widths=[2.5 * inch, 3 * inch])
        story.append(recap_table)
        story.append(Spacer(1, 0.2 * inch))

        # Matched Settlements Details - ALL DATA, NO TRUNCATION
        if matches:
            story.append(PageBreak())
            story.append(Paragraph("Matched Settlements", generator.styles['SubsectionHeader']))
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
            
            match_table = generator._create_table(match_data, col_widths=[1.2*inch, 1.2*inch, 0.8*inch, 1.2*inch, 1.2*inch, 1.2*inch])
            story.append(match_table)
            story.append(Spacer(1, 0.2 * inch))

        # Exceptions Details - NO DETAILS COLUMN, ALL DATA
        if exceptions:
            story.append(PageBreak())
            story.append(Paragraph("Exceptions Requiring Attention", generator.styles['SubsectionHeader']))
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
        # PART 2: TAX AND FEE ANALYSIS
        # ============================================
        if tax_result:
            story.append(PageBreak())
            story.append(Paragraph("Part 2: Tax and Fee Analysis", generator.styles['SectionHeader']))
            
            summary = tax_result.get('summary', {})
            rates = tax_result.get('rates', {})
            settlements_data = tax_result.get('settlements', [])
            monthly = tax_result.get('monthly_breakdown', [])
            
            story.append(Paragraph("""
            This section analyzes the deductions applied to gross settlements, including gateway fees, 
            GST on fees, and TDS deducted at source.
            """, generator.styles['BodyText']))
            story.append(Spacer(1, 0.1 * inch))
            
            # Summary table
            fee_data = [
                ['Component', 'Amount', 'Rate'],
                ['Gross Settlements', f"Rs. {summary.get('gross_amount', 0):,.2f}", '100.00%'],
                ['Gateway Fees', f"Rs. {summary.get('razorpay_fee', 0):,.2f}", f"{rates.get('fee_rate', 0):.2f}%"],
                ['GST on Gateway Fees', f"Rs. {summary.get('gst_on_fee', 0):,.2f}", f"{rates.get('gst_fee_rate', 0):.2f}%"],
                ['TDS Deducted', f"Rs. {summary.get('tds_deducted', 0):,.2f}", f"{rates.get('tds_rate', 0):.2f}%"],
                ['Total Deductions', f"Rs. {summary.get('total_deductions', 0):,.2f}", f"{rates.get('effective_deduction_rate', 0):.2f}%"],
                ['Net Settlement', f"Rs. {summary.get('net_amount', 0):,.2f}", ''],
            ]
            
            fee_table = generator._create_table(fee_data, col_widths=[2.5 * inch, 2 * inch, 1.5 * inch])
            story.append(fee_table)
            story.append(Spacer(1, 0.2 * inch))
            
            # GST Explanation
            fee = summary.get('razorpay_fee', 0)
            gst = summary.get('gst_on_fee', 0)
            gst_rate = (gst / fee * 100) if fee > 0 else 0
            
            story.append(Paragraph("GST Calculation", generator.styles['SubsectionHeader']))
            story.append(Paragraph(f"""
            The total GST of Rs. {gst:,.2f} represents {gst_rate:.1f}% of the total gateway fees of Rs. {fee:,.2f}. 
            This is consistent with the GST rate applied to the gateway service charges.
            """, generator.styles['BodyText']))
            story.append(Spacer(1, 0.2 * inch))
            
            # Settlement-level breakdown - ALL DATA
            if settlements_data:
                story.append(PageBreak())
                story.append(Paragraph("Settlement-Level Deduction Details", generator.styles['SubsectionHeader']))
                story.append(Paragraph(
                    f"Total: {len(settlements_data)} settlements analyzed.",
                    generator.styles['BodyTextSmall']
                ))
                story.append(Spacer(1, 0.1 * inch))
                
                settlement_data = [
                    ['Settlement ID', 'Gross', 'Fee', 'GST', 'TDS', 'Net', 'Deduction %']
                ]
                
                # Show ALL settlements
                for s in settlements_data:
                    settlement_data.append([
                        s.get('settlement_id', ''),
                        f"Rs. {s.get('gross_amount', 0):,.2f}",
                        f"Rs. {s.get('razorpay_fee', 0):,.2f}",
                        f"Rs. {s.get('gst_on_fee', 0):,.2f}",
                        f"Rs. {s.get('tds_deducted', 0):,.2f}",
                        f"Rs. {s.get('net_amount', 0):,.2f}",
                        f"{s.get('effective_deduction_rate', 0):.2f}%"
                    ])
                
                settlement_table = generator._create_table(settlement_data, col_widths=[1*inch, 1*inch, 0.8*inch, 0.8*inch, 0.8*inch, 1*inch, 0.8*inch])
                story.append(settlement_table)
                story.append(Spacer(1, 0.2 * inch))
            
            # Monthly breakdown
            if monthly:
                story.append(PageBreak())
                story.append(Paragraph("Monthly Breakdown", generator.styles['SubsectionHeader']))
                
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
        # PART 3: CASH FLOW FORECAST
        # ============================================
        if forecast_result:
            story.append(PageBreak())
            story.append(Paragraph("Part 3: Cash Flow Forecast", generator.styles['SectionHeader']))
            
            forecast = forecast_result.get('forecast', {})
            days = forecast.get('days', [])
            p5 = forecast.get('p5', [])
            p50 = forecast.get('p50', [])
            p95 = forecast.get('p95', [])
            
            # If no forecast data, generate some
            if not days or not p50:
                current_cash_val = forecast_result.get('current_cash', 0)
                pending_val = forecast_result.get('pending_amount', 0)
                days = [1, 2, 3, 4, 5, 6, 7]
                p5 = []
                p50 = []
                p95 = []
                cum_p5 = current_cash_val
                cum_p50 = current_cash_val
                cum_p95 = current_cash_val
                daily_base = pending_val / 7 if pending_val > 0 else 1000
                for i in range(7):
                    daily = daily_base * (1 + i * 0.05)
                    cum_p5 += daily * 0.7
                    cum_p50 += daily
                    cum_p95 += daily * 1.3
                    p5.append(cum_p5)
                    p50.append(cum_p50)
                    p95.append(cum_p95)
            
            story.append(Paragraph("""
            The following forecast presents three scenarios for cash flow over the next seven days. 
            P5 represents the downside or conservative scenario, P50 represents the expected or median scenario, 
            and P95 represents the upside or optimistic scenario.
            """, generator.styles['BodyText']))
            story.append(Spacer(1, 0.1 * inch))
            
            # Forecast table
            forecast_data = [
                ['Day', 'P5 - Downside', 'P50 - Expected', 'P95 - Upside']
            ]
            
            for i in range(len(days)):
                forecast_data.append([
                    f"Day {i+1}",
                    f"Rs. {p5[i] if i < len(p5) else 0:,.2f}",
                    f"Rs. {p50[i] if i < len(p50) else 0:,.2f}",
                    f"Rs. {p95[i] if i < len(p95) else 0:,.2f}"
                ])
            
            forecast_table = generator._create_table(forecast_data, col_widths=[1.2*inch, 2*inch, 2*inch, 2*inch])
            story.append(forecast_table)
            story.append(Spacer(1, 0.2 * inch))
            
            # Forecast interpretation
            starting_cash = forecast_result.get('current_cash', 0)
            day7_expected = p50[-1] if p50 else 0
            day7_p5 = p5[-1] if p5 else 0
            day7_p95 = p95[-1] if p95 else 0
            
            story.append(Paragraph("Forecast Interpretation", generator.styles['SubsectionHeader']))
            story.append(Paragraph(f"""
            Starting with a cash position of Rs. {starting_cash:,.2f}, the expected 
            cash balance at the end of Day 7 is projected to be Rs. {day7_expected:,.2f}.
            <br/><br/>
            The range between the downside and upside scenarios is Rs. {day7_p95 - day7_p5:,.2f}, 
            highlighting the uncertainty in the forecast.
            """, generator.styles['BodyText']))
            story.append(Spacer(1, 0.2 * inch))
            
            # Disclaimer
            story.append(Paragraph("Disclaimer", generator.styles['SubsectionHeader']))
            story.append(Paragraph("""
            The uploaded dataset does not contain sufficient historical cash-flow data to generate a 
            statistically reliable Monte Carlo forecast. The current version therefore uses a synthetic 
            scenario model for demonstration purposes. P5, P50 and P95 represent synthetic downside, 
            expected and upside scenarios based on available reconciliation data and model assumptions.
            Future versions of CashSight will incorporate sufficient historical data and a validated 
            Monte Carlo forecasting model.
            """, generator.styles['BodyText']))
            story.append(Spacer(1, 0.2 * inch))

        # ============================================
        # KEY FINDINGS & RECOMMENDATIONS
        # ============================================
        story.append(PageBreak())
        story.append(Paragraph("Key Findings and Recommendations", generator.styles['SectionHeader']))
        
        findings = []
        
        # Reconciliation findings
        if matched_count > 0:
            findings.append(f"Successfully reconciled {matched_count} settlements, representing a {round(matched_count / total_settlements * 100, 1) if total_settlements > 0 else 0}% match rate.")
        if exception_count > 0:
            findings.append(f"{exception_count} exceptions were identified and require investigation.")
        if pending > 0:
            findings.append(f"Pending settlements totaling Rs. {pending:,.2f} need to be resolved.")
        
        # Tax findings
        if tax_result:
            rates = tax_result.get('rates', {})
            effective_rate = rates.get('effective_deduction_rate', 0)
            findings.append(f"The effective deduction rate is {effective_rate:.2f}%, consisting of gateway fees, GST, and TDS.")
        
        story.append(Paragraph("Findings", generator.styles['SubsectionHeader']))
        for finding in findings:
            story.append(Paragraph(f"• {finding}", generator.styles['BodyText']))
        
        story.append(Spacer(1, 0.2 * inch))
        
        # Recommendations
        story.append(Paragraph("Recommendations", generator.styles['SubsectionHeader']))
        
        recommendations = []
        if exception_count > 0:
            recommendations.append("Review and resolve all exceptions to ensure complete reconciliation.")
        if pending > 0:
            recommendations.append("Investigate pending settlements and reconcile with bank records.")
        if tax_result:
            recommendations.append("Review the fee structure and tax deductions to ensure accuracy.")
        if matched_count < total_settlements:
            recommendations.append("Improve reconciliation processes to increase the match rate.")
        
        if not recommendations:
            recommendations.append("All systems appear to be operating normally. Continue regular reconciliation processes.")
        
        for rec in recommendations:
            story.append(Paragraph(f"• {rec}", generator.styles['BodyText']))
        
        story.append(Spacer(1, 0.3 * inch))

        # ============================================
        # FINAL DISCLAIMER
        # ============================================
        story.append(Paragraph("Disclaimer", generator.styles['SectionHeader']))
        story.append(Paragraph("""
        This report is generated automatically by CashSight based on the uploaded data. 
        The reconciliation results are derived from the uploaded CSV files and should be verified 
        against original records. All financial calculations are based on the data provided.
        <br/><br/>
        The cash flow forecast is synthetic and not a statistically validated prediction. 
        All tax and fee values are sourced directly from the uploaded settlement data.
        <br/><br/>
        This report is for informational purposes only and should not be considered as financial advice.
        """, generator.styles['BodyText']))
        story.append(Spacer(1, 0.2 * inch))
        
        # Final footer
        story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#dddddd'), spaceAfter=0.2*cm))
        story.append(Paragraph(
            "Generated by CashSight • AI Finance Controller",
            generator.styles['BodyTextSmall']
        ))

        return story