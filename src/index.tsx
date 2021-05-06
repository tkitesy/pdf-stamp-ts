import * as React from "react";
import ReactDOM from "react-dom";
import { pdfjs, Outline } from "react-pdf";
import styled from "styled-components";
import { PageLayer } from "./PageLayer";
import { PageNavigation, usePageNavigation } from "./PageNavigation";
import { PDFLoader, usePDF } from "./PdfLoader";
import { PDFView } from "./PDFView";
import { PDFViewPort } from "./PDFViewPort";
import { StampContainer, StampProvider } from "./Stamp";
import { StoreProvider } from "./Store";
import { ThumbItem } from "./ThumbItem";
import { Toolbar } from "./Toolbar";
pdfjs.GlobalWorkerOptions.workerSrc = `pdf.worker.js`;

const url = `https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf`;

const PdfPageContainer = styled.div`
  display: flex;
  .thumbnails {
    flex: none;
    width: 200px;
    overflow: auto;
    background: #fff;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .page-container {
    flex: auto;
    display: flex;
    justify-content: space-around;
    overflow: auto;
    background-color: #ccc;
    .pdf-page {
      margin-top: 8px;
    }
  }

  .stamp-container {
    flex: none;
    width: 200px;
    background: #fff;
    overflow: auto;
  }
`;

function PdfStamp(props: any) {
  return (
    <StoreProvider options={props.options || {}}>
      <div className={`pdf-stamp ${props.className}`}>
        <PageNavigation>
          <PDFView>
            <PDFLoader file={props.options?.file || url}>
              <PDFViewPort>
                <StampProvider>
                  <Toolbar />
                  <PdfPageContainer className="pdf-stamp-container">
                    <div className={"thumbnails"}>
                      <Thumbnails />
                    </div>
                    <MyPage />
                    <div className={"stamp-container"}>
                      <StampContainer />
                    </div>
                  </PdfPageContainer>
                </StampProvider>
              </PDFViewPort>
            </PDFLoader>
          </PDFView>
        </PageNavigation>
      </div>
    </StoreProvider>
  );
}

const StyledPdfStamp = styled(PdfStamp)`
  height: 100%;
  .pdf-stamp-toolbar {
    height: 36px;
    background-color: #fff;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #333;
    border-bottom: 1px solid #ccc;
    .left-box {
      flex: none;
      width: 200px;
    }
    .center-box {
      .zoom-box {
        padding-right: 18px;
      }
      .inpt-curr-page {
        width: 16px;
        text-align: center;
      }
      .goto-btn {
        margin-left: 8px;
      }
    }
    .right-box {
      flex: none;
      width: 200px;
      padding-right: 12px;
      display: flex;
      justify-content: flex-end;
      button {
        margin-left: 8px;
      }
    }
  }
  .pdf-stamp-loader {
    height: 100%;
  }
  .react-pdf__Document {
    height: 100%;
  }
  .pdf-stamp-container {
    height: calc(100% - 36px);
  }
`;

const StyledThumbItem = styled(ThumbItem)`
  img {
    opacity: 0.8;
  }
  margin-top: 8px;
  margin-bottom: 8px;
  background: #ccc;
  &:hover,
  &.active {
    background: #fff;
    img {
      opacity: 0.8;
    }
    outline: 4px solid #ddd;
  }
`;

function Thumbnails() {
  const pdf = usePDF();

  return (
    <div className={`pdf-thumbnail-container`}>
      {new Array(pdf.numPages).fill(null).map((_, index) => (
        <StyledThumbItem pageIndex={index} thumbnailWidth={100} />
      ))}
    </div>
  );
}

function MyPage() {
  const pdf = usePDF();
  const { registerContainer, unregisterContainer } = usePageNavigation();
  const ref = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (ref.current) {
      registerContainer(ref.current);
      return () => unregisterContainer();
    }
    return null;
  }, [ref.current]);
  return (
    <div className={"page-container"} ref={ref}>
      <div>
        {new Array(pdf.numPages).fill(null).map((_, index) => (
          <PageLayer pageIndex={index} />
        ))}
      </div>
    </div>
  );
}

(window as any).renderPDFStamp = function (el, options) {
  ReactDOM.render(<StyledPdfStamp options={options} />, el);
};
