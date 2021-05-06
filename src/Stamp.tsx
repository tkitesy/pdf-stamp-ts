import * as React from "react";
import {
  DndProvider,
  DropTargetMonitor,
  useDrag,
  useDragLayer,
  useDrop,
} from "react-dnd";
import { usePDFView } from "./PDFView";
import { pdfjs } from "react-pdf";
import { TouchBackend as Backend } from "react-dnd-touch-backend";
import {
  getId,
  Stamp,
  StampOnPdf,
  useDispatch,
  useStamps,
  useStampsMap,
  useStampsOnPdf,
  useStoreCallbacks,
} from "./Store";
import styled from "styled-components";

interface StampProps {
  stamp: Stamp;
  className?: string;
}

function StampItem({ stamp, className }: StampProps) {
  const [, drag] = useDrag(
    {
      type: "add-stamp",
      item: stamp,
      collect: (monitor) => ({
        dragging: monitor.isDragging(),
      }),
    },
    [stamp]
  );
  return (
    <li ref={drag} draggable={false} className={`stamp-item-li ${className}`}>
      <img draggable={false} src={stamp.url}></img>
    </li>
  );
}

const StyledStampItem = styled(StampItem)`
  list-style: none;
  img {
    width: 40px;
  }
`;

export function StampContainer() {
  const stamps = useStamps();
  return (
    <ul className={`stamp-container`}>
      {stamps.map((stamp) => (
        <StyledStampItem stamp={stamp} key={stamp.id}></StyledStampItem>
      ))}
    </ul>
  );
}

interface Props {
  width: number;
  height: number;
  scale: number;
  rotation: number;
  pageIndex: number;
  page: pdfjs.PDFPageProxy;
  editable?: boolean;
}

export function StampLayer({
  width,
  height,
  scale,
  rotation,
  pageIndex,
  page,
  editable = true,
}: Props) {
  const dispath = useDispatch();
  const viewport = page.getViewport({ scale: scale, rotation: rotation });
  const layerRef = React.useRef<HTMLDivElement | null>(null);
  const handleDrop = React.useCallback(
    (item, monitor: DropTargetMonitor) => {
      Promise.resolve().then(() => {
        window.getSelection().removeAllRanges();
      });
      if (layerRef.current === null) {
        return;
      }
      const rect = layerRef.current.getBoundingClientRect();
      const dragRect = monitor.getSourceClientOffset();
      if (dragRect === null) {
        return;
      }
      let x = dragRect.x - rect.left,
        y = dragRect.y - rect.top;
      [x, y] = viewport.convertToPdfPoint(x, y);
      const type = monitor.getItemType();
      if (type === "add-stamp") {
        dispath({
          type: "add-stamp",
          stamp: {
            id: getId(),
            x,
            y,
            pageNumber: pageIndex + 1,
            refStampId: item.id,
            confirmed: false,
          },
        });
      } else if (type === "move-stamp") {
        dispath({
          type: "move-stamp",
          stamp: {
            ...item,
            x,
            y,
            pageNumber: pageIndex + 1,
            confirmed: false,
          },
        });
      }
    },
    [pageIndex, viewport]
  );

  const [, drop] = useDrop({
    accept: ["add-stamp", "move-stamp"],
    drop: handleDrop,
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const stampsMap = useStampsMap();
  const stampsOnPdf = useStampsOnPdf(pageIndex);

  return (
    <div
      ref={drop(layerRef) as any}
      className={`stamp-layer`}
      style={{
        width: width + "px",
        height: height + "px",
        overflow: "hidden",
        position: "absolute",
        top: 0,
        left: 0,
      }}
    >
      {stampsOnPdf.map((stampOnPdf) => (
        <StampOnPDFItem
          scale={scale}
          rotation={rotation}
          viewport={viewport}
          editable={!stampOnPdf.confirmed && editable}
          stampOnPdf={stampOnPdf}
          stamp={stampsMap[stampOnPdf.refStampId]}
        />
      ))}
    </div>
  );
}

interface StampOnPDFProps {
  scale: number;
  rotation: number;
  viewport: pdfjs.PDFPageViewport;
  editable: boolean;
  stampOnPdf: StampOnPdf;
  stamp: Stamp;
}

function StampOnPDFItem({
  scale,
  rotation,
  viewport,
  editable,
  stampOnPdf,
  stamp,
}: StampOnPDFProps) {
  const imgRef = React.useRef<HTMLImageElement | null>(null);
  const [left, top] = viewport.convertToViewportPoint(
    stampOnPdf.x,
    stampOnPdf.y
  );
  const style: React.CSSProperties = {
    position: "absolute",
    left: left + "px",
    top: top + "px",
    width: stamp.width + "px",
    height: stamp.height + "px",
    transformOrigin: "0 0",
    transform: `scale(${scale}) rotate(${rotation}deg)`,
  };

  const [, drag] = useDrag(
    {
      type: "move-stamp",
      item: { ...stamp, ...stampOnPdf },
      collect: (monitor) => ({
        dragging: monitor.isDragging(),
      }),
    },
    [stampOnPdf, stamp]
  );

  const [boxStyle, setBoxStyle] = React.useState<React.CSSProperties>({});
  React.useLayoutEffect(() => {
    if (!imgRef.current || !editable) {
      return;
    }
    const { width, height } = imgRef.current.getBoundingClientRect();

    let btnLeft = left;
    let btnTop = top;
    switch (rotation) {
      case 0:
        btnLeft = btnLeft + width / 2;
        btnTop = btnTop + height;
        break;
      case 90:
        btnLeft = btnLeft - width / 2;
        btnTop = btnTop + height;
        break;
      case 180:
        btnLeft = btnLeft - width / 2;
        btnTop = btnTop;
        break;
      case 270:
        btnLeft = btnLeft + width / 2;
        btnTop = btnTop;
        break;
    }
    setBoxStyle({
      left: btnLeft + "px",
      top: btnTop + "px",
      paddingTop: "8px",
      zIndex: 100,
      transform: "translate(-50%)",
      position: "absolute",
    });
  }, [rotation, left, top, editable]);

  const dispatch = useDispatch();
  const handleRemove = React.useCallback(() => {
    dispatch({
      type: "remove-stamp",
      stamp: stampOnPdf,
    });
  }, [stampOnPdf]);

  const confirmStamp = React.useCallback(() => {
    dispatch({
      type: "confirm-stamp",
      stamp: stampOnPdf,
    });
  }, [stampOnPdf]);
  const callbacks = useStoreCallbacks();
  const handleConfirm = React.useCallback(() => {
    callbacks.onPassword(stamp, confirmStamp);
  }, [callbacks, confirmStamp, stamp]);

  if (!editable) {
    return (
      <img
        key="aa"
        draggable={false}
        onDragStart={(e) => e.preventDefault()}
        className={`stamp-on-pdf`}
        src={stamp.url}
        style={style}
      ></img>
    );
  }

  return (
    <React.Fragment>
      <img
        key="bb"
        draggable={false}
        onDragStart={(e) => e.preventDefault()}
        className={`stamp-on-pdf`}
        src={stamp.url}
        style={style}
        ref={drag(imgRef) as any}
      ></img>

      <div className={`stamp-on-pdf-btn-box`} style={boxStyle}>
        <button onClick={handleConfirm}>确认</button>
        <button onClick={handleRemove}>删除</button>
      </div>
    </React.Fragment>
  );
}

export function StampProvider({ children }) {
  return (
    <DndProvider backend={Backend} options={{ enableMouseEvents: true }}>
      <StampPreviewLayer />
      {children}
    </DndProvider>
  );
}

const layerStyles: React.CSSProperties = {
  position: "fixed",
  pointerEvents: "none",
  zIndex: 10000,
  left: 0,
  top: 0,
  width: "100%",
  height: "100%",
};

function getItemStyles(initialOffset, currentOffset) {
  if (!initialOffset || !currentOffset) {
    return {
      display: "none",
    };
  }

  let { x, y } = currentOffset;
  const transform = `translate(${x}px, ${y}px)`;
  return {
    transform,
    WebkitTransform: transform,
  };
}

function StampPreview({ url, width, height }) {
  const { scale, rotate } = usePDFView();
  const style: React.CSSProperties = {
    width: width + "px",
    height: height + "px",
    transformOrigin: "0 0",
    transform: `scale(${scale}) rotate(${rotate}deg)`,
  };
  return <img src={url} style={style}></img>;
}

function StampPreviewLayer() {
  const {
    itemType,
    isDragging,
    item,
    initialOffset,
    currentOffset,
  } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    initialOffset: monitor.getInitialSourceClientOffset(),
    currentOffset: monitor.getSourceClientOffset(),
    isDragging: monitor.isDragging(),
  }));

  function renderItem() {
    switch (itemType) {
      case "add-stamp":
        return (
          <StampPreview
            url={item.url}
            width={item.width}
            height={item.height}
          />
        );
      case "move-stamp":
        return (
          <StampPreview
            url={item.url}
            width={item.width}
            height={item.height}
          />
        );
      default:
        return null;
    }
  }

  if (!isDragging) {
    return null;
  }
  return (
    <div style={layerStyles}>
      <div style={getItemStyles(initialOffset, currentOffset)}>
        {renderItem()}
      </div>
    </div>
  );
}
