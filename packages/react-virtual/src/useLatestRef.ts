import * as React from 'react'
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect'

export const useLatestRef = <T extends unknown>(value: T) => {
  const ref = React.useRef(value)

  useIsomorphicLayoutEffect(() => {
    ref.current = value
  })

  return ref
}
