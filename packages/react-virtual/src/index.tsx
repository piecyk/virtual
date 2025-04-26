import * as React from 'react'
import { flushSync } from 'react-dom'
import {
  Virtualizer,
  elementScroll,
  observeElementOffset,
  observeElementRect,
  observeWindowOffset,
  observeWindowRect,
  windowScroll,
} from '@tanstack/virtual-core'
import type {
  PartialKeys,
  VirtualKey,
  VirtualizerOptions,
} from '@tanstack/virtual-core'

export * from '@tanstack/virtual-core'

const useIsomorphicLayoutEffect =
  typeof document !== 'undefined' ? React.useLayoutEffect : React.useEffect

function useVirtualizerBase<
  TScrollElement extends Element | Window,
  TItemElement extends Element,
  TKey extends VirtualKey,
>(
  options: VirtualizerOptions<TScrollElement, TItemElement, TKey>,
): Virtualizer<TScrollElement, TItemElement, TKey> {
  const rerender = React.useReducer(() => ({}), {})[1]

  const resolvedOptions: VirtualizerOptions<
    TScrollElement,
    TItemElement,
    TKey
  > = {
    ...options,
    onChange: (instance, sync) => {
      if (sync) {
        flushSync(rerender)
      } else {
        rerender()
      }
      options.onChange?.(instance, sync)
    },
  }

  const [instance] = React.useState(
    () => new Virtualizer<TScrollElement, TItemElement, TKey>(resolvedOptions),
  )

  instance.setOptions(resolvedOptions)

  useIsomorphicLayoutEffect(() => {
    return instance._didMount()
  }, [])

  useIsomorphicLayoutEffect(() => {
    return instance._willUpdate()
  })

  return instance
}

export function useVirtualizer<
  TScrollElement extends Element,
  TItemElement extends Element,
  TKey extends VirtualKey,
>(
  options: PartialKeys<
    VirtualizerOptions<TScrollElement, TItemElement, TKey>,
    'observeElementRect' | 'observeElementOffset' | 'scrollToFn'
  >,
): Virtualizer<TScrollElement, TItemElement, TKey> {
  return useVirtualizerBase<TScrollElement, TItemElement, TKey>({
    observeElementRect: observeElementRect,
    observeElementOffset: observeElementOffset,
    scrollToFn: elementScroll,
    ...options,
  })
}

export function useWindowVirtualizer<
  TItemElement extends Element,
  TKey extends VirtualKey,
>(
  options: PartialKeys<
    VirtualizerOptions<Window, TItemElement, TKey>,
    | 'getScrollElement'
    | 'observeElementRect'
    | 'observeElementOffset'
    | 'scrollToFn'
  >,
): Virtualizer<Window, TItemElement, TKey> {
  return useVirtualizerBase<Window, TItemElement, TKey>({
    getScrollElement: () => (typeof document !== 'undefined' ? window : null),
    observeElementRect: observeWindowRect,
    observeElementOffset: observeWindowOffset,
    scrollToFn: windowScroll,
    initialOffset: () => (typeof document !== 'undefined' ? window.scrollY : 0),
    ...options,
  })
}
