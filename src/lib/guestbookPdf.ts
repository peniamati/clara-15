import { jsPDF } from 'jspdf';
import type { GuestbookMessage } from '../types';

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN = 20;

export function buildGuestbookPdf(messages: GuestbookMessage[], honoree: string): jsPDF {
  const pdf = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
  const sorted = [...messages].sort((a, b) => String(a.createdAt || '').localeCompare(String(b.createdAt || '')));
  let y = 34;

  const newPage = () => {
    pdf.addPage();
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Libro de firmas - ${honoree}`, MARGIN, 17);
    y = 28;
  };
  const reserve = (height: number) => { if (y + height > PAGE_HEIGHT - 24) newPage(); };

  pdf.setProperties({ title: `Libro de firmas - ${honoree}`, subject: 'Dedicatorias de la celebración', creator: 'Invitación de Clara' });
  pdf.setTextColor(45, 45, 45);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(22);
  pdf.text('Libro de firmas', MARGIN, y);
  y += 10;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(13);
  pdf.text(honoree, MARGIN, y);
  y += 7;
  pdf.setFontSize(9);
  pdf.setTextColor(105, 105, 105);
  pdf.text(`${sorted.length} dedicatoria${sorted.length === 1 ? '' : 's'} - Generado el ${new Date().toLocaleDateString('es-AR')}`, MARGIN, y);
  y += 17;

  for (const entry of sorted) {
    const name = entry.guestName?.trim() || 'Invitado';
    const date = entry.createdAt && !Number.isNaN(Date.parse(entry.createdAt))
      ? new Date(entry.createdAt).toLocaleDateString('es-AR') : '';
    const lines = pdf.splitTextToSize(entry.message?.trim() || '(Sin mensaje)', PAGE_WIDTH - 2 * MARGIN);
    const nameLines = pdf.splitTextToSize(name, 125);
    reserve(12 + nameLines.length * 6);
    pdf.setDrawColor(210, 210, 210);
    pdf.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
    y += 8;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.setTextColor(35, 35, 35);
    pdf.text(nameLines, MARGIN, y);
    if (date) {
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(110, 110, 110);
      pdf.text(date, PAGE_WIDTH - MARGIN, y, { align: 'right' });
    }
    y += Math.max(8, nameLines.length * 6 + 2);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10.5);
    pdf.setTextColor(55, 55, 55);
    for (const line of lines) {
      reserve(6);
      pdf.text(line, MARGIN, y);
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
    pdf.text(`${page} / ${pages}`, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 12, { align: 'right' });
  }
  return pdf;
}

export function downloadGuestbookPdf(messages: GuestbookMessage[], honoree: string): void {
  const filename = `Libro_de_firmas_${honoree.replace(/[^a-zA-Z0-9_-]+/g, '_')}.pdf`;
  buildGuestbookPdf(messages, honoree).save(filename);
}
