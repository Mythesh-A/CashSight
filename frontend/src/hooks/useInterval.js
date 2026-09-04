/**
 * useInterval - Hook for interval operations
 */
import { useEffect, useRef } from 'react'

export function useInterval(callback, delay) {
  const savedCallback = useRef()

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    if (delay !== null) {
      const interval = setInterval(() => {
        savedCallback.current()
      }, delay)

      return () => {
        clearInterval(interval)
      }
    }
  }, [delay])
}