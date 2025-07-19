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
