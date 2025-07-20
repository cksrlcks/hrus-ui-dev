export function Preview({ results }: { results?: string | null }) {
  if (!results) return null;

  return (
    <div>
      <div dangerouslySetInnerHTML={{ __html: results }} />
    </div>
  );
}
