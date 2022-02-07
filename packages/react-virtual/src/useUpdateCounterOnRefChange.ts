import * as React from 'react'
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect'

export const useUpdateCounterOnRefChange = <T extends unknown>(
  ref: React.MutableRefObject<T>,
) => {
  const [updateCounter, setUpdateCounter] = React.useState(0)

  const afterFirstEffectRef = React.useRef(false)

  const prevRef = React.useRef<T>(ref.current)

  useIsomorphicLayoutEffect(() => {
    if (afterFirstEffectRef.current && ref.current !== prevRef.current) {
      setUpdateCounter((prev) => prev + 1)
    }
    afterFirstEffectRef.current = true
    prevRef.current = ref.current
  })

  return updateCounter
}
