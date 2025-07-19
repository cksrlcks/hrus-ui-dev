export function replaceAliasesToRealValue(html: string, aliases: Record<string, string>) {
  if (!html || html.trim() === "") {
    return html;
  }

  const result = html.replace(
    /<span[^>]*class="custom-alias"[^>]*data-alias-value="([^"]*)"[^>]*>[\s\S]*?<\/span>/g,
    (match, aliasKey) => {
      const aliasValue = aliases[aliasKey];
      return aliasValue || match;
    },
  );

  return result;
}
