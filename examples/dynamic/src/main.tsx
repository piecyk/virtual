import React from 'react'
import ReactDOM from 'react-dom'

import './index.css'

import { useElementScroll, useRect, useVirtual } from '../../../packages/react-virtual'

function RowVirtualizerDynamic({ rows }: { rows: number[] }) {
  const parentRef = React.useRef<HTMLDivElement>(null)

  const rowVirtualizer = useVirtual({
    size: rows.length,
    parentRef,
  })

  return (
    <div>
      <div
        ref={parentRef}
        className="List"
        style={{
          width: 400,
          height: 400,
          overflow: 'auto'
        }}
      >
        <div
          style={{
            height: rowVirtualizer.totalSize,
            width: '100%',
            position: 'relative',
          }}
        >
          {rowVirtualizer.virtualItems.map((virtualRow) => (
            <div
              key={virtualRow.index}
              className={virtualRow.index % 2 ? 'ListItemOdd' : 'ListItemEven'}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <div style={{ height: 50 }}>Row {virtualRow.index}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function App() {
  const rows = new Array(10000)
    .fill(true)
    .map(() => 25 + Math.round(Math.random() * 100))

  const columns = new Array(10000)
    .fill(true)
    .map(() => 75 + Math.round(Math.random() * 100))

  return (
    <div>
      <p>
        These components are using <strong>dynamic</strong> sizes. This means
        that each element's exact dimensions are unknown when rendered. An
        estimated dimension is used to get an a initial measurement, then this
        measurement is readjusted on the fly as each element is rendered.
      </p>
      <br />
      <br />

      <h3>Rows</h3>
      <RowVirtualizerDynamic rows={rows} />
    </div>
  )
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root'),
)
