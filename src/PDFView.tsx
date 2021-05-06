import * as React from 'react'

const PDFViewContext = React.createContext<any>({
  scale: 1.0,
  rotate: 0,
  setScale() {},
  setRotate() {}
})

export function PDFView({ children }) {
  const [scale, setScale] = React.useState(1)
  const [rotate, setRotate] = React.useState(0)

  return (
    <PDFViewContext.Provider
      value={{
        scale,
        setScale,
        rotate,
        setRotate
      }}
    >
      {children}
    </PDFViewContext.Provider>
  )
}
export function usePDFView() {
  return React.useContext(PDFViewContext)
}
