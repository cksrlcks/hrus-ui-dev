import type { Alias } from "./type";
import SunEditorCore from "suneditor/src/lib/core";

export function replaceAliasesToRealValue(html: string, aliases: Record<string, string>) {
  if (!html?.trim()) return html;

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const Aliases = doc.querySelectorAll("[data-alias-value]");

  Aliases.forEach((item) => {
    const key = item.getAttribute("data-alias-value");
    if (!key) return;

    const value = aliases[key];
    if (value !== undefined) {
      const textNode = doc.createTextNode(value);
      item.replaceWith(textNode);
    }
  });

  return doc.body.innerHTML;
}

export const renderAlias = ({ id, value, label }: Alias) => {
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
};

export const removeAlias = (e: MouseEvent, editorRef: React.RefObject<SunEditorCore | null>) => {
  const target = e.target as HTMLElement;
  if (!target.dataset.aliasDelete) return;

  const aliasElement = target.closest("[data-alias-value]");
  const editor = editorRef.current;

  if (!aliasElement || !editor) return;

  aliasElement.remove();

  const wysiwygArea = editor.core?.context?.element?.wysiwyg;
  wysiwygArea?.dispatchEvent(new Event("input", { bubbles: true }));
};

export const updateCaretToMouse = (e: DragEvent, savedRangeRef: React.RefObject<Range | null>) => {
  const range = document.caretRangeFromPoint?.(e.clientX, e.clientY);
  if (!range) return;

  const selection = window.getSelection();
  if (selection) {
    selection.removeAllRanges();
    selection.addRange(range);
  }

  savedRangeRef.current = range;
};

export const getPositionFromCaret = () => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return { top: 0, left: 0 };

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  return {
    top: rect.bottom + window.scrollY,
    left: rect.left + window.scrollX,
  };
};

export const getQueryFromCaret = () => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;

  const range = selection.getRangeAt(0).cloneRange();
  range.setStart(selection.anchorNode!, 0);

  const precedingText = range.toString();
  const match = precedingText.match(/@([\p{L}\w-]{0,30})$/u);

  if (match) {
    return match[1];
  }
  return null;
};
