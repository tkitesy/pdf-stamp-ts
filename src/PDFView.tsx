import * as React from "react";

const PDFViewContext = React.createContext<any>({
  scale: 1.0,
  realScale: 1.0,
  rotate: 0,
  setScale() {},
  setRotate() {},
});

export function PDFView({ children }) {
  const [realScale, setScale] = React.useState(1);
  const [rotate, setRotate] = React.useState(0);

  return (
    <PDFViewContext.Provider
      value={{
        realScale,
        scale: realScale * CSS_UNITS,
        setScale,
        rotate,
        setRotate,
      }}
    >
      {children}
    </PDFViewContext.Provider>
  );
}

const CSS_UNITS = 96.0 / 72.0;
export function usePDFView() {
  return React.useContext(PDFViewContext);
}
