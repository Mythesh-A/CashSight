/**
 * useWindowSize - Hook for responsive design
 */
import { useState, useEffect } from 'react'

export function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
    }
  }, [])

  const breakpoints = {
    isMobile: windowSize.width < 576,
    isTablet: windowSize.width >= 576 && windowSize.width < 992,
    isDesktop: windowSize.width >= 992,
    isWide: windowSize.width >= 1200,
  }

  return { ...windowSize, ...breakpoints }
}