"""
Forecast Report - PDF content builder
"""

from reportlab.platypus import Paragraph, Spacer, Table, PageBreak, HRFlowable
from reportlab.lib import colors
from reportlab.lib.units import inch, cm


class ForecastReport:
    """Builds the Forecast Report content"""

    def build(self, matches, exceptions, settlements, forecast_result, generator):
        story = []

        # ============================================
        # SECTION 1: FORECAST SUMMARY
        # ============================================
        story.append(Paragraph("1. Forecast Summary", generator.styles['SectionHeader']))
        
        current_cash = forecast_result.get('current_cash', 0)
        pending_amount = forecast_result.get('pending_amount', 0)
        total_expected = current_cash + pending_amount
        pending_count = forecast_result.get('pending_count', 0)
        
        summary_text = f"""
        <b>Starting Cash:</b> Rs. {current_cash:,.2f}<br/>
        <b>Pending Amount:</b> Rs. {pending_amount:,.2f} ({pending_count} settlements)<br/>
        <b>Total Expected:</b> Rs. {total_expected:,.2f}<br/>
        <b>Forecast Horizon:</b> 7 Days
        """
        story.append(Paragraph(summary_text, generator.styles['BodyText']))
        story.append(Spacer(1, 0.3 * inch))

        # ============================================
        # SECTION 2: DAY-BY-DAY FORECAST
        # ============================================
        story.append(Paragraph("2. Day-by-Day Forecast", generator.styles['SectionHeader']))
        
        forecast = forecast_result.get('forecast', {})
        days = forecast.get('days', [])
        p5 = forecast.get('p5', [])
        p50 = forecast.get('p50', [])
        p95 = forecast.get('p95', [])
        
        # If no forecast data, generate synthetic data
        if not days or not p50:
            days = [1, 2, 3, 4, 5, 6, 7]
            daily_base = pending_amount / 7 if pending_amount > 0 else 1000
            p5 = []
            p50 = []
            p95 = []
            cum_p5 = current_cash
            cum_p50 = current_cash
            cum_p95 = current_cash
            for i in range(7):
                daily = daily_base * (1 + i * 0.05)
                cum_p5 += daily * 0.7
                cum_p50 += daily
                cum_p95 += daily * 1.3
                p5.append(cum_p5)
                p50.append(cum_p50)
                p95.append(cum_p95)
        
        # Create forecast table
        forecast_data = [
            ['Day', 'P5 - Downside', 'P50 - Expected', 'P95 - Upside']
        ]
        
        for i, day in enumerate(days):
            forecast_data.append([
                f"Day {i+1}",
                f"Rs. {p5[i] if i < len(p5) else 0:,.2f}",
                f"Rs. {p50[i] if i < len(p50) else 0:,.2f}",
                f"Rs. {p95[i] if i < len(p95) else 0:,.2f}"
            ])
        
        forecast_table = generator._create_table(forecast_data, col_widths=[1.2*inch, 2*inch, 2*inch, 2*inch])
        story.append(forecast_table)
        story.append(Spacer(1, 0.2 * inch))
        
        # Day 7 summary
        day7_p5 = p5[-1] if p5 else 0
        day7_p50 = p50[-1] if p50 else 0
        day7_p95 = p95[-1] if p95 else 0
        
        story.append(Paragraph(f"""
        <b>Day 7 Projections:</b><br/>
        Downside (P5): Rs. {day7_p5:,.2f}<br/>
        Expected (P50): Rs. {day7_p50:,.2f}<br/>
        Upside (P95): Rs. {day7_p95:,.2f}
        """, generator.styles['BodyText']))
        story.append(Spacer(1, 0.3 * inch))

        # ============================================
        # SECTION 3: FORECAST INTERPRETATION
        # ============================================
        story.append(PageBreak())
        story.append(Paragraph("3. Forecast Interpretation", generator.styles['SectionHeader']))
        
        starting_cash = current_cash
        day7_expected = p50[-1] if p50 else 0
        day7_p5 = p5[-1] if p5 else 0
        day7_p95 = p95[-1] if p95 else 0
        
        story.append(Paragraph(f"""
        Starting with a cash position of Rs. {starting_cash:,.2f}, the expected 
        cash balance at the end of Day 7 is projected to be Rs. {day7_expected:,.2f}.
        <br/><br/>
        The range between the downside and upside scenarios is Rs. {day7_p95 - day7_p5:,.2f}, 
        highlighting the uncertainty in the forecast. This range provides a view of 
        potential best-case and worst-case scenarios based on the available data.
        """, generator.styles['BodyText']))
        story.append(Spacer(1, 0.2 * inch))
        
        story.append(Paragraph("Key Observations", generator.styles['SubsectionHeader']))
        
        observations = []
        if day7_expected > starting_cash:
            observations.append(f"• Expected positive cash flow of Rs. {day7_expected - starting_cash:,.2f} over the forecast period.")
        else:
            observations.append("• Expected cash position remains stable over the forecast period.")
        
        if pending_count > 0:
            observations.append(f"• {pending_count} pending settlements totaling Rs. {pending_amount:,.2f} are expected to arrive during the forecast period.")
        else:
            observations.append("• No pending settlements are currently recorded.")
        
        for obs in observations:
            story.append(Paragraph(obs, generator.styles['BodyText']))
        
        story.append(Spacer(1, 0.3 * inch))

        # ============================================
        # SECTION 4: DISCLAIMER
        # ============================================
        story.append(Paragraph("4. Important Disclaimer", generator.styles['SectionHeader']))
        story.append(Paragraph("""
        The uploaded dataset does not contain sufficient historical cash-flow data to generate a 
        statistically reliable Monte Carlo forecast. The current version therefore uses a synthetic 
        scenario model for demonstration purposes. P5, P50 and P95 represent synthetic downside, 
        expected and upside scenarios based on available reconciliation data and model assumptions.
        <br/><br/>
        Future versions of CashSight will incorporate sufficient historical data and a validated 
        Monte Carlo forecasting model for statistically grounded probabilistic cash-flow predictions.
        """, generator.styles['BodyText']))
        story.append(Spacer(1, 0.3 * inch))
        
        story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#dddddd'), spaceAfter=0.2*cm))
        story.append(Paragraph(
            "This report is generated automatically by CashSight based on the uploaded data.",
            generator.styles['BodyTextSmall']
        ))

        return story