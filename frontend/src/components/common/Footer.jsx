/**
 * Footer - Advanced professional footer with developer links
 */
import React from 'react'

export default function Footer({
  text = 'CashSight - AI Finance Controller for Razorpay Buildathon',
  links = [],
  showDevLinks = true,
}) {
  // LinkedIn SVG Icon
  const LinkedInIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  )

  // GitHub SVG Icon
  const GitHubIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.15 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.62.24 2.85.12 3.15.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
    </svg>
  )

  // Email SVG Icon
  const EmailIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 4.5v15c0 .85-.65 1.5-1.5 1.5H1.5C.65 21 0 20.35 0 19.5v-15c0-.85.65-1.5 1.5-1.5h21c.85 0 1.5.65 1.5 1.5zM12 12.75l-9-6.75v12h18v-12l-9 6.75zM12 10.5l8.25-6.75H3.75L12 10.5z"/>
    </svg>
  )

  // Resume SVG Icon
  const ResumeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
    </svg>
  )

  // Portfolio/Website SVG Icon
  const PortfolioIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
    </svg>
  )

  const defaultLinks = [
    
    {
      label: 'LinkedIn',
      url: 'https://linkedin.com/in/mythesh', 
      icon: <LinkedInIcon />,
      hoverColor: '#0A66C2',
    },
    {
      label: 'GitHub',
      url: 'https://github.com/Mythesh-A', 
      icon: <GitHubIcon />,
      hoverColor: '#333',
    },
    {
      label: 'Portfolio',
      url: 'https://mythesh-portfolio.netlify.app/',
      icon: <PortfolioIcon />,
      hoverColor: '#FF6B6B',
    },
    {
      label: 'Email',
      url: 'mailto:mythesh.ff@gmail.com',
      icon: <EmailIcon />,
      hoverColor: '#EA4335',
    },
    {
      label: 'Resume',
      url: 'https://drive.google.com/file/d/1TecaTy388UYDQ1CipO7cmfy6zw67_u9r/preview', 
      icon: <ResumeIcon />,
      hoverColor: '#4CAF50',
    },
  ]

  const displayLinks = links.length > 0 ? links : defaultLinks

  return (
    <footer style={{
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      color: 'rgba(255,255,255,0.8)',
      borderTop: '1px solid rgba(255,255,255,0.08)',
      padding: '32px 20px 20px',
      textAlign: 'center',
      fontSize: '13px',
      marginTop: '40px',
      boxShadow: '0 -4px 20px rgba(0,0,0,0.2)',
    }}>
      <p style={{
        margin: 0,
        fontWeight: '600',
        fontSize: '15px',
        letterSpacing: '0.5px',
        color: 'white',
        opacity: 0.9,
      }}>
        {text}
      </p>

      {/* Decorative divider */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '12px',
        margin: '16px auto 18px',
        width: '220px',
      }}>
        <span style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2))' }} />
        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>✦</span>
        <span style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(255,255,255,0.2), transparent)' }} />
      </div>

      {/* Social Links */}
      {showDevLinks && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '6px',
          marginTop: '4px',
        }}>
          {displayLinks.map((link, index) => (
            <a
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 18px',
                borderRadius: '8px',
                color: 'rgba(255,255,255,0.7)',
                textDecoration: 'none',
                fontSize: '13px',
                fontWeight: '500',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.06)',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'white'
                e.currentTarget.style.background = 'rgba(255,255,255,0.12)'
                e.currentTarget.style.borderColor = link.hoverColor || 'rgba(255,255,255,0.2)'
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = `0 4px 20px rgba(0,0,0,0.3)`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgba(255,255,255,0.7)'
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <span style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '20px',
                height: '20px',
                color: 'rgba(255,255,255,0.8)',
              }}>
                {link.icon}
              </span>
              <span>{link.label}</span>
            </a>
          ))}
        </div>
      )}

      {/* Bottom footer text */}
      <div style={{
        marginTop: '20px',
        fontSize: '11px',
        color: 'rgba(255,255,255,0.3)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        paddingTop: '16px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '12px',
        flexWrap: 'wrap',
      }}>
        <span>© {new Date().getFullYear()} CashSight</span>
        <span style={{ color: 'rgba(255,255,255,0.15)' }}>•</span>
        <span style={{ color: 'rgba(255,255,255,0.4)' }}>Built for Razorpay Buildathon</span>
      </div>
    </footer>
  )
}