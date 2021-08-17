import * as React from "react";
import * as uuid from "uuid";

export function getId() {
  return uuid.v4();
}

export interface Stamp {
  id: string;
  url: string;
  width: number;
  height: number;
}

export interface StampOnPdf {
  id: string;
  pageNumber: number;
  x: number;
  y: number;
  confirmed: boolean;
  refStampId: string;
}

const initialState = {
  stamps: [] as Stamp[],
  stampsOnPdf: [] as StampOnPdf[],
};

const defaultCallbacks = {
  onConfirm(stamps: StampOnPdf[]) {
    console.log(stamps);
  },
  onCancel() {},
  onPassword(stamp: Stamp, callback: () => void) {
    Promise.resolve().then(() => {
      prompt("请输入密码" + stamp.id);
      callback();
    });
  },
  getExtraButtons(): HTMLElement | HTMLElement[] {
    return [];
  },
  btnGotoText: "跳转",
  btnConfirmText: "确认",
  btnCancelText: "取消",
  btnStampConfirmText: "确认",
  btnStampRemoveText: "删除",
};

type StampState = typeof initialState;
type StampCallbacks = typeof defaultCallbacks;

const StampStoreContext = React.createContext<{
  state: StampState;
  dispatch: React.Dispatch<StoreAction>;
  callbacks: StampCallbacks;
}>(null as any);

type StoreAction =
  | { type: "add-stamp"; stamp: StampOnPdf }
  | { type: "move-stamp"; stamp: StampOnPdf }
  | { type: "remove-stamp"; stamp: StampOnPdf }
  | { type: "confirm-stamp"; stamp: StampOnPdf };

function reducer(state = initialState, action: StoreAction) {
  const id = action.stamp.id;
  const remainStamps = state.stampsOnPdf.filter((st) => st.id !== id);
  switch (action.type) {
    case "add-stamp":
      return { ...state, stampsOnPdf: [...state.stampsOnPdf, action.stamp] };
    case "move-stamp":
      return { ...state, stampsOnPdf: [...remainStamps, action.stamp] };
    case "remove-stamp":
      return { ...state, stampsOnPdf: [...remainStamps] };
    case "confirm-stamp":
      return {
        ...state,
        stampsOnPdf: [...remainStamps, { ...action.stamp, confirmed: true }],
      };
    default:
      return state;
  }
}

export function StoreProvider({ children, options }) {
  const [state, dispatch] = React.useReducer(reducer, options, (options) => ({
    ...initialState,
    ...options,
  }));
  const callbacks: StampCallbacks = {
    ...defaultCallbacks,
    ...options,
  };
  return (
    <StampStoreContext.Provider
      value={{
        state,
        dispatch,
        callbacks,
      }}
    >
      {children}
    </StampStoreContext.Provider>
  );
}

export function useStamps() {
  const {
    state: { stamps },
  } = React.useContext(StampStoreContext);

  return stamps;
}

export function useStampsOnPdf(pageIndex: number) {
  const {
    state: { stampsOnPdf },
  } = React.useContext(StampStoreContext);

  const stampsOnPdfRet = stampsOnPdf.filter(
    ({ pageNumber }) => pageNumber === pageIndex + 1
  );
  return stampsOnPdfRet;
}

export function useFinalStampsOnPdf() {
  const {
    state: { stampsOnPdf },
  } = React.useContext(StampStoreContext);

  const stampsOnPdfRet = stampsOnPdf.filter(({ confirmed }) => confirmed);
  return stampsOnPdfRet;
}

export function useStampsMap() {
  const {
    state: { stamps },
  } = React.useContext(StampStoreContext);
  const stampsMap = stamps.reduce(
    (acc, stamp) => ((acc[stamp.id] = stamp), acc),
    {} as Record<string, Stamp>
  );
  return stampsMap;
}

export function useDispatch() {
  const { dispatch } = React.useContext(StampStoreContext);

  return dispatch;
}

export function useStoreCallbacks() {
  const { callbacks } = React.useContext(StampStoreContext);

  return callbacks;
}
