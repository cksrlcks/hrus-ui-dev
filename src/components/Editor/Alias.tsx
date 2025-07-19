import styles from "./Alias.module.css";
import { useEditorContext } from "./Editor";
import { useAliasDnD } from "./useAliasDnD";
import { useState } from "react";

export type Alias = {
  id: string;
  value: string;
  label: string;
};

type AliasProps = {
  alias?: Alias[] | null;
};

export function Alias({ alias }: AliasProps) {
  const [selectedAlias, setSelectedAlias] = useState<Alias | null>(null);
  const { editorRef } = useEditorContext();

  useAliasDnD({
    editorRef,
    selectedAlias,
  });

  if (!alias || alias.length === 0) return null;

  return (
    <>
      <div className={styles.aliasContainer}>
        {alias.map(({ id, value, label }) => (
          <div
            key={id}
            className={styles.aliasItem}
            data-alias-value={value}
            data-alias-id={id}
            draggable
            onDragStart={() => setSelectedAlias({ id, value, label })}
            onDragEnd={() => setSelectedAlias(null)}
          >
            {label}
          </div>
        ))}
      </div>
    </>
  );
}
