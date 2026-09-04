"""
Reports Module - PDF Report Generation
"""

from backend.reports.generator import ReportGenerator
from backend.reports.routes import reports_blueprint

__all__ = ['ReportGenerator', 'reports_blueprint']