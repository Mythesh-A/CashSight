/**
 * MatchSummaryCard - Display matches summary with View All button
 */
import React from 'react'
import { Card, Button, StatusBadge } from '../common'
import { currency, matchTypeLabel } from '../../utils/formatters'

export default function MatchSummaryCard({ count, amount, matches = [], onViewAll }) {
  return (
    <Card 
      title="Matches" 
      icon="✅"
      subtitle={`${count} matched settlements • ${currency(amount)}`}
      variant="success"
    >
      {matches.length > 0 ? (
        <div style={{ maxHeight: '200px', overflow: 'auto' }}>
          {matches.map((match, index) => (
            <div 
              key={index}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 0',
                borderBottom: index < matches.length - 1 ? '1px solid #f0f0f0' : 'none',
                fontSize: '13px',
              }}
            >
              <span style={{ fontFamily: 'monospace' }}>
                {match.settlement_id}
              </span>
              <span>
                <StatusBadge 
                  status={match.match_type === 'clean' ? 'success' : 'info'}
                  label={matchTypeLabel(match.match_type)}
                  size="small"
                  showIcon={false}
                />
              </span>
              <span style={{ fontWeight: '500' }}>
                {currency(match.net_amount || match.gross_amount || 0)}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
          No matches found
        </div>
      )}
      
      {/* 🔥 View All Matches Button */}
      {count > 0 && onViewAll && (
        <div style={{ marginTop: '12px', textAlign: 'center' }}>
          <Button 
            variant="success" 
            size="small" 
            onClick={onViewAll}
            icon="✅"
          >
            View All {count} Matches →
          </Button>
        </div>
      )}
    </Card>
  )
}