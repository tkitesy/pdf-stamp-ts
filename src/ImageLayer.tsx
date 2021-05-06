import * as React from 'react'
import { pdfjs } from 'react-pdf'

interface Props {
  width: number
  height: number
  scale: number
  rotation: number
  page: pdfjs.PDFPageProxy
}

export function ImageLayer({ page, width, height, scale, rotation }: Props) {
  const taskRef = React.useRef<pdfjs.PDFRenderTask>()
  const [src, setSrc] = React.useState('')
  React.useLayoutEffect(() => {
    if (taskRef.current) {
      taskRef.current.cancel()
    }
    const canvasElement = document.createElement('canvas')
    const viewport = page.getViewport({
      scale: scale * devicePixelRatio,
      rotation: rotation
    })
    canvasElement.width = width * devicePixelRatio
    canvasElement.height = height * devicePixelRatio

    const canvasContext = canvasElement.getContext('2d', {
      alpha: false
    }) as CanvasRenderingContext2D
    taskRef.current = page.render({ canvasContext, viewport })
    taskRef.current.promise.then(
      () => {
        setSrc(canvasElement.toDataURL())
        taskRef.current = undefined
      },
      () => {}
    )

    return () => {
      if (taskRef.current) {
        taskRef.current.cancel()
      }
    }
  }, [scale, rotation, page, width, height])

  return !src ? (
    <span></span>
  ) : (
    <img
      src={src}
      height={`${height}px`}
      width={`${width}px`}
      style={{ position: 'absolute', top: '0', left: '0' }}
    />
  )
}
