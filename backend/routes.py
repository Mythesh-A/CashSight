from flask import Blueprint, jsonify, request
import pandas as pd
import numpy as np
from backend.reconciliation.pipeline import run_reconciliation, load_data
from backend.import_schema.csv_analyzer import analyze_csv
from backend.audit.logger import log_action, get_audit_log
from backend.audit.trail import get_trail

api = Blueprint("api", __name__)

# Global cache for uploaded data
UPLOAD_CACHE = {
    'data_source': None,
    'settlements': [],
    'ledger': [],
    'bank': [],
    'matches': [],
    'exceptions': []
}

@api.route("/api/<path:path>", methods=["OPTIONS"])
def handle_options(path):
    """Handle preflight requests for all API endpoints"""
    response = jsonify({"status": "ok"})
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Accept, Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    return response, 200

@api.route("/api/validate-data", methods=["POST", "OPTIONS"])
def validate_data_endpoint():
    
    if request.method == "OPTIONS":
        response = jsonify({"status": "ok"})
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Accept, Authorization"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        return response, 200
    
    try:
        data = request.get_json()
        print("\n" + "="*60)
        print("📥 VALIDATE-DATA CALLED")
        print("="*60)
        
        if not data:
            print("❌ No data received")
            return jsonify({"error": "No data received"}), 400
        
       
        ledger_data = data.get('ledger_data', [])
        settlement_data = data.get('settlement_data', [])
        bank_data = data.get('bank_data', [])
        
        print(f"📊 Received:")
        print(f"   Ledger: {len(ledger_data)} rows")
        print(f"   Settlements: {len(settlement_data)} rows")
        print(f"   Bank: {len(bank_data)} rows")
        
        if len(ledger_data) == 0 or len(settlement_data) == 0 or len(bank_data) == 0:
            print("❌ ERROR: Empty data received!")
            return jsonify({"error": "Empty data received"}), 400
        
       
        global UPLOAD_CACHE
        UPLOAD_CACHE = {
            'data_source': 'uploaded',
            'settlements': settlement_data,
            'ledger': ledger_data,
            'bank': bank_data,
            'matches': [],
            'exceptions': [],
            'reconciliation_result': None
        }
        
        
        print("\n🔄 Running reconciliation on UPLOADED data...")
        result = run_reconciliation(
            settlements=settlement_data,
            ledger=ledger_data,
            bank=bank_data
        )
        
        UPLOAD_CACHE['matches'] = result.get('matches', [])
        UPLOAD_CACHE['exceptions'] = result.get('exceptions', [])
        UPLOAD_CACHE['reconciliation_result'] = result
        
        total_matches = len(UPLOAD_CACHE['matches'])
        total_exceptions = len(UPLOAD_CACHE['exceptions'])
        
        print(f"\n✅ Results:")
        print(f"   Matches: {total_matches}")
        print(f"   Exceptions: {total_exceptions}")
        print("="*60)
        
        
        log_action(
            action="upload_completed",
            target="user_upload",
            details={
                "ledger_rows": len(ledger_data),
                "settlement_rows": len(settlement_data),
                "bank_rows": len(bank_data),
                "matches": total_matches,
                "exceptions": total_exceptions
            },
            user="system"
        )

        print(f"\n🔍 CACHE AFTER UPLOAD:")
        print(f"   data_source: {UPLOAD_CACHE.get('data_source')}")
        print(f"   settlements: {len(UPLOAD_CACHE.get('settlements', []))}")
        print(f"   matches: {len(UPLOAD_CACHE.get('matches', []))}")
        print(f"   exceptions: {len(UPLOAD_CACHE.get('exceptions', []))}")
    
        
        return jsonify({
            'valid': True,
            'data_source': 'uploaded',
            'summary': {
                'orders_loaded': len(ledger_data),
                'settlements_loaded': len(settlement_data),
                'bank_txns_loaded': len(bank_data),
                'matches': total_matches,
                'exceptions': total_exceptions
            }
        })
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@api.route("/api/reconcile", methods=["GET"])
def reconcile():
    """Return reconciliation results"""
    print("\n" + "="*60)
    print("📥 RECONCILE ENDPOINT CALLED")
    print("="*60)
    print(f"📊 Data source: {UPLOAD_CACHE.get('data_source', 'unknown')}")
    print(f"   Matches: {len(UPLOAD_CACHE.get('matches', []))}")
    print(f"   Exceptions: {len(UPLOAD_CACHE.get('exceptions', []))}")
    print("="*60)
    
    # If we have uploaded data, use it
    if UPLOAD_CACHE.get('data_source') == 'uploaded':
        print("📁 Returning UPLOADED data")
        return jsonify({
            'matches': UPLOAD_CACHE.get('matches', []),
            'exceptions': UPLOAD_CACHE.get('exceptions', []),
            'data_source': 'uploaded'
        })
    
    # If we have sample data in cache, use it
    if UPLOAD_CACHE.get('data_source') == 'sample' and UPLOAD_CACHE.get('matches'):
        print("📁 Returning SAMPLE data")
        return jsonify({
            'matches': UPLOAD_CACHE.get('matches', []),
            'exceptions': UPLOAD_CACHE.get('exceptions', []),
            'data_source': 'sample'
        })
    
    
    print("📁 No data available, returning empty")
    return jsonify({
        'matches': [],
        'exceptions': [],
        'data_source': None
    })


@api.route("/api/debug-cache", methods=["GET"])
def debug_cache():
    return jsonify({
        'data_source': UPLOAD_CACHE.get('data_source'),
        'settlements_count': len(UPLOAD_CACHE.get('settlements', [])),
        'ledger_count': len(UPLOAD_CACHE.get('ledger', [])),
        'bank_count': len(UPLOAD_CACHE.get('bank', [])),
        'matches_count': len(UPLOAD_CACHE.get('matches', [])),
        'exceptions_count': len(UPLOAD_CACHE.get('exceptions', [])),
        'has_reconciliation_result': UPLOAD_CACHE.get('reconciliation_result') is not None
    })


@api.route("/api/cash-position", methods=["GET"])
def get_cash_position():
    try:
        matches = UPLOAD_CACHE.get('matches', [])
        exceptions = UPLOAD_CACHE.get('exceptions', [])
        bank = UPLOAD_CACHE.get('bank', [])
        
        current_cash = sum(b.get('credited_amount', 0) for b in bank)
             
        pending_settlements = [
            e for e in exceptions 
            if e.get('exception_type') == 'missing_bank_credit'
        ]
        pending = sum(e.get('amount', 0) for e in pending_settlements)
        pending_count = len(pending_settlements)
        
        total_expected = current_cash + pending
        
        exception_types = {}
        for e in exceptions:
            etype = e.get('exception_type', 'unknown')
            exception_types[etype] = exception_types.get(etype, 0) + 1
        
        print(f"\n💰 Cash Position:")
        print(f"   Bank Total: ₹{current_cash:,.2f}")
        print(f"   Pending (missing bank credit): ₹{pending:,.2f} ({pending_count} settlements)")
        print(f"   Total Expected: ₹{total_expected:,.2f}")
        print(f"   Matches: {len(matches)}")
        print(f"   Total Exceptions: {len(exceptions)}")
        print(f"   Exception Types: {exception_types}")

        return jsonify({
            "current_cash": round(current_cash, 2),
            "pending_settlements": round(pending, 2),
            "total_expected": round(total_expected, 2),
            "reconciled_count": len(matches),
            "pending_count": pending_count,
            "total_exceptions": len(exceptions),
            "match_rate": round(len(matches) / (len(matches) + len(exceptions)) * 100, 1) if (len(matches) + len(exceptions)) > 0 else 0,
            "data_source": UPLOAD_CACHE.get('data_source', 'sample'),
            "exception_types": exception_types,
            "matched_count": len(matches),
            "pending_display": f"{len(matches)} matched + {pending_count} pending"
        })
    
    except Exception as e:
        print(f"❌ Cash Position error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@api.route("/api/load-sample", methods=["POST"])
def load_sample_data():
    """Load sample data"""
    global UPLOAD_CACHE
    
    try:
        UPLOAD_CACHE = {
            'data_source': 'sample',
            'settlements': [],
            'ledger': [],
            'bank': [],
            'reconciliation_result': None,
            'matches': [],
            'exceptions': []
        }
        
        settlements, ledger, bank = load_data()
        
        UPLOAD_CACHE['bank'] = bank
        UPLOAD_CACHE['ledger'] = ledger
        UPLOAD_CACHE['settlements'] = settlements
        
        result = run_reconciliation(settlements, ledger, bank)
        
        UPLOAD_CACHE['reconciliation_result'] = result
        UPLOAD_CACHE['matches'] = result.get('matches', [])
        UPLOAD_CACHE['exceptions'] = result.get('exceptions', [])
        
        total_bank = sum(b.get('credited_amount', 0) for b in bank)
        pending = sum(e.get('amount', 0) for e in result.get('exceptions', []) if e.get('exception_type') == 'missing_bank_credit')
        
        # Log sample data load
        log_action(
            action="sample_data_loaded",
            target="system",
            details={
                "ledger": len(ledger),
                "settlements": len(settlements),
                "bank": len(bank),
                "matches": len(UPLOAD_CACHE['matches']),
                "exceptions": len(UPLOAD_CACHE['exceptions'])
            },
            user="system"
        )
        
        print(f"\n✅ Sample data loaded:")
        print(f"   Bank Total: ₹{total_bank:,.2f}")
        print(f"   Matches: {len(UPLOAD_CACHE['matches'])}")
        print(f"   Exceptions: {len(UPLOAD_CACHE['exceptions'])}")
        
        return jsonify({
            "status": "success",
            "message": "Sample data loaded",
            "data_source": "sample",
            "records": {
                "ledger": len(ledger),
                "settlements": len(settlements),
                "bank": len(bank),
                "matches": len(UPLOAD_CACHE['matches']),
                "exceptions": len(UPLOAD_CACHE['exceptions'])
            },
            "amounts": {
                "bank_total": total_bank,
                "pending": pending,
                "total_expected": total_bank + pending
            }
        })
    
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@api.route("/api/score", methods=["GET"])
def score():
    try:
        matches = UPLOAD_CACHE.get('matches', [])
        exceptions = UPLOAD_CACHE.get('exceptions', [])
        bank = UPLOAD_CACHE.get('bank', [])
        
        total_settlements = len(matches) + len(exceptions)
        
        bank_match_rate = round(len(matches) / total_settlements * 100, 1) if total_settlements > 0 else 0
        ledger_match_rate = None
        end_to_end_rate = None
        
        print(f"\n📊 Score Results:")
        print(f"   Bank Match Rate: {bank_match_rate}%")
        print(f"   Ledger Match: N/A (no order_id in settlements)")
        print(f"   End-to-End: N/A (no order_id in settlements)")

        return jsonify({
            "metric_type": "operational",
            "bank_match": {
                "precision": f"{bank_match_rate}%",
                "recall": f"{bank_match_rate}%",
                "f1": f"{bank_match_rate}%"
            },
            "ledger_match": {
                "precision": "N/A",
                "recall": "N/A",
                "f1": "N/A",
                "note": "Ledger-to-settlement matching cannot be fully determined because the settlement file does not contain order_id."
            },
            "end_to_end": {
                "precision": "N/A",
                "recall": "N/A",
                "f1": "N/A",
                "note": "End-to-end matching cannot be fully determined because the settlement file does not contain order_id."
            },
            "operational": {
                "settlement_coverage": f"{bank_match_rate}%",
                "bank_match_rate": f"{bank_match_rate}%",
                "ledger_resolution_rate": "N/A",
                "exception_rate": f"{round(100 - bank_match_rate, 1) if total_settlements > 0 else 0}%",
                "exception_types": {}
            },
            "summary": {
                "total_settlements": total_settlements,
                "matched": len(matches),
                "exceptions": len(exceptions),
                "match_rate": bank_match_rate,
                "note": "Ledger Match and End-to-End are N/A because the settlement file does not contain order_id."
            }
        })
    
    except Exception as e:
        print(f"❌ Score error: {str(e)}")
        return jsonify({"error": str(e)}), 500


@api.route("/api/forecast", methods=["GET"])
def forecast():
    """Synthetic 7-day cash flow forecast for demonstration purposes."""
    try:
        import numpy as np

        matches = UPLOAD_CACHE.get('matches', [])
        exceptions = UPLOAD_CACHE.get('exceptions', [])
        bank = UPLOAD_CACHE.get('bank', [])
        
        current_cash = sum(b.get('credited_amount', 0) for b in bank)
        
        pending_settlements = [
            e for e in exceptions 
            if e.get('exception_type') == 'missing_bank_credit'
        ]
        pending_amount = sum(e.get('amount', 0) for e in pending_settlements)
        total_expected = current_cash + pending_amount
        pending_count = len(pending_settlements)

        days = 7
        
        if pending_amount > 0 and pending_count > 0:
            daily_weights = [0.20, 0.18, 0.15, 0.13, 0.12, 0.11, 0.11]
            daily_base = pending_amount * np.array(daily_weights)
            
            p5, p50, p95 = [], [], []
            cum_p5 = current_cash
            cum_p50 = current_cash
            cum_p95 = current_cash
            
            rng = np.random.default_rng(42)
            
            for i in range(days):
                variation_factor = max(0.05, 0.20 - (i * 0.02))
                
                daily_p5 = daily_base[i] * (1 - variation_factor * 0.5)
                daily_p50 = daily_base[i]
                daily_p95 = daily_base[i] * (1 + variation_factor * 0.5)
                
                cum_p5 += daily_p5
                cum_p50 += daily_p50
                cum_p95 += daily_p95
                
                p5.append(round(max(cum_p5, 0), 2))
                p50.append(round(max(cum_p50, 0), 2))
                p95.append(round(max(cum_p95, 0), 2))
        else:
            p5 = [round(current_cash, 2)] * days
            p50 = [round(current_cash, 2)] * days
            p95 = [round(current_cash, 2)] * days

        for i in range(days):
            p5[i] = min(p5[i], p50[i])
            p95[i] = max(p95[i], p50[i])

        return jsonify({
            "percentiles": {"p5": p5, "p50": p50, "p95": p95},
            "days": [f"Day {i+1}" for i in range(days)],
            "data_source": UPLOAD_CACHE.get('data_source', 'sample'),
            "pending_count": pending_count,
            "current_cash": round(current_cash, 2),
            "pending_amount": round(pending_amount, 2),
            "total_expected": round(total_expected, 2),
            "forecast_type": "synthetic",
            "disclaimer": (
                "⚠️ Insufficient historical data is currently available for a reliable Monte Carlo forecast. "
                "This version uses synthetic scenarios for demonstration. "
                "Monte Carlo-based probabilistic forecasting will be introduced in upcoming versions "
                "as sufficient historical data becomes available (minimum 30+ historical observations)."
            ),
            "methodology": {
                "type": "Synthetic Distribution",
                "description": "Pending settlements are spread over 7 days using a weighted distribution.",
                "inputs": {
                    "current_cash": f"₹{current_cash:,.2f} (from bank credits)",
                    "pending_amount": f"₹{pending_amount:,.2f} (from {pending_count} pending settlements)",
                    "daily_weights": [0.20, 0.18, 0.15, 0.13, 0.12, 0.11, 0.11]
                }
            }
        })

    except Exception as e:
        print(f"❌ Forecast error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@api.route("/api/exceptions", methods=["GET"])
def get_exceptions():
    """Get all exceptions"""
    try:
        exceptions = UPLOAD_CACHE.get('exceptions', [])
        
        print(f"🔍 Exceptions endpoint called: {len(exceptions)} exceptions found")
        
        exception_type = request.args.get('type')
        if exception_type:
            exceptions = [e for e in exceptions if e.get('exception_type') == exception_type]
        
        summary = {}
        for e in UPLOAD_CACHE.get('exceptions', []):
            t = e.get('exception_type', 'unknown')
            summary[t] = summary.get(t, 0) + 1
        
        return jsonify({
            "exceptions": exceptions,
            "total": len(exceptions),
            "summary": summary
        })
    
    except Exception as e:
        print(f"❌ Error in exceptions endpoint: {str(e)}")
        return jsonify({"error": str(e)}), 500

@api.route("/api/explain", methods=["POST", "OPTIONS"])
def explain():
    if request.method == "OPTIONS":
        response = jsonify({"status": "ok"})
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Accept, Authorization"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        return response, 200
    
    try:
        payload = request.get_json(force=True, silent=True) or {}
        exception_record = payload.get("exception")
        
        if not exception_record:
            return jsonify({"error": "Missing 'exception' in request body."}), 400

        print(f"\n📥 EXPLAIN ENDPOINT CALLED")
        print(f"   Exception type: {exception_record.get('exception_type', 'unknown')}")
        print(f"   Settlement ID: {exception_record.get('settlement_id', 'unknown')}")
        
        from backend.explain import get_explanation
        text = get_explanation(exception_record)
        
        print(f"✅ Explanation generated")
        
        return jsonify({"explanation": text})
        
    except RuntimeError as e:
        return jsonify({"error": str(e)}), 503
    except Exception as e:
        print(f"❌ Explain failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Explain failed: {str(e)}"}), 500
    


@api.route("/api/resolve-exception", methods=["POST"])
def resolve_exception_endpoint():
    """Resolve an exception"""
    try:
        payload = request.get_json(force=True)
        if not payload:
            return jsonify({"error": "Missing request body"}), 400
        
        exception_id = payload.get('exception_id')
        decision = payload.get('decision')
        selected_combination = payload.get('selected_combination')
        notes = payload.get('notes', '')
        
        if not exception_id or not decision:
            return jsonify({"error": "Missing exception_id or decision"}), 400
        
        print(f"\n🔧 Resolving exception:")
        print(f"   ID: {exception_id}")
        print(f"   Decision: {decision}")
        print(f"   Selected: {selected_combination}")
        print(f"   Notes: {notes}")
        
        exceptions = UPLOAD_CACHE.get('exceptions', [])
        matches = UPLOAD_CACHE.get('matches', [])
        
        resolved_exception = None
        new_exceptions = []
        for e in exceptions:
            eid = e.get('settlement_id') or e.get('id') or e.get('txn_id')
            if eid == exception_id:
                resolved_exception = e
                if decision == 'confirm':
                    match = {
                        "settlement_id": e.get('settlement_id'),
                        "bank_txn_id": e.get('bank_txn_id'),
                        "order_ids": selected_combination or [],
                        "match_type": "resolved_by_user",
                        "net_amount": e.get('amount', 0),
                        "gross_amount": e.get('gross_amount', 0),
                        "utr": e.get('utr'),
                        "settlement_date": e.get('settlement_date'),
                        "resolved_by": "user",
                        "resolved_at": __import__('datetime').datetime.now().isoformat()
                    }
                    matches.append(match)
            else:
                new_exceptions.append(e)
        
        UPLOAD_CACHE['exceptions'] = new_exceptions
        UPLOAD_CACHE['matches'] = matches
        UPLOAD_CACHE['reconciliation_result'] = None
        
        # Log resolution
        log_action(
            action="resolve_exception",
            target=exception_id,
            details={
                "decision": decision,
                "selected_combination": selected_combination,
                "notes": notes
            },
            user="user"
        )
        
        print(f"✅ Exception resolved. Remaining: {len(new_exceptions)}")
        
        return jsonify({
            "status": "success",
            "message": f"Exception {exception_id} {decision}ed successfully",
            "remaining": len(new_exceptions)
        })
    
    except Exception as e:
        print(f"❌ Error resolving exception: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@api.route("/api/audit", methods=["GET"])
def get_audit_logs():
    """Get all audit logs"""
    try:
        target = request.args.get('target')
        action = request.args.get('action')
        limit = request.args.get('limit', default=100, type=int)
        
        logs = get_audit_log(target=target, action=action, limit=limit)
        
        return jsonify({
            "logs": logs,
            "total": len(logs),
            "filters": {
                "target": target,
                "action": action,
                "limit": limit
            }
        })
    except Exception as e:
        print(f"❌ Error fetching audit logs: {str(e)}")
        return jsonify({"error": str(e)}), 500


@api.route("/api/audit/<settlement_id>", methods=["GET"])
def get_audit_trail_endpoint(settlement_id):
    """Get audit trail for a specific settlement"""
    try:
        trail = get_trail(settlement_id)
        return jsonify({
            "settlement_id": settlement_id,
            "audit_trail": trail,
            "total": len(trail)
        })
    except Exception as e:
        print(f"❌ Error fetching audit trail: {str(e)}")
        return jsonify({"error": str(e)}), 500


@api.route("/api/health", methods=["GET"])
def health():
    return {"status": "ok"}


@api.route("/api/cache-status", methods=["GET"])
def cache_status():
    """Debug: Check cache status"""
    return jsonify({
        'data_source': UPLOAD_CACHE.get('data_source'),
        'ledger_count': len(UPLOAD_CACHE.get('ledger', [])),
        'settlements_count': len(UPLOAD_CACHE.get('settlements', [])),
        'bank_count': len(UPLOAD_CACHE.get('bank', [])),
        'matches_count': len(UPLOAD_CACHE.get('matches', [])),
        'exceptions_count': len(UPLOAD_CACHE.get('exceptions', []))
    })


@api.route("/api/analyze-csv", methods=["POST"])
def analyze_csv_endpoint():
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file uploaded"}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "Empty filename"}), 400
        
        df = pd.read_csv(file.stream)
        
        return jsonify({
            "filename": file.filename,
            "total_rows": len(df),
            "headers": df.columns.tolist(),
            "sample_rows": df.head(5).to_dict(orient='records')
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500



