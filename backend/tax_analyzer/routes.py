"""
Tax & Fee Analyzer - API Routes
"""

from flask import Blueprint, jsonify, request
from backend.tax_analyzer.analyzer import TaxAnalyzer

tax_blueprint = Blueprint("tax", __name__)


@tax_blueprint.route("/api/tax-analyzer", methods=["GET"])
def get_tax_analysis():
    """Get tax and fee analysis for uploaded settlements"""
    try:
        from backend.routes import UPLOAD_CACHE

        settlements = UPLOAD_CACHE.get('settlements', [])

        if not settlements:
            return jsonify({
                'error': 'No settlement data available',
                'data': TaxAnalyzer([]).analyze()
            }), 200

        analyzer = TaxAnalyzer(settlements)
        result = analyzer.analyze()

        return jsonify({
            'success': True,
            'data': result,
            'message': f"Analyzed {result['summary']['total_settlements']} settlements"
        })

    except Exception as e:
        print(f"❌ Tax Analyzer error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500