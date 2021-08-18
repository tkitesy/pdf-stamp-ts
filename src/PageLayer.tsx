import * as React from 'react'
import { pdfjs } from 'react-pdf'
import { usePDF } from './PdfLoader'
import { usePDFView } from './PDFView'
import { usePDFDefaultViewPort } from './PDFViewPort'
import { useIntersection } from 'react-use'
import { CanvasLayer } from './CanvasLayer'
import { usePageNavigation } from './PageNavigation'
import { StampLayer } from './Stamp'

const intersectionThreshold = Array(10)
  .fill(null)
  .map((_, i) => i / 10)

interface Props {
  pageIndex: number
}
export function PageLayer({ pageIndex }: Props) {
   
  const pdf = usePDF()
  const {
    pageVisibilityChanged,
    unregisterPage,
    registerPage
  } = usePageNavigation()

  const containerRef = React.useRef<HTMLDivElement | null>(null)
  const viewport = usePDFDefaultViewPort()
  const { scale, rotate } = usePDFView()
  const op: any = { scale, rotate }
  const userViewport = viewport.clone(op)
  const [page, setPage] = React.useState<pdfjs.PDFPageProxy | null>(null)
  const [pageSize, setPageSize] = React.useState({
    pageWidth: 0,
    pageHeight: 0
  })
  const [rendered, setRendered] = React.useState(false)

  React.useLayoutEffect(() => {
    registerPage(pageIndex, containerRef.current)
    return () => {
      unregisterPage(pageIndex)
    }
  }, [pageIndex, containerRef.current])

  React.useEffect(() => {
    pdf.getPage(pageIndex + 1).then((page) => {
      setPage(page)
    })
  }, [pageIndex])

  React.useEffect(() => {
    if (page) {
      const vp = page.getViewport({ scale, rotation: rotate })
      setPageSize({
        pageWidth: vp.width,
        pageHeight: vp.height
      })
    }
  }, [page, rotate, scale])

  const entry = useIntersection(containerRef, {
    threshold: intersectionThreshold
  })

  React.useEffect(() => {
    pageVisibilityChanged(pageIndex, entry?.intersectionRatio)
  }, [pageIndex, entry?.intersectionRatio || -1])

  React.useEffect(() => {
    setRendered(false)
  }, [pageIndex, rotate, scale])

  React.useEffect(() => {
    if (page && entry && entry.intersectionRatio > 0) {
      setRendered(true)
    }
  }, [entry, page, rotate, scale])

  const w = pageSize.pageWidth || userViewport.width
  const h = pageSize.pageHeight || userViewport.height
  let style: React.CSSProperties = {
    width: `${w}px`,
    height: `${h}px`,
    overflow: 'hidden',
    position: 'relative'
  }

  return (
    <div ref={containerRef} className={`pdf-page`} style={style}>
      {rendered && page ? (
        <React.Fragment>
          <CanvasLayer
            width={w}
            height={h}
            scale={scale}
            page={page}
            rotation={rotate}
          />
          <StampLayer
            width={w}
            height={h}
            scale={scale}
            pageIndex={pageIndex}
            page={page}
            rotation={rotate}
          />
        </React.Fragment>
      ) : (
        ''
      )}
    </div>
  )
}
