/* markdown.js —— 轻量 Markdown 渲染器（标题/段落/列表/代码/引用/链接/图片/表格/粗斜体） */
export const MiniMD = (function () {

  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function inline(s) {
    let out = esc(s);
    out = out.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img alt="$1" src="$2" loading="lazy">');
    out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    out = out.replace(/`([^`]+)`/g, '<code>$1</code>');
    out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    out = out.replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');
    out = out.replace(/~~([^~]+)~~/g, '<del>$1</del>');
    return out;
  }

  function render(md) {
    const lines = String(md || '').replace(/\r\n?/g, '\n').split('\n');
    const html = [];
    let i = 0;

    while (i < lines.length) {
      let line = lines[i];

      // 空行
      if (!line.trim()) { i++; continue; }

      // 代码块
      if (/^```/.test(line)) {
        const lang = line.slice(3).trim();
        const buf = [];
        i++;
        while (i < lines.length && !/^```/.test(lines[i])) { buf.push(lines[i]); i++; }
        i++;
        html.push(`<pre class="md-pre"><code class="lang-${esc(lang)}">${esc(buf.join('\n'))}</code></pre>`);
        continue;
      }

      // 标题
      const h = line.match(/^(#{1,6})\s+(.*)$/);
      if (h) {
        const lv = h[1].length;
        const id = h[2].trim().toLowerCase().replace(/[^\w一-龥]+/g, '-');
        html.push(`<h${lv} id="${id}">${inline(h[2])}</h${lv}>`);
        i++; continue;
      }

      // 分割线
      if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
        html.push('<hr>'); i++; continue;
      }

      // 引用
      if (/^>\s?/.test(line)) {
        const buf = [];
        while (i < lines.length && /^>\s?/.test(lines[i])) {
          buf.push(lines[i].replace(/^>\s?/, '')); i++;
        }
        html.push(`<blockquote>${render(buf.join('\n'))}</blockquote>`);
        continue;
      }

      // 无序列表
      if (/^\s*[-*+]\s+/.test(line)) {
        const buf = [];
        while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i])) {
          buf.push(`<li>${inline(lines[i].replace(/^\s*[-*+]\s+/, ''))}</li>`); i++;
        }
        html.push(`<ul>${buf.join('')}</ul>`);
        continue;
      }

      // 有序列表
      if (/^\s*\d+\.\s+/.test(line)) {
        const buf = [];
        while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
          buf.push(`<li>${inline(lines[i].replace(/^\s*\d+\.\s+/, ''))}</li>`); i++;
        }
        html.push(`<ol>${buf.join('')}</ol>`);
        continue;
      }

      // 表格
      if (/\|/.test(line) && i + 1 < lines.length && /^\s*\|?[\s:|-]+\|/.test(lines[i + 1])) {
        const head = line.split('|').map(c => c.trim()).filter(c => c !== '');
        i += 2;
        const rows = [];
        while (i < lines.length && /\|/.test(lines[i])) {
          rows.push(lines[i].split('|').map(c => c.trim()).filter(c => c !== ''));
          i++;
        }
        html.push(
          `<table class="md-table"><thead><tr>${head.map(c => `<th>${inline(c)}</th>`).join('')}</tr></thead>` +
          `<tbody>${rows.map(r => `<tr>${r.map(c => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`
        );
        continue;
      }

      // 段落（合并连续非空行）
      const buf = [];
      while (i < lines.length && lines[i].trim() && !/^(#{1,6}\s|```|>|[-*+]\s|\d+\.\s|(-{3,}|\*{3,}|_{3,})$)/.test(lines[i])) {
        buf.push(lines[i]); i++;
      }
      if (buf.length) html.push(`<p>${inline(buf.join('\n')).replace(/\n/g, '<br>')}</p>`);
      else i++;
    }
    return html.join('\n');
  }

  return { render, esc };
})();
