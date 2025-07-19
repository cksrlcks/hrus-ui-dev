import styles from "./Editor.module.css";
import { createContext, lazy, Suspense, useContext, useRef, type PropsWithChildren } from "react";
import type { SunEditorReactProps } from "suneditor-react/dist/types/SunEditorReactProps";
import "suneditor/dist/css/suneditor.min.css";
import SunEditorCore from "suneditor/src/lib/core";

const SunEditor = lazy(() => import("suneditor-react"));

const EditorContext = createContext<{
  editorRef: React.RefObject<SunEditorCore | null>;
} | null>(null);

type EditorProps = PropsWithChildren<SunEditorReactProps> & {
  data?: string | null;
  isLoading?: boolean;
};

const DEFAULT_OPTIONS: SunEditorReactProps = {
  setOptions: {
    height: "500px",
    addTagsWhitelist: "table|thead|tbody|tfoot|tr|td|th|colgroup|col|style|span|button",
    pasteTagsWhitelist: "span|button",
    attributesWhitelist: {
      all: "style|data-.+",
    },
    strictMode: false,
  },
};

export function Editor({ children, setOptions: userOptions, isLoading, ...rest }: EditorProps) {
  const editorRef = useRef<SunEditorCore | null>(null);

  const mergedProps: SunEditorReactProps = {
    ...DEFAULT_OPTIONS,
    ...rest,
    setOptions: {
      ...DEFAULT_OPTIONS.setOptions,
      ...userOptions,
    },
  };

  return (
    <EditorContext.Provider value={{ editorRef }}>
      <Suspense fallback={<div>에디터를 준비하고 있습니다.</div>}>
        <div className={styles.editor}>
          {isLoading && <div className={styles.loadingOverlay}>템플릿을 불러오고 있습니다...</div>}
          <div className={styles.editorContainer} data-loading={isLoading}>
            <SunEditor
              getSunEditorInstance={(editor) => {
                editorRef.current = editor;
              }}
              {...mergedProps}
            />
            {children}
          </div>
        </div>
      </Suspense>
    </EditorContext.Provider>
  );
}

export const useEditorContext = () => {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error(
      "에디터 컨텍스트가 제공되지 않았습니다. Editor 컴포넌트 내에서만 사용해야 합니다.",
    );
  }
  return context;
};
