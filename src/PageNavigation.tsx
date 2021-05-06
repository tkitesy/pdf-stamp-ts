import * as React from "react";

const PageNavigationContext = React.createContext<any>(null);

export function PageNavigation({ children }) {
  const registry = React.useRef<{ el: HTMLDivElement; ratio: number }[]>([]);
  const [currentPage, setCurrentPage] = React.useState(0);
  const pageContainer = React.useRef<HTMLDivElement | null>(null);

  const registerContainer = React.useCallback((container: HTMLDivElement) => {
    pageContainer.current = container;
  }, []);

  const unregisterContainer = React.useCallback(() => {
    pageContainer.current = null;
  }, []);

  const registerPage = React.useCallback((i: number, el: HTMLDivElement) => {
    registry.current[i] = { el, ratio: 0 };
  }, []);

  const unregisterPage = React.useCallback((i: number) => {
    delete registry.current[i];
  }, []);

  const scrollTo = React.useCallback((i: number) => {
    const page = registry.current[i]?.el;
    const container = pageContainer.current
    if (page && container) {
      container.scrollTop = page.offsetTop;
      container.scrollLeft = page.offsetLeft;
    }
  }, [pageContainer.current]);

  const pageVisibilityChanged = React.useCallback(
    (i: number, ratio: number) => {
      const pageInfo = registry.current[i];
      if (!pageInfo) {
        return;
      }
      pageInfo.ratio = ratio;
      const maxRatioPage = registry.current.reduce(
        (maxIndex, pageInfo, index) => {
          const maxRation = registry.current[maxIndex]
            ? registry.current[maxIndex].ratio
            : 0;
          return pageInfo.ratio > maxRation ? index : maxIndex;
        },
        0
      );
      setCurrentPage(maxRatioPage);
    },
    []
  );
  return (
    <PageNavigationContext.Provider
      value={{
        currentPage,
        pageVisibilityChanged,
        unregisterPage,
        registerPage,
        scrollTo,
        registerContainer,
        unregisterContainer
      }}
    >
      {children}
    </PageNavigationContext.Provider>
  );
}

export function usePageNavigation() {
  return React.useContext(PageNavigationContext);
}
