import * as React from 'react'
import { pdfjs } from 'react-pdf'
import { useIntersection } from 'react-use'
import { ImageLayer } from './ImageLayer'
import { usePageNavigation } from './PageNavigation'
import { usePDF } from './PdfLoader'
import { usePDFView } from './PDFView'
import { usePDFDefaultViewPort } from './PDFViewPort'
import { StampLayer } from './Stamp'

interface Props {
  pageIndex: number
  thumbnailWidth: number
  className?: string
}
export function ThumbItem({ pageIndex, className, thumbnailWidth }: Props) {
  const pdf = usePDF()
  const containerRef = React.useRef<HTMLDivElement | null>(null)
  const viewport = usePDFDefaultViewPort()
  const { rotate } = usePDFView()
  const op: any = { scale: 1, rotate }
  const userViewport = viewport.clone(op)
  const [page, setPage] = React.useState<pdfjs.PDFPageProxy | null>(null)
  const [pageSize, setPageSize] = React.useState({
    pageWidth: 0,
    pageHeight: 0
  })
  const [rendered, setRendered] = React.useState(false)
  const { currentPage, scrollTo } = usePageNavigation()
  const active = currentPage === pageIndex

  React.useEffect(() => {
    pdf.getPage(pageIndex + 1).then((page) => {
      setPage(page)
    })
  }, [pageIndex])

  React.useEffect(() => {
    if (page) {
      const vp = page.getViewport({ scale: 1, rotation: rotate })
      setPageSize({
        pageWidth: vp.width,
        pageHeight: vp.height
      })
    }
  }, [page, rotate])

  const entry = useIntersection(containerRef, {
    threshold: 0
  })

  React.useEffect(() => {
    setRendered(false)
  }, [pageIndex, rotate])

  React.useEffect(() => {
    if (page && entry && entry.intersectionRatio > 0) {
      setRendered(true)
    }
  }, [entry, page, rotate, thumbnailWidth])

  React.useLayoutEffect(() => {
    if (active && containerRef.current) {
      // ;(containerRef.current as any).scrollIntoViewIfNeeded?.()
    }
  }, [active])

  let w = pageSize.pageWidth || userViewport.width
  let h = pageSize.pageHeight || userViewport.height
  const scale = thumbnailWidth / w
  const thumbnailScale = w / h
  w = thumbnailWidth
  h = w / thumbnailScale

  let style: React.CSSProperties = {
    width: `${w}px`,
    height: `${h}px`,
    position: 'relative'
  }

  return (
    <div
      ref={containerRef}
      className={`${className} pdf-thumbnail-item pdf-thumb-item-${
        pageIndex + 1
      } ${active ? 'active' : ''}`}
      style={style}
      onClick={() => {
        scrollTo(pageIndex)
      }}
    >
      {rendered && page ? (
        <React.Fragment>
          <ImageLayer
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
            page={page}
            pageIndex={pageIndex}
            rotation={rotate}
            editable={false}
          />
        </React.Fragment>
      ) : (
        ''
      )}
    </div>
  )
}
