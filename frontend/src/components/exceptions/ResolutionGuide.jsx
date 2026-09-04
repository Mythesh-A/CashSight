/**
 * ResolutionGuide - Step-by-step resolution guide (steps only, no confirmation)
 */
import React, { useState } from 'react'
import { Button } from '../common'

export default function ResolutionGuide({ exceptionType, onStepComplete }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState([])
  const [notes, setNotes] = useState('')
  const [selectedActions, setSelectedActions] = useState({})

  const guides = {
    missing_bank_credit: {
      title: '🔴 Missing Bank Credit',
      description: 'A settlement was created in Razorpay, but the money never appeared in your bank account.',
      steps: [
        {
          title: 'Step 1: Check Timeline',
          description: 'Bank usually credits in 1-2 days. Select the current status:',
          actions: [
            { label: '⏳ Less than 1 day → WAIT', value: 'wait' },
            { label: '📊 1-2 days → MONITOR', value: 'monitor' },
            { label: '🔍 2+ days → INVESTIGATE', value: 'investigate' },
            { label: '🚨 5+ days → ESCALATE', value: 'escalate' },
          ]
        },
        {
          title: 'Step 2: Verify Details',
          description: 'Check the following details (select all that apply):',
          actions: [
            { label: '✅ UTR number is correct', value: 'utr_ok' },
            { label: '✅ Correct bank account', value: 'bank_ok' },
            { label: '✅ Checked bank statement', value: 'statement_checked' },
            { label: '✅ Checked for similar amount', value: 'similar_checked' },
          ],
          multiSelect: true
        },
        {
          title: 'Step 3: Take Action',
          description: 'Select the action you are taking:',
          actions: [
            { label: '⏳ Mark as Pending', value: 'pending' },
            { label: '🔍 Investigate', value: 'investigate' },
            { label: '📞 Contact Bank', value: 'contact_bank' },
            { label: '🚨 Escalate to Razorpay', value: 'escalate' },
          ]
        }
      ]
    },
    unlinked_credit: {
      title: '🔵 Unlinked Credit',
      description: 'Money appeared in your bank account, but there is NO matching settlement in Razorpay.',
      steps: [
        {
          title: 'Step 1: Analyze the Credit',
          description: 'Check the bank transaction details (select all that apply):',
          actions: [
            { label: '✅ Checked bank narration/purpose', value: 'narration_checked' },
            { label: '✅ Noted UTR number', value: 'utr_noted' },
            { label: '✅ Noted credited amount', value: 'amount_noted' },
            { label: '✅ Checked value date', value: 'date_checked' },
          ],
          multiSelect: true
        },
        {
          title: 'Step 2: Search for Source',
          description: 'Where did you search? (select all that apply):',
          actions: [
            { label: '🔍 Searched Razorpay Dashboard by UTR', value: 'search_razorpay' },
            { label: '📁 Checked all settlement files', value: 'check_settlements' },
            { label: '📋 Checked if amount matches any order', value: 'check_orders' },
            { label: '🔄 Checked for refund reversal', value: 'check_refunds' },
            { label: '🏢 Checked if from other merchant', value: 'check_other_merchant' },
          ],
          multiSelect: true
        },
        {
          title: 'Step 3: Identify Type of Credit',
          description: 'Select the type of credit:',
          actions: [
            { label: '✅ Valid Settlement → Add missing settlement', value: 'valid_settlement' },
            { label: '📌 Orphan Credit → Mark as orphan', value: 'orphan' },
            { label: '🔄 Wrong Merchant → Refund/Return', value: 'wrong_merchant' },
            { label: '🗑️ Duplicate Credit → Mark as duplicate', value: 'duplicate' },
            { label: '🧪 Test Transaction → Mark as test', value: 'test' },
          ]
        }
      ]
    },
    unresolved_batch: {
      title: '🟡 Unresolved Batch',
      description: 'Bank credit found, but no combination of ledger orders explains the amount.',
      steps: [
        {
          title: 'Step 1: Verify Bank Credit',
          description: 'Verify the bank transaction details:',
          actions: [
            { label: '✅ Verify UTR matches', value: 'verify_utr' },
            { label: '✅ Check credited amount', value: 'check_amount' },
            { label: '✅ Verify settlement date', value: 'check_date' },
          ],
          multiSelect: true
        },
        {
          title: 'Step 2: Review Ledger Orders',
          description: 'Check for matching orders (select all that apply):',
          actions: [
            { label: '📋 Searched for orders with similar amount', value: 'search_orders' },
            { label: '📅 Checked orders in the date window', value: 'check_date_window' },
            { label: '🔄 Checked for refunded/reversed orders', value: 'check_refunded' },
            { label: '📊 Verified order amounts', value: 'verify_amounts' },
          ],
          multiSelect: true
        },
        {
          title: 'Step 3: Resolution',
          description: 'Select the resolution:',
          actions: [
            { label: '✅ Found matching orders → Confirm match', value: 'confirm_match' },
            { label: '📌 No matching orders → Mark as orphan', value: 'mark_orphan' },
            { label: '🔍 Need more investigation → Investigate', value: 'investigate' },
          ]
        }
      ]
    },
    ambiguous_batch: {
      title: '🟠 Ambiguous Batch',
      description: 'Multiple valid order combinations sum to the same settlement amount.',
      steps: [
        {
          title: 'Step 1: Review Combinations',
          description: 'Review each combination (select all that apply):',
          actions: [
            { label: '📋 Reviewed Combination A', value: 'review_a' },
            { label: '📋 Reviewed Combination B', value: 'review_b' },
            { label: '📊 Verified order amounts', value: 'verify_amounts' },
            { label: '📅 Checked order dates', value: 'check_dates' },
          ],
          multiSelect: true
        },
        {
          title: 'Step 2: Verify Business Context',
          description: 'Which combination makes business sense?',
          actions: [
            { label: '✅ Combination A is correct', value: 'combo_a' },
            { label: '✅ Combination B is correct', value: 'combo_b' },
            { label: '🔍 Need more investigation', value: 'investigate' },
          ]
        },
        {
          title: 'Step 3: Select Combination',
          description: 'Select the correct combination:',
          actions: [
            { label: '✅ Confirm Combination A', value: 'confirm_a' },
            { label: '✅ Confirm Combination B', value: 'confirm_b' },
            { label: '📌 Cannot determine → Mark for review', value: 'mark_review' },
          ]
        }
      ]
    }
  }

  const guide = guides[exceptionType]
  if (!guide) return null

  const totalSteps = guide.steps.length
  const currentStepData = guide.steps[currentStep]
  const isLastStep = currentStep === totalSteps - 1
  const isFirstStep = currentStep === 0

  const handleAction = (action) => {
    // Mark step as completed
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep])
    }

    // Store the action
    setSelectedActions({
      ...selectedActions,
      [currentStep]: action
    })

    const stepResult = {
      step: currentStep,
      stepTitle: currentStepData.title,
      action: action,
      notes: notes,
      timestamp: new Date().toISOString(),
    }

    if (onStepComplete) {
      onStepComplete(stepResult)
    }
  }

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      const stepResult = {
        step: currentStep,
        stepTitle: currentStepData.title,
        notes: notes,
        timestamp: new Date().toISOString(),
      }
      if (onStepComplete) {
        onStepComplete(stepResult)
      }
      setCurrentStep(currentStep + 1)
      setNotes('')
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const progress = Math.round((completedSteps.length / totalSteps) * 100)

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '24px',
      border: '1px solid #e9ecef',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
      }}>
        <div>
          <h3 style={{ margin: 0 }}>{guide.title}</h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#666' }}>
            {guide.description}
          </p>
        </div>
        <div style={{ fontSize: '13px', color: '#666' }}>
          Step {currentStep + 1} of {totalSteps}
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{
        width: '100%',
        height: '6px',
        background: '#f0f0f0',
        borderRadius: '3px',
        marginBottom: '20px',
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${progress}%`,
          height: '100%',
          background: progress === 100 ? '#4CAF50' : '#2196F3',
          transition: 'width 0.3s ease',
        }} />
      </div>

      {/* Step Content */}
      <div style={{ marginBottom: '16px' }}>
        <h4 style={{ margin: '0 0 8px 0', color: '#1a1a2e' }}>
          {currentStepData.title}
        </h4>
        <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#666' }}>
          {currentStepData.description}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {currentStepData.actions.map((action, index) => (
            <button
              key={index}
              onClick={() => handleAction(action.value)}
              style={{
                padding: '10px 14px',
                background: selectedActions[currentStep] === action.value ? '#e3f2fd' : '#f8f9fa',
                border: selectedActions[currentStep] === action.value ? '2px solid #2196F3' : '1px solid #e9ecef',
                borderRadius: '8px',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '14px',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                justifyContent: 'space-between',
              }}
              onMouseEnter={(e) => {
                if (selectedActions[currentStep] !== action.value) {
                  e.currentTarget.style.background = '#e3f2fd'
                  e.currentTarget.style.borderColor = '#2196F3'
                }
              }}
              onMouseLeave={(e) => {
                if (selectedActions[currentStep] !== action.value) {
                  e.currentTarget.style.background = '#f8f9fa'
                  e.currentTarget.style.borderColor = '#e9ecef'
                }
              }}
            >
              <span>{action.label}</span>
              {selectedActions[currentStep] === action.value && (
                <span style={{ color: '#2196F3', fontWeight: 'bold' }}>✅ Selected</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '13px', fontWeight: '500', color: '#666', marginBottom: '4px' }}>
          📝 Notes for this step
        </div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add your findings, observations, or actions taken..."
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

      {/* Navigation */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '8px',
      }}>
        <Button 
          variant="secondary" 
          size="small" 
          onClick={handlePrevious}
          disabled={isFirstStep}
        >
          ← Previous
        </Button>
        
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', color: '#999' }}>
            {completedSteps.length} of {totalSteps} steps completed
          </span>
          <Button 
            variant="primary" 
            size="small" 
            onClick={handleNext}
            disabled={!selectedActions[currentStep] || isLastStep}
          >
            Next Step →
          </Button>
        </div>
      </div>

      {!selectedActions[currentStep] && (
        <div style={{
          marginTop: '8px',
          padding: '8px 12px',
          background: '#fff3cd',
          borderRadius: '6px',
          fontSize: '12px',
          color: '#856404',
          textAlign: 'center',
        }}>
          💡 Select an action above to continue
        </div>
      )}
    </div>
  )
}