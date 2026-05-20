import PDFDocument from 'pdfkit';
import { ensureCyrillicFonts } from './fontLoader.js';

const PALETTE = {
  primary: '#1a3a5c',
  accent: '#ff6b35',
  text: '#222',
  muted: '#666',
  line: '#e0e0e0',
};

function fmt(n) {
  return Number(n).toFixed(2);
}

const statusLabel = {
  pending: 'Ожидает',
  paid: 'Оплачен',
  shipped: 'Отправлен',
  delivered: 'Доставлен',
  cancelled: 'Отменён',
};

async function makeDoc() {
  const fonts = await ensureCyrillicFonts();
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  if (fonts.available) {
    doc.registerFont('Regular', fonts.regular);
    doc.registerFont('Bold', fonts.bold);
  } else {
    doc.registerFont('Regular', 'Helvetica');
    doc.registerFont('Bold', 'Helvetica-Bold');
  }
  return { doc, cyrillic: fonts.available };
}

function tr(en, ru, cyrillic) {
  return cyrillic ? ru : en;
}

function header(doc, cyrillic, title, subtitle) {
  doc.fillColor(PALETTE.primary).font('Bold').fontSize(22).text('SportArena', 50, 40);
  doc.fillColor(PALETTE.muted).font('Regular').fontSize(9)
    .text(tr('Online sports apparel store', 'Магазин спортивной одежды', cyrillic), 50, 64);
  doc.fillColor(PALETTE.text).font('Bold').fontSize(16).text(title, 50, 100);
  if (subtitle) {
    doc.fillColor(PALETTE.muted).font('Regular').fontSize(10).text(subtitle, 50, 122);
  }
  doc.moveTo(50, 145).lineTo(545, 145).strokeColor(PALETTE.line).stroke();
}

export async function streamOrderReceipt(order, res) {
  const { doc, cyrillic } = await makeDoc();
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=order-${order.id}.pdf`);
  doc.pipe(res);

  header(
    doc,
    cyrillic,
    tr(`Receipt #${order.id}`, `Чек по заказу №${order.id}`, cyrillic),
    `${tr('Date', 'Дата', cyrillic)}: ${new Date(order.created_at).toLocaleString(cyrillic ? 'ru-RU' : 'en-GB')}`
  );

  let y = 160;
  doc.font('Bold').fontSize(11).fillColor(PALETTE.text).text(tr('Customer', 'Покупатель', cyrillic), 50, y);
  doc.font('Regular').fontSize(10).fillColor(PALETTE.muted)
    .text(order.user?.name || '-', 50, y + 16)
    .text(order.user?.email || '-', 50, y + 30);

  doc.font('Bold').fontSize(11).fillColor(PALETTE.text).text(tr('Shipping', 'Доставка', cyrillic), 300, y);
  doc.font('Regular').fontSize(10).fillColor(PALETTE.muted)
    .text(order.shipping_address, 300, y + 16, { width: 245 })
    .text(`${tr('Phone', 'Телефон', cyrillic)}: ${order.contact_phone}`, 300, y + 44);

  y = 230;
  doc.font('Bold').fontSize(11).fillColor(PALETTE.primary)
    .text(tr('Product', 'Товар', cyrillic), 50, y)
    .text(tr('Size', 'Размер', cyrillic), 280, y)
    .text(tr('Qty', 'Кол-во', cyrillic), 340, y)
    .text(tr('Price', 'Цена', cyrillic), 400, y)
    .text(tr('Total', 'Сумма', cyrillic), 480, y);
  doc.moveTo(50, y + 16).lineTo(545, y + 16).strokeColor(PALETTE.line).stroke();
  y += 24;

  for (const item of order.items || []) {
    doc.font('Regular').fontSize(10).fillColor(PALETTE.text)
      .text(item.product?.name || '-', 50, y, { width: 220 })
      .text(item.size, 280, y)
      .text(String(item.quantity), 340, y)
      .text(fmt(item.unit_price), 400, y)
      .text(fmt(item.unit_price * item.quantity), 480, y);
    y += 22;
    if (y > 720) { doc.addPage(); y = 50; }
  }

  y += 10;
  doc.moveTo(50, y).lineTo(545, y).strokeColor(PALETTE.line).stroke();
  y += 14;

  doc.font('Regular').fontSize(11).fillColor(PALETTE.muted)
    .text(`${tr('Subtotal', 'Подытог', cyrillic)}:`, 380, y).fillColor(PALETTE.text).text(fmt(order.subtotal) + ' BYN', 480, y);
  y += 20;
  if (Number(order.discount) > 0) {
    doc.fillColor(PALETTE.muted)
      .text(`${tr('Discount', 'Скидка', cyrillic)}${order.promoCode ? ' (' + order.promoCode.code + ')' : ''}:`, 380, y)
      .fillColor(PALETTE.accent).text('-' + fmt(order.discount) + ' BYN', 480, y);
    y += 20;
  }
  doc.font('Bold').fontSize(13).fillColor(PALETTE.primary)
    .text(`${tr('TOTAL', 'ИТОГО', cyrillic)}:`, 380, y).text(fmt(order.total) + ' BYN', 480, y);

  doc.font('Regular').fontSize(9).fillColor(PALETTE.muted)
    .text(tr('Thank you for shopping with SportArena!', 'Спасибо за покупку в SportArena!', cyrillic), 50, 780, { align: 'center', width: 495 });

  doc.end();
}

export async function streamSalesReport(rows, summary, period, res) {
  const { doc, cyrillic } = await makeDoc();
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=sales-report-${period.from || 'all'}.pdf`);
  doc.pipe(res);

  header(
    doc,
    cyrillic,
    tr('Sales Report', 'Отчёт по продажам', cyrillic),
    `${tr('Period', 'Период', cyrillic)}: ${period.from || tr('beginning', 'начало', cyrillic)} — ${period.to || tr('today', 'сегодня', cyrillic)}`
  );

  let y = 160;
  doc.font('Bold').fontSize(12).fillColor(PALETTE.text).text(tr('Summary', 'Сводка', cyrillic), 50, y);
  y += 22;
  doc.font('Regular').fontSize(11).fillColor(PALETTE.muted)
    .text(`${tr('Total orders', 'Всего заказов', cyrillic)}: `, 50, y).fillColor(PALETTE.text).text(String(summary.totalOrders), 200, y);
  y += 18;
  doc.fillColor(PALETTE.muted).text(`${tr('Total revenue', 'Общая выручка', cyrillic)}: `, 50, y).fillColor(PALETTE.text).text(fmt(summary.totalRevenue) + ' BYN', 200, y);
  y += 18;
  doc.fillColor(PALETTE.muted).text(`${tr('Average check', 'Средний чек', cyrillic)}: `, 50, y).fillColor(PALETTE.text).text(fmt(summary.avgCheck) + ' BYN', 200, y);
  y += 28;

  doc.font('Bold').fontSize(11).fillColor(PALETTE.primary)
    .text(tr('Order #', '№', cyrillic), 50, y)
    .text(tr('Date', 'Дата', cyrillic), 110, y)
    .text(tr('Customer', 'Покупатель', cyrillic), 200, y)
    .text(tr('Status', 'Статус', cyrillic), 340, y)
    .text(tr('Total', 'Сумма', cyrillic), 480, y);
  doc.moveTo(50, y + 16).lineTo(545, y + 16).strokeColor(PALETTE.line).stroke();
  y += 24;

  for (const o of rows) {
    doc.font('Regular').fontSize(10).fillColor(PALETTE.text)
      .text(String(o.id), 50, y)
      .text(new Date(o.created_at).toLocaleDateString(cyrillic ? 'ru-RU' : 'en-GB'), 110, y)
      .text(o.user?.name || '-', 200, y, { width: 130 })
      .text(cyrillic ? (statusLabel[o.status] || o.status) : o.status, 340, y)
      .text(fmt(o.total) + ' BYN', 480, y);
    y += 20;
    if (y > 760) { doc.addPage(); y = 50; }
  }

  doc.end();
}
