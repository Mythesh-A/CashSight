"""
Forecasting module - Synthetic forecast for demonstration purposes.

Note: Monte Carlo forecasting requires sufficient historical data
(minimum 30+ observations). The current version uses a synthetic
forecast that is clearly labeled as such.

Monte Carlo-based probabilistic forecasting will be introduced in
upcoming versions as sufficient historical data becomes available.
"""

from backend.forecasting.forecast_pipeline import run_forecast, get_cash_position

__all__ = ['run_forecast', 'get_cash_position']