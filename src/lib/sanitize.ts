import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";

const window = new JSDOM("").window;
const purify = DOMPurify(window);

export function sanitizeHtml(dirty: string): string {
  return purify.sanitize(dirty, {
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

export function markdownToSanitizedHtml(content: string): string {
  const html = content
    .replace(/## (.*)/g, '<h2 class="text-primary text-sm mt-8 mb-4">$1</h2>')
    .replace(/### (.*)/g, '<h3 class="text-muted-foreground text-[11px] mt-6 mb-3">$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-primary">$1</strong>')
    .replace(/- (.*)/g, '<li class="ml-4 text-[#a0aec0]">$1</li>')
    .replace(/\n\n/g, '</p><p class="mb-4">')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-muted-foreground hover:text-primary underline" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-card border-2 border-border p-4 my-4 overflow-x-auto"><code class="text-primary text-xs">$2</code></pre>')
    .replace(/\|(.+)\|/g, (match) => {
      const cells = match.split('|').filter(c => c.trim());
      return `<tr>${cells.map(c => `<td class="border border-border px-2 py-1 text-xs">${c.trim()}</td>`).join('')}</tr>`;
    });
  
  return sanitizeHtml(html);
}
