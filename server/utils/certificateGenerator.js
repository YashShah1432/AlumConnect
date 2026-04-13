const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

const formatDate = (d) => {
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return '';
  // dd-mm-yyyy
  const dd = String(dt.getDate()).padStart(2, '0');
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const yyyy = dt.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
};

const generateCertificatePdfBuffer = async ({
  certificateNo,
  donorName,
  donorEmail,
  donorBatch,
  amount,
  purpose,
  utrNo,
  paymentDate,
  issuedAt
}) =>
  new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });

      const chunks = [];
      doc.on('data', (c) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // Header
      doc.fontSize(16).text('WALCHAND INSTITUTE OF TECHNOLOGY, SOLAPUR', { align: 'center' });
      doc.moveDown(0.2);
      doc
        .fontSize(10)
        .fillColor('#444')
        .text('Ashok Chowk, Solapur – 413006, Maharashtra, India', { align: 'center' });
      doc.moveDown(0.8);

      doc.fillColor('#000');
      doc.fontSize(18).text('TAX EXEMPTION CERTIFICATE (80G)', { align: 'center' });
      doc.moveDown(0.4);
      doc.fontSize(11).text(`Certificate No: ${certificateNo}`, { align: 'center' });

      doc.moveDown(0.8);

      // Sample placeholders (you will update later)
      doc
        .fontSize(10)
        .fillColor('#444')
        .text('PAN: XXXXX1234X   |   80G Regn No: SAMPLE/80G/0000/2026', { align: 'center' });

      doc.fillColor('#000');
      doc.moveDown(1);

      // Details table-like layout
      const rows = [
        ['Donor Name', donorName],
        ['Donor Email', donorEmail],
        ['Batch', donorBatch],
        ['Donation Purpose', purpose],
        ['Amount', `₹ ${Number(amount || 0).toLocaleString('en-IN')}`],
        ['UTR No', utrNo],
        ['Payment Date', formatDate(paymentDate)],
        ['Certificate Issue Date', formatDate(issuedAt)]
      ];

      rows.forEach(([k, v]) => {
        doc.font('Helvetica-Bold').text(`${k}: `, { continued: true });
        doc.font('Helvetica').text(`${v ?? ''}`);
        doc.moveDown(0.2);
      });

      doc.moveDown(1);

      // Footer note
      doc
        .fontSize(9)
        .fillColor('#444444')
        .text(
          'Note: This certificate is system-generated upon verification of payment and approval by the administrator.',
          { align: 'left' }
        );

      doc.moveDown(2);

      // Stamp/Signature (optional image)
      // Put your stamp/sign in: server/assets/stamp.png
      const stampPath = path.join(__dirname, '..', 'assets', 'stamp.png');
      if (fs.existsSync(stampPath)) {
        doc.image(stampPath, doc.page.width - 170, doc.y, { width: 120 });
      }

      doc.moveDown(4);
      doc
        .fontSize(11)
        .fillColor('#000')
        .text('Authorized Signatory', { align: 'right' });

      doc.end();
    } catch (e) {
      reject(e);
    }
  });

module.exports = { generateCertificatePdfBuffer };