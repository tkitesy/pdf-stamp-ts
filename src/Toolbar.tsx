import * as React from "react";
import { usePageNavigation } from "./PageNavigation";
import { usePDF } from "./PdfLoader";
import { usePDFView } from "./PDFView";
import { useFinalStampsOnPdf, useStoreCallbacks } from "./Store";

export function Toolbar(props: any) {
  const { realScale: scale, setScale } = usePDFView();
  const { currentPage, scrollTo } = usePageNavigation();
  const [editingPageNumber, setEditingPageNumber] = React.useState(1);
  const pdf = usePDF();
  const stampsOnPdf = useFinalStampsOnPdf();
  const callbacks = useStoreCallbacks();
  const totalNums = pdf.numPages;

  React.useEffect(() => {
    setEditingPageNumber(currentPage);
  }, [currentPage]);

  const handleCancel = React.useCallback(() => {
    callbacks.onCancel();
  }, []);

  const handleConfirm = React.useCallback(() => {
    callbacks.onConfirm(stampsOnPdf);
  }, [stampsOnPdf]);

  const changePage = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newPage = parseInt(e.target.value, 10);
    if (newPage > 0 && newPage <= totalNums) {
      setEditingPageNumber(newPage - 1);
    }
  };

  const goto = React.useCallback(() => {
    if (currentPage !== editingPageNumber) {
      scrollTo(editingPageNumber);
    }
  }, [currentPage, editingPageNumber, scrollTo]);

  return (
    <div
      className={`pdf-stamp-toolbar ${props.className ? props.className : ""}`}
    >
      <div className="left-box"></div>
      <div className="center-box">
        <span className="zoom-box">
          <button
            className="zoom-out-btn"
            onClick={() => setScale((v) => v - 0.1)}
          >
            -
          </button>
          <span className="scale-label">{Math.round(scale * 100)}%</span>
          <button
            className="zoom-in-btn"
            onClick={() => setScale((v) => v + 0.1)}
          >
            +
          </button>
        </span>
        <span className="page-box">
          <input
            className="inpt-curr-page"
            value={editingPageNumber + 1}
            onChange={changePage}
          />{" "}
          / <span className="total-page-label">{pdf.numPages}</span>
          <button className={"goto-btn"} onClick={goto}>
            跳转
          </button>
        </span>
      </div>
      <div className="right-box">
        <button className="confirm-btn" onClick={handleConfirm}>
          确认
        </button>
        <button className="cancel-btn" onClick={handleCancel}>
          取消
        </button>
      </div>
    </div>
  );
}
