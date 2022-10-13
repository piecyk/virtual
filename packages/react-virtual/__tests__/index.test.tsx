import * as React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'

import { useVirtualizer, Range } from '../src/index'

let renderer: jest.Mock<undefined, []>

interface ListProps {
  count?: number
  overscan?: number
  height?: number
  width?: number
  itemSize?: number
  rangeExtractor?: (range: Range) => number[]
  dynamic?: boolean
}

function List({
  count = 200,
  overscan,
  height = 200,
  width = 200,
  itemSize,
  rangeExtractor,
  dynamic,
}: ListProps) {
  renderer()

  const parentRef = React.useRef<HTMLDivElement>(null)

  const rowVirtualizer = useVirtualizer({
    count,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
    overscan,
    observeElementRect: (_, cb) => {
      cb({ height, width })
    },
    measureElement: () => itemSize ?? 0,
    rangeExtractor,
  })

  return (
    <div
      ref={parentRef}
      style={{ height, width, overflow: 'auto' }}
      data-testid="scroller"
    >
      <div
        style={{
          height: rowVirtualizer.getTotalSize(),
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => (
          <div
            data-testid={`item-${virtualRow.key}`}
            key={virtualRow.key}
            data-index={virtualRow.index}
            ref={(el) =>
              dynamic ? rowVirtualizer.measureElement(el) : undefined
            }
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualRow.start}px)`,
              height: itemSize,
            }}
          >
            Row {virtualRow.index}
          </div>
        ))}
      </div>
    </div>
  )
}

beforeEach(() => {
  renderer = jest.fn(() => undefined)
})

test('should render', () => {
  render(<List />)

  expect(screen.queryByText('Row 0')).toBeInTheDocument()
  expect(screen.queryByText('Row 4')).toBeInTheDocument()
  expect(screen.queryByText('Row 5')).not.toBeInTheDocument()

  expect(renderer).toHaveBeenCalledTimes(2)
})

test('should render with overscan', () => {
  render(<List overscan={0} />)

  expect(screen.queryByText('Row 0')).toBeInTheDocument()
  expect(screen.queryByText('Row 3')).toBeInTheDocument()
  expect(screen.queryByText('Row 4')).not.toBeInTheDocument()

  expect(renderer).toHaveBeenCalledTimes(2)
})

test('should render given dynamic size', async () => {
  render(<List itemSize={100} dynamic />)

  expect(screen.queryByText('Row 0')).toBeInTheDocument()
  expect(screen.queryByText('Row 1')).toBeInTheDocument()
  expect(screen.queryByText('Row 2')).toBeInTheDocument()
  expect(screen.queryByText('Row 3')).not.toBeInTheDocument()

  expect(renderer).toHaveBeenCalledTimes(3)
})

test.only('should render given dynamic size after scroll', () => {
  render(<List itemSize={100} dynamic />)

  expect(screen.queryByText('Row 0')).toBeInTheDocument()
  expect(screen.queryByText('Row 1')).toBeInTheDocument()
  expect(screen.queryByText('Row 2')).toBeInTheDocument()
  expect(screen.queryByText('Row 3')).not.toBeInTheDocument()

  expect(renderer).toHaveBeenCalledTimes(3)
  renderer.mockReset()

  fireEvent.scroll(screen.getByTestId('scroller'), {
    target: { scrollTop: 400 },
  })

  expect(screen.queryByText('Row 3')).not.toBeInTheDocument()
  expect(screen.queryByText('Row 4')).toBeInTheDocument()
  expect(screen.queryByText('Row 9')).toBeInTheDocument()
  expect(screen.queryByText('Row 10')).not.toBeInTheDocument()

  expect(renderer).toHaveBeenCalledTimes(2)
})

test('should use rangeExtractor', () => {
  render(<List rangeExtractor={() => [0, 1]} />)

  expect(screen.queryByText('Row 0')).toBeInTheDocument()
  expect(screen.queryByText('Row 1')).toBeInTheDocument()
  expect(screen.queryByText('Row 2')).not.toBeInTheDocument()
})
