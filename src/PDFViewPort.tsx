import * as React from 'react'
import { Page, pdfjs } from 'react-pdf'
import { usePDF } from './PdfLoader'

const PDFViewPortContext = React.createContext<pdfjs.PDFPageViewport>({} as any)

export function PDFViewPort({ children }) {
  const [viewport, setViewport] = React.useState<pdfjs.PDFPageViewport | null>(
    null
  )
  const pdf = usePDF()
  React.useEffect(() => {
    if (pdf) {
      pdf.getPage(1).then((page) => {
        const vp = page.getViewport({ scale: 1 })
        setViewport(vp)
      })
    }
  }, [pdf])

  return !viewport ? (
    <div>loading</div>
  ) : (
    <PDFViewPortContext.Provider value={viewport}>
      {children}
    </PDFViewPortContext.Provider>
  )
}

export function usePDFDefaultViewPort() {
  return React.useContext(PDFViewPortContext)
}
