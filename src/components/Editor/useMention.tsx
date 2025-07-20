import { getPositionFromCaret, getQueryFromCaret, renderAlias } from "./helper";
import type { Alias } from "./type";
import { useCallback, useEffect, useMemo, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import SunEditorCore from "suneditor/src/lib/core";

type UseMentionProps = {
  editorRef: React.RefObject<SunEditorCore | null>;
  alias?: Alias[];
};

export default function useMention({ editorRef, alias }: UseMentionProps) {
  const [showPanel, setShowPanel] = useState(false);
  const [query, setQuery] = useState("");
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [disabledUntilNextSpace, setDisabledUntilNextSpace] = useState(false);

  const filteredAliases = useMemo(
    () => alias?.filter(({ label }) => label.toLowerCase().includes(query.toLowerCase())) || [],
    [alias, query],
  );

  const handleMentionSelect = useCallback(
    (selectedAlias: Alias) => {
      const wysiwyg = editorRef.current?.core?.context?.element?.wysiwyg;
      if (!wysiwyg) return;

      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);
      const anchorNode = selection.anchorNode;
      const anchorOffset = selection.anchorOffset;

      if (anchorNode && anchorNode.nodeType === Node.TEXT_NODE) {
        const fullText = anchorNode.textContent || "";
        const currentQueryText = `@${query}`;
        const startIndex = fullText.lastIndexOf(currentQueryText, anchorOffset);

        if (startIndex !== -1) {
          range.setStart(anchorNode, startIndex);
          range.setEnd(anchorNode, anchorOffset);
          range.deleteContents();
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }

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

      setShowPanel(false);
      setQuery("");
      setHighlightedIndex(-1);
      setPosition({ top: 0, left: 0 });
    },
    [query, editorRef],
  );

  const handleInput = useCallback(() => {
    if (disabledUntilNextSpace) return;

    const queryResult = getQueryFromCaret();
    const currentCaretPosition = getPositionFromCaret();

    if (!showPanel && queryResult !== null) {
      setPosition(currentCaretPosition);
    }

    setQuery(queryResult || "");
    setShowPanel(queryResult !== null);

    if (queryResult !== null) {
      setHighlightedIndex(0);
    } else {
      setHighlightedIndex(-1);
      setPosition({ top: 0, left: 0 });
    }
  }, [showPanel, disabledUntilNextSpace]);

  const handleKeyDown = useCallback(
    (e: Event) => {
      if (!showPanel || filteredAliases.length === 0) return;
      if (!(e instanceof KeyboardEvent)) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          e.stopPropagation();
          setHighlightedIndex((prevIndex) => (prevIndex + 1) % filteredAliases.length);
          break;
        case "ArrowUp":
          e.preventDefault();
          e.stopPropagation();

          setHighlightedIndex(
            (prevIndex) => (prevIndex - 1 + filteredAliases.length) % filteredAliases.length,
          );
          break;
        case "Enter":
          e.preventDefault();
          e.stopPropagation();

          if (highlightedIndex !== -1 && filteredAliases[highlightedIndex]) {
            handleMentionSelect(filteredAliases[highlightedIndex]);
          }
          break;
        case "Escape":
          e.preventDefault();
          e.stopPropagation();

          setShowPanel(false);
          setQuery("");
          setHighlightedIndex(-1);
          setDisabledUntilNextSpace(true);
          break;
        default:
          break;
      }
    },
    [showPanel, highlightedIndex, filteredAliases, handleMentionSelect],
  );

  useEffect(() => {
    const wysiwyg = editorRef.current?.core?.context?.element?.wysiwyg;
    if (!wysiwyg) return;

    wysiwyg.addEventListener("input", handleInput);
    wysiwyg.addEventListener("keydown", handleKeyDown, true);
    return () => {
      wysiwyg.removeEventListener("input", handleInput);
      wysiwyg.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [editorRef, handleInput, handleKeyDown]);

  useEffect(() => {
    const wysiwyg = editorRef.current?.core?.context?.element?.wysiwyg;
    if (!wysiwyg) return;

    const handleKeyUp = (e: Event) => {
      if (!(e instanceof KeyboardEvent)) return;
      if (disabledUntilNextSpace && [" ", "Enter", "Tab"].includes(e.key)) {
        setDisabledUntilNextSpace(false);
      }
    };

    wysiwyg.addEventListener("keyup", handleKeyUp);
    return () => wysiwyg.removeEventListener("keyup", handleKeyUp);
  }, [editorRef, disabledUntilNextSpace]);

  return {
    showPanel,
    query,
    position,
    filteredAliases,
    highlightedIndex,
    handleMentionSelect,
  };
}
