import * as React from 'react'
import { Document, pdfjs } from 'react-pdf'

const PDFContext = React.createContext<pdfjs.PDFDocumentProxy>({} as any)

export function PDFLoader({ file, children }) {
  const [pdf, setPdf] = React.useState<pdfjs.PDFDocumentProxy | null>(null)
  return (
    <Document className={"pdf-stamp-loader"} onLoadSuccess={(p) => setPdf(p)} file={file}>
      {pdf === null ? (
        'loading'
      ) : (
        <PDFContext.Provider value={pdf}>{children}</PDFContext.Provider>
      )}
    </Document>
  )
}

export function usePDF() {
  const pdf = React.useContext(PDFContext)
  return pdf
}
