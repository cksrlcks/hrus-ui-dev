import { removeAlias, renderAlias, updateCaretToMouse } from "./helper";
import type { Alias } from "./type";
import { useEffect, useRef } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import SunEditorCore from "suneditor/src/lib/core";

type useAliasDnD = {
  editorRef: React.RefObject<SunEditorCore | null>;
  selectedAlias: Alias | null;
};

export function useAliasDnD({ editorRef, selectedAlias }: useAliasDnD) {
  const savedRangeRef = useRef<Range | null>(null);

  const handleDropEvent = (
    selectedAlias: Alias | null,
    savedRangeRef: React.RefObject<Range | null>,
  ) => {
    if (!selectedAlias) return;

    const selection = window.getSelection();
    const range = savedRangeRef.current;
    if (!range || !selection) return;

    selection.removeAllRanges();
    selection.addRange(range);

    const component = renderAlias(selectedAlias);
    const parsedHTML = renderToStaticMarkup(component);

    const parser = new DOMParser();
    const doc = parser.parseFromString(parsedHTML, "text/html");
    const node = doc.body.firstChild;
    if (!node) return;

    range.insertNode(node);

    const afterRange = document.createRange();
    afterRange.setStartAfter(node);
    afterRange.collapse(true);
    selection.removeAllRanges();
    selection.addRange(afterRange);

    savedRangeRef.current = null;
  };

  useEffect(() => {
    const editor = editorRef.current;
    const wysiwyg = editor?.core?.context?.element?.wysiwyg;

    if (!editor || !wysiwyg) return;

    const handleDragOver = (e: Event) => {
      e.preventDefault();
      updateCaretToMouse(e as DragEvent, savedRangeRef);
    };

    const handleDrop = (e: Event) => {
      e.preventDefault();

      const dragEvent = e as DragEvent;
      const target = dragEvent.target as HTMLElement | null;
      const exist = target?.closest("[data-alias-value]");
      if (exist) return;

      handleDropEvent(selectedAlias, savedRangeRef);
    };

    wysiwyg.addEventListener("dragover", handleDragOver);
    wysiwyg.addEventListener("drop", handleDrop);

    return () => {
      wysiwyg.removeEventListener("dragover", handleDragOver);
      wysiwyg.removeEventListener("drop", handleDrop);
    };
  }, [editorRef, selectedAlias]);

  useEffect(() => {
    const handleRemoveAlias = (e: MouseEvent) => removeAlias(e, editorRef);
    window.addEventListener("click", handleRemoveAlias, false);

    return () => {
      window.removeEventListener("click", handleRemoveAlias);
    };
  }, [editorRef]);

  useEffect(() => {
    const wysiwyg = editorRef.current?.core?.context?.element?.wysiwyg;
    if (!wysiwyg) return;

    const handleRemoveAlias = (e: Event) => {
      if (!(e instanceof KeyboardEvent)) return;
      if (e.key !== "Backspace" && e.key !== "Delete") return;

      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);
      const { startContainer, startOffset } = range;

      const isBackspace = e.key === "Backspace";
      const isDelete = e.key === "Delete";

      if (startContainer.nodeType !== Node.TEXT_NODE) {
        if (startOffset > 0 && isBackspace) {
          const prevNode = startContainer.childNodes[startOffset - 1];
          if (prevNode instanceof HTMLElement && prevNode.matches("[data-alias-value]")) {
            e.preventDefault();
            prevNode.remove();
          }
        }

        if (startOffset < startContainer.childNodes.length && isDelete) {
          const nextNode = startContainer.childNodes[startOffset];
          if (nextNode instanceof HTMLElement && nextNode.matches("[data-alias-value]")) {
            e.preventDefault();
            nextNode.remove();
          }
        }
      }
    };
    wysiwyg?.addEventListener("keydown", handleRemoveAlias);
    return () => {
      wysiwyg?.removeEventListener("keydown", handleRemoveAlias);
    };
  }, [editorRef]);
}
