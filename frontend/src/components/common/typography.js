/**
 * Typography - Text styling components
 */
import React from 'react'

export const Heading = ({ level = 1, children, ...props }) => {
  const styles = {
    1: { fontSize: '32px', fontWeight: '700' },
    2: { fontSize: '28px', fontWeight: '600' },
    3: { fontSize: '24px', fontWeight: '600' },
    4: { fontSize: '20px', fontWeight: '500' },
    5: { fontSize: '16px', fontWeight: '500' },
    6: { fontSize: '14px', fontWeight: '500' },
  }

  const Tag = `h${level}`
  return <Tag style={{ ...styles[level], margin: '0 0 12px 0' }} {...props}>{children}</Tag>
}

export const Text = ({ variant = 'body', children, ...props }) => {
  const variants = {
    body: { fontSize: '15px', lineHeight: '1.6' },
    small: { fontSize: '13px', lineHeight: '1.5', color: '#666' },
    large: { fontSize: '18px', lineHeight: '1.7' },
    muted: { fontSize: '14px', color: '#999' },
    bold: { fontSize: '15px', fontWeight: '600' },
  }

  return <p style={{ ...variants[variant], margin: 0 }} {...props}>{children}</p>
}