// docx.js — minimal, dependency-free reader for the one thing we need from a
// Google Docs ".docx" export: word/document.xml, and the original vs.
// suggestions-accepted plain text it encodes via Word tracked changes.
//
// A .docx is a ZIP. We don't bundle a ZIP library — we parse the central
// directory by hand and inflate the single entry we want with the built-in
// DecompressionStream. XML parsing uses DOMParser (available in the popup).
//
// Exposed globals: extractDocumentXml(arrayBuffer) -> Promise<string>
//                  parseTrackedChanges(xmlString)  -> { original, modified, hasSuggestions }

(function () {
  'use strict';

  // --- ZIP -----------------------------------------------------------------

  async function inflateRaw(bytes) {
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
    return new Uint8Array(await new Response(stream).arrayBuffer());
  }

  async function extractDocumentXml(arrayBuffer) {
    const bytes = new Uint8Array(arrayBuffer);
    const view = new DataView(arrayBuffer);
    const len = bytes.length;

    // End of Central Directory record: signature 0x06054b50, within the last
    // 22 + 65535 bytes (the trailing comment can be up to 64 KB).
    let eocd = -1;
    const minPos = Math.max(0, len - (22 + 0xffff));
    for (let i = len - 22; i >= minPos; i--) {
      if (view.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
    }
    if (eocd < 0) throw new Error('Not a valid .docx file (no ZIP directory).');

    const cdCount = view.getUint16(eocd + 10, true);
    let p = view.getUint32(eocd + 16, true); // offset of central directory
    let target = null;
    for (let i = 0; i < cdCount; i++) {
      if (view.getUint32(p, true) !== 0x02014b50) break; // central dir header
      const method = view.getUint16(p + 10, true);
      const compSize = view.getUint32(p + 20, true);
      const nameLen = view.getUint16(p + 28, true);
      const extraLen = view.getUint16(p + 30, true);
      const commentLen = view.getUint16(p + 32, true);
      const localOffset = view.getUint32(p + 42, true);
      const name = new TextDecoder().decode(bytes.subarray(p + 46, p + 46 + nameLen));
      if (name === 'word/document.xml') { target = { method, compSize, localOffset }; break; }
      p += 46 + nameLen + extraLen + commentLen;
    }
    if (!target) throw new Error('Unexpected .docx layout (word/document.xml not found).');

    // Local file header at target.localOffset: the data starts after the
    // header's own name + extra fields, whose lengths differ from the
    // central-directory copy.
    const lo = target.localOffset;
    if (view.getUint32(lo, true) !== 0x04034b50) throw new Error('Corrupt .docx (bad local header).');
    const dataStart = lo + 30 + view.getUint16(lo + 26, true) + view.getUint16(lo + 28, true);
    const compData = bytes.subarray(dataStart, dataStart + target.compSize);

    let xmlBytes;
    if (target.method === 0) xmlBytes = compData;            // stored
    else if (target.method === 8) xmlBytes = await inflateRaw(compData); // deflate
    else throw new Error('Unsupported .docx compression method ' + target.method + '.');
    return new TextDecoder().decode(xmlBytes);
  }

  // --- Tracked changes -----------------------------------------------------
  //
  // Word represents a suggested insertion as <w:ins>…runs…</w:ins> and a
  // suggested deletion as <w:del>…runs with <w:delText>…</w:del>. We walk the
  // tree once and emit two strings in parallel:
  //   original  = the document with every suggestion REJECTED
  //   modified  = the document with every suggestion ACCEPTED
  // A run's text goes into `original` unless it's inside an insertion, and into
  // `modified` unless it's inside a deletion (nested ins+del cancels in both).

  function parseTrackedChanges(xmlString) {
    const doc = new DOMParser().parseFromString(xmlString, 'application/xml');
    if (doc.getElementsByTagName('parsererror').length) {
      throw new Error('Could not parse the document XML.');
    }

    let original = '';
    let modified = '';
    let hasSuggestions = false;

    // The WordprocessingML namespace prefix is conventionally "w:", but be
    // robust about it: return the local part of an element's name regardless
    // of whether the parser already stripped the prefix.
    const local = (el) => {
      const n = el.localName || el.nodeName || '';
      const i = n.indexOf(':');
      return i < 0 ? n : n.slice(i + 1);
    };
    const has = (el, ln) => Array.prototype.some.call(el.children, (c) => local(c) === ln);
    const child = (el, ln) => Array.prototype.find.call(el.children, (c) => local(c) === ln);

    function emit(text, inIns, inDel) {
      if (!inIns) original += text;
      if (!inDel) modified += text;
    }

    function walk(node, inIns, inDel) {
      for (const el of node.children) {
        switch (local(el)) {
          case 'ins':
          case 'moveTo':
            hasSuggestions = true;
            walk(el, true, inDel);
            break;
          case 'del':
          case 'moveFrom':
            hasSuggestions = true;
            walk(el, inIns, true);
            break;
          case 't':
          case 'delText':
            emit(el.textContent, inIns, inDel);
            break;
          case 'tab':
            emit('\t', inIns, inDel);
            break;
          case 'br':
          case 'cr':
            emit('\n', inIns, inDel);
            break;
          case 'p': {
            walk(el, inIns, inDel);
            // Paragraph mark — its own insertion/deletion can be tracked too
            // (splitting/merging paragraphs). w:pPr/w:rPr/{w:ins|w:del}.
            const pPr = child(el, 'pPr');
            const rPr = pPr && child(pPr, 'rPr');
            const markIns = !!rPr && has(rPr, 'ins');
            const markDel = !!rPr && has(rPr, 'del');
            if (markIns || markDel) hasSuggestions = true;
            // An inserted mark means the break doesn't exist in the original
            // (paragraphs are joined); a deleted mark means it's gone in the
            // accepted version.
            if (!markIns) original += '\n';
            if (!markDel) modified += '\n';
            break;
          }
          // Skip pure-property containers (they hold formatting-only change
          // records like w:rPrChange/w:pPrChange, which don't affect text).
          case 'pPr':
          case 'rPr':
          case 'sectPr':
          case 'tblPr':
          case 'tcPr':
          case 'trPr':
            break;
          default:
            // Everything else is a container we just descend into: w:body,
            // w:r, w:tbl/w:tr/w:tc, w:hyperlink, w:sdt/w:sdtContent, …
            walk(el, inIns, inDel);
        }
      }
    }

    walk(doc.documentElement, false, false);

    const tidy = (s) => s.replace(/\r/g, '').replace(/[ \t]+(?=\n)/g, '').replace(/\s+$/, '');
    return { original: tidy(original), modified: tidy(modified), hasSuggestions };
  }

  // eslint-disable-next-line no-undef
  self.extractDocumentXml = extractDocumentXml;
  // eslint-disable-next-line no-undef
  self.parseTrackedChanges = parseTrackedChanges;
})();
