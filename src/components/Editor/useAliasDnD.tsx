import type { Alias } from "./Alias";
import { useEffect, useRef } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import SunEditorCore from "suneditor/src/lib/core";

type useAliasDnD = {
  editorRef: React.RefObject<SunEditorCore | null>;
  selectedAlias: Alias | null;
};

export function useAliasDnD({ editorRef, selectedAlias }: useAliasDnD) {
  const savedRangeRef = useRef<Range | null>(null);

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
}

function updateCaretToMouse(e: DragEvent, savedRangeRef: React.RefObject<Range | null>) {
  const range = document.caretRangeFromPoint?.(e.clientX, e.clientY);
  if (!range) return;

  const selection = window.getSelection();
  if (selection) {
    selection.removeAllRanges();
    selection.addRange(range);
  }

  savedRangeRef.current = range;
}

function handleDropEvent(
  selectedAlias: Alias | null,
  savedRangeRef: React.RefObject<Range | null>,
) {
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
}

function removeAlias(e: MouseEvent, editorRef: React.RefObject<SunEditorCore | null>) {
  const target = e.target as HTMLElement;
  if (!target.dataset.aliasDelete) return;

  const aliasElement = target.closest("[data-alias-value]");
  const editor = editorRef.current;

  if (!aliasElement || !editor) return;

  aliasElement.remove();

  const wysiwygArea = editor.core?.context?.element?.wysiwyg;
  wysiwygArea?.dispatchEvent(new Event("input", { bubbles: true }));
}

function renderAlias({ id, value, label }: Alias) {
  return (
    <span
      className="custom-alias"
      contentEditable={false}
      data-alias-value={value}
      data-alias-id={id}
    >
      <span>{label}</span>
      <button data-alias-delete>
        <i className="delete-icon">
          <span className="a11y">삭제</span>
        </i>
      </button>
    </span>
  );
}
