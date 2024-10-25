export function resolveURL(baseURL: string, relURL: string): string {
  if (relURL.startsWith('#') || relURL === "") {
    return relURL;
  }
  return new URL(relURL, baseURL).toString();
}

const re1 = /url\(("[^"]*"|'[^']*'|[^)]*)\)/g;
const re2 = /@import\s+(['"])(.*?)\1/g;

function cssUrlsIndex(css: string): Array<[number, number]> {
  const idxs: Array<[number, number]> = [];
  const i1 = css.matchAll(re1);
  for (let m of i1) {
    const s = m.index + m[0].indexOf(m[1]);
    const e = s + m[1].length;
    idxs.push([s, e]);
  }
  const i2 = css.matchAll(re2);
  for (let m of i2) {
    const s = m.index + m[0].indexOf(m[2]);
    const e = s + m[2].length;
    idxs.push([s, e]);
  }
  return idxs.reverse();
}

function unquote(str: string): [string, string] {
  const firstChar = str[0];
  const lastChar = str[str.length - 1];
  if (firstChar === lastChar && (firstChar === '"' || firstChar === "'")) {
    return [str.substring(1, str.length - 1), firstChar];
  } else {
    return [str, ''];
  }
}

function rewriteCSSLinks(css: string, rewriter: (rawurl: string) => string): string {
  css = css.replace(/url\(([^)]*)\)/g, (match, p1) => {
    let [rawurl, q] = unquote(p1.trim());
    let newurl = rewriter(rawurl);
    return `url(${q}${newurl}${q})`;
  });

  css = css.replace(/@import\s+(['"])(.*?)\1/g, (match, quote, url) => {
    let newurl = rewriter(url);
    return `@import ${quote}${newurl}${quote}`
  });

  const hasSemi = css.endsWith(';');
  return hasSemi ? css : css + ';';
}

function rewritePseudoclasses(css: string): string {
  return css
    .replace(/:hover/g, ".-openreplay-hover")
    .replace(/:focus/g, ".-openreplay-focus");
}

export function resolveCSS(baseURL: string, css: string): string {
  return rewritePseudoclasses(
    rewriteCSSLinks(css, rawurl => resolveURL(baseURL, rawurl))
  );
}