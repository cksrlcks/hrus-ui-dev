import { useEditorContext } from "./Editor";
import styles from "./Mention.module.css";
import type { Alias } from "./type";
import useMention from "./useMention";

type MentionProps = {
  alias?: Alias[];
};

export function Mention({ alias }: MentionProps) {
  const { editorRef } = useEditorContext();
  const { showPanel, position, filteredAliases, highlightedIndex, handleMentionSelect } =
    useMention({ editorRef, alias });

  if (!showPanel) return null;

  return (
    <div
      className={styles.mentionContainer}
      style={{
        top: position.top,
        left: position.left,
        zIndex: 9999,
      }}
    >
      <ul className={styles.mentionList}>
        {filteredAliases.length === 0 ? (
          <div className={styles.empty}>검색 결과가 없습니다.</div>
        ) : (
          filteredAliases.map((alias, index) => (
            <li key={alias.id}>
              <button
                className={styles.mentionItem}
                aria-selected={index === highlightedIndex}
                onClick={() => handleMentionSelect(alias)}
              >
                {alias.label}
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
