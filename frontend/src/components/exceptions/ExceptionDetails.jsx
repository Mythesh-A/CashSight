/**
 * ExceptionDetails - Detailed view with clean resolution flow
 */
import React, { useState } from 'react'
import { Button, Card, StatusBadge } from '../common'
import { currency, exceptionTypeLabel, exceptionTypeIcon } from '../../utils/formatters'
import { exceptionService } from '../../api/services'
import ResolutionGuide from './ResolutionGuide'
import { AuditDetails } from '../audit'

export default function ExceptionDetails({ exception, onClose, onResolve }) {
  const [loading, setLoading] = useState(false)
  const [explanation, setExplanation] = useState(null)
  const [loadingExplanation, setLoadingExplanation] = useState(false)
  const [selectedCombination, setSelectedCombination] = useState(null)
  const [resolutionNotes, setResolutionNotes] = useState('')
  const [resolutionStatus, setResolutionStatus] = useState(null)
  const [showGuide, setShowGuide] = useState(false)
  const [showAudit, setShowAudit] = useState(false)
  const [isConfirmed, setIsConfirmed] = useState(false)

  const type = exception.exception_type || exception.type || 'unknown'
  const amount = exception.amount || exception.net_amount || 0
  const id = exception.settlement_id || exception.id || exception.txn_id || 'N/A'

  const getStatusColor = (type) => {
    const colors = {
      missing_bank_credit: 'error',
      unresolved_batch: 'warning',
      ambiguous_batch: 'warning',
      unlinked_credit: 'info',
    }
    return colors[type] || 'warning'
  }

  const handleGetExplanation = async () => {
    setLoadingExplanation(true)
    try {
      const response = await exceptionService.explain(exception)
      setExplanation(response.data.explanation)
    } catch (error) {
      console.error('Failed to get explanation:', error)
      setExplanation('Unable to get AI explanation at this time.')
    } finally {
      setLoadingExplanation(false)
    }
  }

  const handleResolve = async () => {
    if (type === 'ambiguous_batch' && !selectedCombination) {
      alert('Please select a combination to confirm')
      return
    }

    if (type !== 'ambiguous_batch' && !isConfirmed) {
      alert('Please complete the confirmation checklist before resolving')
      return
    }

    setLoading(true)
    setResolutionStatus(null)
    
    try {
      const result = await exceptionService.resolve(
        id,
        'confirm',
        selectedCombination,
        resolutionNotes
      )
      
      setResolutionStatus({
        success: true,
        message: `✅ Exception resolved successfully!`
      })
      
      setTimeout(() => {
        if (onResolve) onResolve()
        onClose()
      }, 1500)
      
    } catch (error) {
      console.error('Failed to resolve exception:', error)
      setResolutionStatus({
        success: false,
        message: error.message || 'Failed to resolve exception'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px',
      animation: 'fadeIn 0.3s ease',
    }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
      
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '32px',
        maxWidth: '700px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '20px',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '32px' }}>{exceptionTypeIcon(type)}</span>
              <div>
                <h3 style={{ margin: 0 }}>{exceptionTypeLabel(type)}</h3>
                <div style={{ fontSize: '14px', color: '#666', marginTop: '2px' }}>
                  {id}
                </div>
              </div>
            </div>
          </div>
          <Button variant="secondary" size="small" onClick={onClose} icon="✕">
            Close
          </Button>
        </div>

        {/* Status Banner */}
        {resolutionStatus && (
          <div style={{
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '16px',
            background: resolutionStatus.success ? '#e8f5e9' : '#ffebee',
            border: `1px solid ${resolutionStatus.success ? '#a5d6a7' : '#ef9a9a'}`,
            color: resolutionStatus.success ? '#2e7d32' : '#c62828',
            textAlign: 'center',
          }}>
            {resolutionStatus.message}
          </div>
        )}

        {/* Details Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
          padding: '16px',
          background: '#f8f9fa',
          borderRadius: '12px',
          marginBottom: '16px',
        }}>
          <div>
            <div style={{ fontSize: '12px', color: '#666' }}>Amount</div>
            <div style={{ fontSize: '22px', fontWeight: 'bold' }}>{currency(amount)}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#666' }}>Status</div>
            <StatusBadge 
              status={exception.status || 'pending'}
              label={exception.status || 'Pending Review'}
            />
          </div>
          {exception.settlement_date && (
            <div>
              <div style={{ fontSize: '12px', color: '#666' }}>Settlement Date</div>
              <div>{new Date(exception.settlement_date).toLocaleDateString()}</div>
            </div>
          )}
          {exception.utr && (
            <div>
              <div style={{ fontSize: '12px', color: '#666' }}>UTR</div>
              <div style={{ fontFamily: 'monospace', fontSize: '13px' }}>{exception.utr}</div>
            </div>
          )}
        </div>

        {/* Detail Description */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '13px', fontWeight: '500', color: '#666', marginBottom: '4px' }}>Details</div>
          <div style={{
            padding: '12px',
            background: '#f8f9fa',
            borderRadius: '8px',
            fontSize: '14px',
            color: '#333',
          }}>
            {exception.detail || exception.details || 'No additional details available'}
          </div>
        </div>

        {/* Candidate Combinations (for ambiguous_batch) */}
        {type === 'ambiguous_batch' && exception.candidate_combinations && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: '500', color: '#666', marginBottom: '8px' }}>
              🔄 Select the Correct Combination
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {exception.candidate_combinations.map((combo, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedCombination(combo)}
                  style={{
                    padding: '10px 14px',
                    background: selectedCombination === combo ? '#e3f2fd' : '#f8f9fa',
                    borderRadius: '8px',
                    border: selectedCombination === combo ? '2px solid #2196F3' : '1px solid #e9ecef',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.2s',
                  }}
                >
                  <span style={{ fontFamily: 'monospace' }}>
                    {Array.isArray(combo) ? combo.join(' + ') : combo}
                  </span>
                  {selectedCombination === combo && (
                    <span style={{ color: '#0d47a1', fontWeight: 'bold' }}>✅ Selected</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 🔥 AI Explanation - Updated with proper formatting */}
        <div style={{ marginBottom: '16px' }}>
          <Button 
            variant="outline" 
            size="small" 
            onClick={handleGetExplanation}
            disabled={loadingExplanation}
          >
            {loadingExplanation ? '⏳ Loading...' : '🤖 Get Explanation'}
          </Button>
          
          {explanation && (
            <div style={{
              marginTop: '8px',
              padding: '16px',
              background: '#e3f2fd',
              borderRadius: '8px',
              border: '1px solid #90caf9',
            }}>
              <div style={{ 
                fontSize: '13px', 
                fontWeight: '500', 
                color: '#0d47a1', 
                marginBottom: '8px' 
              }}>
                🤖 AI Explanation
              </div>
              <pre style={{
                margin: 0,
                fontSize: '14px',
                color: '#1a237e',
                lineHeight: '1.8',
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
                fontFamily: 'inherit',
                background: 'transparent',
                border: 'none',
                padding: 0,
              }}>
                {explanation}
              </pre>
            </div>
          )}
        </div>

        {/* Resolution Guide */}
        {type !== 'ambiguous_batch' && (
          <div style={{ marginBottom: '16px' }}>
            <Button 
              variant="outline" 
              size="small" 
              onClick={() => setShowGuide(!showGuide)}
              icon="📋"
            >
              {showGuide ? 'Hide Resolution Guide' : 'Show Resolution Guide'}
            </Button>
            
            {showGuide && (
              <div style={{ marginTop: '12px' }}>
                <ResolutionGuide 
                  exceptionType={type}
                  onStepComplete={(stepResult) => {
                    console.log('Step completed:', stepResult)
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* Audit Trail */}
        <div style={{ marginBottom: '16px' }}>
          <Button 
            variant="outline" 
            size="small" 
            onClick={() => setShowAudit(!showAudit)}
            icon="📋"
          >
            {showAudit ? 'Hide Audit Trail' : 'View Audit Trail'}
          </Button>
          
          {showAudit && exception.settlement_id && (
            <div style={{ marginTop: '12px' }}>
              <AuditDetails 
                settlementId={exception.settlement_id}
                onClose={() => setShowAudit(false)}
              />
            </div>
          )}
        </div>

        {/* Resolution Notes */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '13px', fontWeight: '500', color: '#666', marginBottom: '4px' }}>
            📝 Resolution Notes (optional)
          </div>
          <textarea
            value={resolutionNotes}
            onChange={(e) => setResolutionNotes(e.target.value)}
            placeholder="Add notes about this resolution..."
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid #ddd',
              fontSize: '14px',
              minHeight: '50px',
              resize: 'vertical',
              fontFamily: 'inherit',
            }}
          />
        </div>

        {/* Confirmation Section */}
        {type !== 'ambiguous_batch' && showGuide && (
          <div style={{ 
            marginTop: '16px', 
            padding: '16px',
            background: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #e9ecef',
          }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#1a1a2e' }}>
              ✅ Confirmation Checklist
            </h4>
            <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#666' }}>
              Please confirm you have completed all steps and verified the data:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                <input
                  type="checkbox"
                  checked={isConfirmed}
                  onChange={() => setIsConfirmed(!isConfirmed)}
                />
                <span>I have completed all resolution steps</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                <input
                  type="checkbox"
                  checked={isConfirmed}
                  onChange={() => setIsConfirmed(!isConfirmed)}
                />
                <span>I have verified the data and taken appropriate action</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                <input
                  type="checkbox"
                  checked={isConfirmed}
                  onChange={() => setIsConfirmed(!isConfirmed)}
                />
                <span>I am ready to confirm this resolution</span>
              </label>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          flexWrap: 'wrap',
          paddingTop: '16px',
          borderTop: '1px solid #eee',
        }}>
          <Button 
            variant="secondary" 
            onClick={onClose} 
            disabled={loading}
            style={{ minWidth: '100px' }}
          >
            Cancel
          </Button>
          
          <Button 
            variant="success" 
            onClick={handleResolve}
            disabled={
              loading || 
              (type === 'ambiguous_batch' && !selectedCombination) ||
              (type !== 'ambiguous_batch' && !isConfirmed)
            }
            style={{
              minWidth: '180px',
              padding: '12px 32px',
              fontSize: '16px',
            }}
          >
            {loading ? '⏳ Processing...' : '✅ Confirm & Resolve'}
          </Button>
        </div>

        {/* Help text */}
        {type === 'ambiguous_batch' && !selectedCombination && (
          <div style={{
            marginTop: '12px',
            padding: '8px 12px',
            background: '#fff3cd',
            borderRadius: '6px',
            fontSize: '12px',
            color: '#856404',
            textAlign: 'center',
          }}>
            💡 Select a combination above to enable resolution
          </div>
        )}

        {type !== 'ambiguous_batch' && showGuide && !isConfirmed && (
          <div style={{
            marginTop: '12px',
            padding: '8px 12px',
            background: '#fff3cd',
            borderRadius: '6px',
            fontSize: '12px',
            color: '#856404',
            textAlign: 'center',
          }}>
            📋 Please complete the confirmation checklist to enable resolution
          </div>
        )}
      </div>
    </div>
  )
}