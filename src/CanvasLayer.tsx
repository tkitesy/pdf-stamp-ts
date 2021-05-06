import * as React from 'react'
import { pdfjs } from 'react-pdf'
interface Props {
  width: number
  height: number
  scale: number
  rotation: number
  page: pdfjs.PDFPageProxy
}

export function CanvasLayer({ page, width, height, scale, rotation }: Props) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const taskRef = React.useRef<pdfjs.PDFRenderTask>()
  React.useLayoutEffect(() => {
    if (taskRef.current) {
      taskRef.current.cancel()
    }
    const canvasElement = canvasRef.current
    if (!canvasElement) {
      return
    }
    const devicePixelRatio = window.devicePixelRatio || 1
    const viewport = page.getViewport({
      scale: scale * devicePixelRatio,
      rotation: rotation
    })
    canvasElement.height = height * devicePixelRatio
    canvasElement.width = width * devicePixelRatio
    canvasElement.style.opacity = '0'

    const canvasContext = canvasElement.getContext('2d', {
      alpha: false
    }) as CanvasRenderingContext2D
    taskRef.current = page.render({ canvasContext, viewport })
    taskRef.current.promise.then(
      () => {
        canvasElement.style.removeProperty('opacity')
        taskRef.current = undefined
      },
      () => {}
    )
  }, [scale, rotation, page, width, height])
  return (
    <div
      style={{
        width: width + 'px',
        height: height + 'px',
        overflow: 'hidden',
        position: 'absolute',
        top: 0,
        left: 0
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          transform: `scale(${1 / devicePixelRatio})`,
          transformOrigin: `top left`
        }}
      ></canvas>
    </div>
  )
}
