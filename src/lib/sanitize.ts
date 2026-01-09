import DOMPurify from "isomorphic-dompurify";

export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      "h2", "h3", "h4", "h5", "h6",
      "p", "br", "hr",
      "strong", "em", "b", "i", "u",
      "a", "ul", "ol", "li",
      "pre", "code",
      "table", "thead", "tbody", "tr", "th", "td",
      "blockquote", "span", "div"
    ],
    ALLOWED_ATTR: ["href", "class", "target", "rel"],
    ALLOW_DATA_ATTR: false,
  });
}

function parseMarkdownTables(content: string): string {
  const lines = content.split('\n');
  const result: string[] = [];
  let inTable = false;
  let tableRows: string[][] = [];
  let hasHeader = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const isTableRow = line.startsWith('|') && line.endsWith('|');
    const isSeparator = isTableRow && /^\|[\s\-:|]+\|$/.test(line);

    if (isTableRow && !isSeparator) {
      if (!inTable) {
        inTable = true;
        tableRows = [];
        hasHeader = false;
      }
      const cells = line.split('|').slice(1, -1).map(c => c.trim());
      tableRows.push(cells);
    } else if (isSeparator && inTable && tableRows.length === 1) {
      hasHeader = true;
    } else {
      if (inTable && tableRows.length > 0) {
        let tableHtml = '<table class="w-full border-collapse my-4 text-xs">';
        if (hasHeader && tableRows.length > 0) {
          const headerRow = tableRows.shift()!;
          tableHtml += '<thead><tr>';
          tableHtml += headerRow.map(c => `<th class="border border-border bg-card px-3 py-2 text-left text-primary font-semibold">${c}</th>`).join('');
          tableHtml += '</tr></thead>';
        }
        if (tableRows.length > 0) {
          tableHtml += '<tbody>';
          tableHtml += tableRows.map(row => 
            `<tr>${row.map(c => `<td class="border border-border px-3 py-2 text-muted-foreground">${c}</td>`).join('')}</tr>`
          ).join('');
          tableHtml += '</tbody>';
        }
        tableHtml += '</table>';
        result.push(tableHtml);
        inTable = false;
        tableRows = [];
        hasHeader = false;
      }
      result.push(lines[i]);
    }
  }

  if (inTable && tableRows.length > 0) {
    let tableHtml = '<table class="w-full border-collapse my-4 text-xs">';
    if (hasHeader && tableRows.length > 0) {
      const headerRow = tableRows.shift()!;
      tableHtml += '<thead><tr>';
      tableHtml += headerRow.map(c => `<th class="border border-border bg-card px-3 py-2 text-left text-primary font-semibold">${c}</th>`).join('');
      tableHtml += '</tr></thead>';
    }
    if (tableRows.length > 0) {
      tableHtml += '<tbody>';
      tableHtml += tableRows.map(row => 
        `<tr>${row.map(c => `<td class="border border-border px-3 py-2 text-muted-foreground">${c}</td>`).join('')}</tr>`
      ).join('');
      tableHtml += '</tbody>';
    }
    tableHtml += '</table>';
    result.push(tableHtml);
  }

  return result.join('\n');
}

export function markdownToSanitizedHtml(content: string): string {
  const withTables = parseMarkdownTables(content);
  
  const html = withTables
    .replace(/## (.*)/g, '<h2 class="text-primary text-sm mt-8 mb-4">$1</h2>')
    .replace(/### (.*)/g, '<h3 class="text-muted-foreground text-[11px] mt-6 mb-3">$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-primary">$1</strong>')
    .replace(/- (.*)/g, '<li class="ml-4 text-[#a0aec0]">$1</li>')
    .replace(/\n\n/g, '</p><p class="mb-4">')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-muted-foreground hover:text-primary underline" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-card border-2 border-border p-4 my-4 overflow-x-auto"><code class="text-primary text-xs">$2</code></pre>');
  
  return sanitizeHtml(html);
}
