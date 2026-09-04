/**
 * ExceptionResolver - Resolve exception component
 */
import React, { useState } from 'react'
import { Button, Card } from '../common'

export default function ExceptionResolver({ exception, onResolve, onCancel }) {
  const [decision, setDecision] = useState('confirm')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await onResolve(exception.id, decision, notes)
    } catch (error) {
      console.error('Failed to resolve:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card title="🔧 Resolve Exception">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <div style={{ fontSize: '13px', fontWeight: '500', marginBottom: '8px' }}>
            Decision
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['confirm', 'reject', 'investigate'].map(option => (
              <button
                key={option}
                onClick={() => setDecision(option)}
                style={{
                  padding: '6px 16px',
                  borderRadius: '6px',
                  border: '1px solid',
                  borderColor: decision === option ? '#2196F3' : '#ddd',
                  background: decision === option ? '#e3f2fd' : 'white',
                  color: decision === option ? '#0d47a1' : '#666',
                  cursor: 'pointer',
                  fontSize: '13px',
                  textTransform: 'capitalize',
                }}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '13px', fontWeight: '500', marginBottom: '8px' }}>
            Notes (optional)
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes about this resolution..."
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid #ddd',
              fontSize: '14px',
              minHeight: '80px',
              resize: 'vertical',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleSubmit} loading={loading}>
            Submit Resolution
          </Button>
        </div>
      </div>
    </Card>
  )
}