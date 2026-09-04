"""
Reports - API Routes
"""

from flask import Blueprint, jsonify, request, send_file
from backend.reports.generator import ReportGenerator
from backend import routes as main_routes
from backend.forecasting.forecast_pipeline import run_forecast
from backend.reconciliation.pipeline import run_reconciliation, load_data
from backend.tax_analyzer.analyzer import TaxAnalyzer

reports_blueprint = Blueprint("reports", __name__)


@reports_blueprint.route("/api/reports/<path:path>", methods=["OPTIONS"])
def handle_options(path):
    response = jsonify({"status": "ok"})
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Accept, Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    return response, 200


def get_data_from_cache():
    """Helper to get data from cache"""
    cache = main_routes.UPLOAD_CACHE
    return {
        'data_source': cache.get('data_source'),
        'matches': cache.get('matches', []),
        'exceptions': cache.get('exceptions', []),
        'settlements': cache.get('settlements', []),
        'ledger': cache.get('ledger', []),
        'bank': cache.get('bank', [])
    }


def ensure_reconciliation_run(data):
    """Ensure reconciliation is run on uploaded data"""
    if data['data_source'] == 'uploaded' and data['settlements']:
        if not data['matches'] and not data['exceptions']:
            print("🔄 Running reconciliation on UPLOADED data...")
            result = run_reconciliation(
                data['settlements'],
                data['ledger'],
                data['bank']
            )
            data['matches'] = result.get('matches', [])
            data['exceptions'] = result.get('exceptions', [])
            # Update cache
            cache = main_routes.UPLOAD_CACHE
            cache['matches'] = data['matches']
            cache['exceptions'] = data['exceptions']
            print(f"✅ Reconciliation complete: {len(data['matches'])} matches, {len(data['exceptions'])} exceptions")
    return data


def load_sample_data():
    """Load sample data"""
    print("📁 No uploaded data, loading SAMPLE data...")
    settlements, ledger, bank = load_data()
    result = run_reconciliation(settlements, ledger, bank)
    cache = main_routes.UPLOAD_CACHE
    cache['settlements'] = settlements
    cache['ledger'] = ledger
    cache['bank'] = bank
    cache['matches'] = result.get('matches', [])
    cache['exceptions'] = result.get('exceptions', [])
    cache['data_source'] = 'sample'
    print(f"✅ Sample data loaded: {len(cache['matches'])} matches, {len(cache['exceptions'])} exceptions")
    return {
        'data_source': 'sample',
        'matches': cache['matches'],
        'exceptions': cache['exceptions'],
        'settlements': settlements,
        'ledger': ledger,
        'bank': bank
    }


@reports_blueprint.route("/api/reports/reconciliation", methods=["POST", "OPTIONS"])
def generate_reconciliation_report():
    if request.method == "OPTIONS":
        response = jsonify({"status": "ok"})
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Accept, Authorization"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        return response, 200
    
    try:
        # Get data from cache
        data = get_data_from_cache()
        
        print("\n📊 Reconciliation Report - Cache contents:")
        print(f"   data_source: {data['data_source']}")
        print(f"   matches: {len(data['matches'])}")
        print(f"   exceptions: {len(data['exceptions'])}")
        print(f"   settlements: {len(data['settlements'])}")
        print(f"   bank: {len(data['bank'])}")
        
        # If uploaded data exists, use it
        if data['data_source'] == 'uploaded' and data['settlements']:
            data = ensure_reconciliation_run(data)
        
        # If no data, load sample
        if not data['matches'] and not data['exceptions'] and not data['settlements']:
            data = load_sample_data()
        
        if not data['matches'] and not data['exceptions']:
            return jsonify({
                'error': 'No reconciliation data available. Please upload and reconcile data first.'
            }), 400
        
        print(f"📄 Generating Reconciliation Report with {len(data['matches'])} matches and {len(data['exceptions'])} exceptions")
        
        generator = ReportGenerator()
        pdf_buffer = generator.generate_reconciliation_report(
            matches=data['matches'],
            exceptions=data['exceptions'],
            settlements=data['settlements'],
            bank=data['bank']
        )
        
        return send_file(
            pdf_buffer,
            as_attachment=True,
            download_name='CashSight_Reconciliation_Report.pdf',
            mimetype='application/pdf'
        )
    
    except Exception as e:
        print(f"❌ Reconciliation Report error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@reports_blueprint.route("/api/reports/forecast", methods=["POST", "OPTIONS"])
def generate_forecast_report():
    if request.method == "OPTIONS":
        response = jsonify({"status": "ok"})
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Accept, Authorization"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        return response, 200
    
    try:
        # Get data from cache
        data = get_data_from_cache()
        
        print("\n📊 Forecast Report - Cache contents:")
        print(f"   data_source: {data['data_source']}")
        print(f"   matches: {len(data['matches'])}")
        print(f"   exceptions: {len(data['exceptions'])}")
        print(f"   settlements: {len(data['settlements'])}")
        
        # If uploaded data exists, use it
        if data['data_source'] == 'uploaded' and data['settlements']:
            data = ensure_reconciliation_run(data)
        
        # If no data, load sample
        if not data['matches'] and not data['exceptions'] and not data['settlements']:
            data = load_sample_data()
        
        if not data['matches'] and not data['exceptions']:
            return jsonify({
                'error': 'No data available. Please upload and reconcile data first.'
            }), 400
        
        reconciliation_result = {
            'matches': data['matches'],
            'exceptions': data['exceptions']
        }
        forecast_result = run_forecast(reconciliation_result, data['settlements'])
        
        generator = ReportGenerator()
        pdf_buffer = generator.generate_forecast_report(
            matches=data['matches'],
            exceptions=data['exceptions'],
            settlements=data['settlements'],
            forecast_result=forecast_result
        )
        
        return send_file(
            pdf_buffer,
            as_attachment=True,
            download_name='CashSight_Forecast_Report.pdf',
            mimetype='application/pdf'
        )
    
    except Exception as e:
        print(f"❌ Forecast Report error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@reports_blueprint.route("/api/reports/tax-fee", methods=["POST", "OPTIONS"])
def generate_tax_fee_report():
    if request.method == "OPTIONS":
        response = jsonify({"status": "ok"})
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Accept, Authorization"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        return response, 200
    
    try:
        # Get data from cache
        data = get_data_from_cache()
        
        print("\n📊 Tax & Fee Report - Cache contents:")
        print(f"   data_source: {data['data_source']}")
        print(f"   settlements: {len(data['settlements'])}")
        
        # If uploaded data exists, use it
        if data['data_source'] == 'uploaded' and data['settlements']:
            print("📁 Using UPLOADED settlements for Tax & Fee report")
            settlements = data['settlements']
        else:
            # Only load sample if no uploaded data
            print("📁 No uploaded settlements, loading SAMPLE data...")
            settlements, ledger, bank = load_data()
            cache = main_routes.UPLOAD_CACHE
            cache['settlements'] = settlements
            cache['ledger'] = ledger
            cache['bank'] = bank
            cache['data_source'] = 'sample'
        
        if not settlements:
            return jsonify({
                'error': 'No settlement data available. Please upload settlement data first.'
            }), 400
        
        analyzer = TaxAnalyzer(settlements)
        tax_result = analyzer.analyze()
        
        generator = ReportGenerator()
        pdf_buffer = generator.generate_tax_fee_report(tax_result)
        
        return send_file(
            pdf_buffer,
            as_attachment=True,
            download_name='CashSight_Tax_Fee_Analysis.pdf',
            mimetype='application/pdf'
        )
    
    except Exception as e:
        print(f"❌ Tax & Fee Report error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@reports_blueprint.route("/api/reports/full", methods=["POST", "OPTIONS"])
def generate_full_report():
    if request.method == "OPTIONS":
        response = jsonify({"status": "ok"})
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Accept, Authorization"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        return response, 200
    
    try:
        # Get data from cache
        data = get_data_from_cache()
        
        print("\n📊 Full Report - Cache contents:")
        print(f"   data_source: {data['data_source']}")
        print(f"   matches: {len(data['matches'])}")
        print(f"   exceptions: {len(data['exceptions'])}")
        print(f"   settlements: {len(data['settlements'])}")
        print(f"   bank: {len(data['bank'])}")
        
        # If uploaded data exists, use it
        if data['data_source'] == 'uploaded' and data['settlements']:
            data = ensure_reconciliation_run(data)
        
        # If no data, load sample
        if not data['matches'] and not data['exceptions'] and not data['settlements']:
            data = load_sample_data()
        
        if not data['matches'] and not data['exceptions']:
            return jsonify({
                'error': 'No data available. Please upload and reconcile data first.'
            }), 400
        
        # Run tax analysis
        analyzer = TaxAnalyzer(data['settlements'])
        tax_result = analyzer.analyze() if data['settlements'] else None
        
        # Run forecast
        reconciliation_result = {
            'matches': data['matches'],
            'exceptions': data['exceptions']
        }
        forecast_result = run_forecast(reconciliation_result, data['settlements']) if data['settlements'] else None
        
        generator = ReportGenerator()
        pdf_buffer = generator.generate_full_report(
            matches=data['matches'],
            exceptions=data['exceptions'],
            settlements=data['settlements'],
            bank=data['bank'],
            tax_result=tax_result,
            forecast_result=forecast_result
        )
        
        return send_file(
            pdf_buffer,
            as_attachment=True,
            download_name='CashSight_Full_Report.pdf',
            mimetype='application/pdf'
        )
    
    except Exception as e:
        print(f"❌ Full Report error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500