import { jsPDF } from 'jspdf';
import type { GuestbookMessage } from '../types';

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN = 20;

export function buildGuestbookPdf(messages: GuestbookMessage[], honoree: string): jsPDF {
  const pdf = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
  // Standard PDF fonts cannot encode emoji. Rasterize only those lines using
  // the browser's Unicode fonts; ordinary text remains selectable in the PDF.
  const canvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;
  const context = canvas?.getContext('2d');
  const needsUnicode = (value: string) => /[^\u0000-\u00ff\u20ac\u2018-\u201e\u2026]/u.test(value);
  const scale = 6;
  const canvasFont = () => `${pdf.getFont().fontStyle.includes('bold') ? 'bold ' : ''}${pdf.getFontSize() * scale / (72 / 25.4)}px Arial, sans-serif`;
  const wrap = (value: string, width: number): string[] => {
    if (!context || !needsUnicode(value)) return pdf.splitTextToSize(value, width);
    context.font = canvasFont();
    const result: string[] = [];
    for (const paragraph of value.split('\n')) {
      let line = '';
      for (const word of paragraph.split(/(?<=\s)/u)) {
        if (line && context.measureText(line + word).width > width * scale) {
          result.push(line.trimEnd()); line = '';
        }
        // Split overlong words at grapheme boundaries, preserving emoji sequences.
        for (const { segment } of new Intl.Segmenter('es', { granularity: 'grapheme' }).segment(word)) {
          if (line && context.measureText(line + segment).width > width * scale) {
            result.push(line.trimEnd()); line = '';
          }
          line += segment;
        }
      }
      result.push(line.trimEnd());
    }
    return result;
  };
  const text = (value: string | string[], x: number, baseline: number, align?: 'right') => {
    const lines = Array.isArray(value) ? value : [value];
    lines.forEach((line, index) => {
      const y = baseline + index * pdf.getFontSize() * 1.15 / (72 / 25.4);
      if (!context || !canvas || !needsUnicode(line)) {
        pdf.text(line, x, y, align ? { align } : undefined);
        return;
      }
      context.font = canvasFont();
      const width = Math.ceil(context.measureText(line).width) + 4;
      const fontPixels = pdf.getFontSize() * scale / (72 / 25.4);
      canvas.width = width;
      canvas.height = Math.ceil(fontPixels * 1.8);
      context.font = canvasFont();
      context.fillStyle = pdf.getTextColor();
      context.fillText(line, 2, fontPixels * 1.25);
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', x - (align ? width / scale : 0) - 2 / scale, y - fontPixels * 1.25 / scale, width / scale, canvas.height / scale);
    });
  };
  const sorted = [...messages].sort((a, b) => String(a.createdAt || '').localeCompare(String(b.createdAt || '')));
  let y = 34;

  const newPage = () => {
    pdf.addPage();
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.setTextColor(100, 100, 100);
    text(`Libro de firmas - ${honoree}`, MARGIN, 17);
    y = 28;
  };
  const reserve = (height: number) => { if (y + height > PAGE_HEIGHT - 24) newPage(); };

  pdf.setProperties({ title: `Libro de firmas - ${honoree}`, subject: 'Dedicatorias de la celebración', creator: 'Invitación de Clara' });
  pdf.setTextColor(45, 45, 45);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(22);
  text('Libro de firmas', MARGIN, y);
  y += 10;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(13);
  text(honoree, MARGIN, y);
  y += 7;
  pdf.setFontSize(9);
  pdf.setTextColor(105, 105, 105);
  text(`${sorted.length} dedicatoria${sorted.length === 1 ? '' : 's'} - Generado el ${new Date().toLocaleDateString('es-AR')}`, MARGIN, y);
  y += 17;

  for (const entry of sorted) {
    const name = String(entry.guestName ?? '').trim() || 'Invitado';
    const date = entry.createdAt && !Number.isNaN(Date.parse(entry.createdAt))
      ? new Date(entry.createdAt).toLocaleDateString('es-AR') : '';
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10.5);
    const lines = wrap(String(entry.message ?? '').trim() || '(Sin mensaje)', PAGE_WIDTH - 2 * MARGIN);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    const nameLines = wrap(name, 125);
    reserve(12 + nameLines.length * 6);
    pdf.setDrawColor(210, 210, 210);
    pdf.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
    y += 8;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.setTextColor(35, 35, 35);
    text(nameLines, MARGIN, y);
    if (date) {
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(110, 110, 110);
      text(date, PAGE_WIDTH - MARGIN, y, 'right');
    }
    y += Math.max(8, nameLines.length * 6 + 2);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10.5);
    pdf.setTextColor(55, 55, 55);
    for (const line of lines) {
      reserve(6);
      // A page header changes the font; restore the body style after every break.
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10.5);
      pdf.setTextColor(55, 55, 55);
      text(line, MARGIN, y);
      y += 6;
    }
    y += 9;
  }

  const pages = pdf.getNumberOfPages();
  for (let page = 1; page <= pages; page += 1) {
    pdf.setPage(page);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(130, 130, 130);
    text(`${page} / ${pages}`, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 12, 'right');
  }
  return pdf;
}

export function prepareGuestbookPdf(messages: GuestbookMessage[], honoree: string): { blob: Blob; filename: string } {
  const filename = `Libro_de_firmas_${honoree.replace(/[^a-zA-Z0-9_-]+/g, '_')}.pdf`;
  return { blob: buildGuestbookPdf(messages, honoree).output('blob'), filename };
}
