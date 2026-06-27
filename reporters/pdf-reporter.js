import fs from 'node:fs';
import path from 'node:path';
import PDFDocument from 'pdfkit';

/**
 * Custom Playwright reporter that produces a PDF execution summary after EVERY
 * test run (any tag, local or CI) and saves it under ./reports.
 *
 * Output:
 *   reports/api-test-report-<YYYYMMDD-HHmmss>.pdf   (timestamped, one per run)
 *   reports/latest.pdf                              (always the most recent run)
 */
export default class PdfReporter {
  constructor(options = {}) {
    this.outputDir = options.outputDir || 'reports';
    this.tests = [];
    this.startTime = Date.now();
  }

  onBegin(config, suite) {
    this.suite = suite;
    this.startTime = Date.now();
  }

  onEnd(result) {
    const tests = this.suite ? this.suite.allTests() : [];

    const rows = tests.map((t) => {
      const last = t.results[t.results.length - 1] || {};
      const duration = t.results.reduce((sum, r) => sum + (r.duration || 0), 0);
      return {
        title: t.titlePath().filter(Boolean).slice(1).join(' › ') || t.title,
        outcome: t.outcome(), // expected | unexpected | flaky | skipped
        status: last.status || 'unknown',
        duration,
        retries: Math.max(0, t.results.length - 1),
      };
    });

    const summary = {
      total: rows.length,
      passed: rows.filter((r) => r.outcome === 'expected').length,
      failed: rows.filter((r) => r.outcome === 'unexpected').length,
      flaky: rows.filter((r) => r.outcome === 'flaky').length,
      skipped: rows.filter((r) => r.outcome === 'skipped').length,
      status: result?.status || 'unknown',
      durationMs: Date.now() - this.startTime,
    };

    return this._writePdf(summary, rows).catch((err) => {
      // Never fail the run because of report generation.
      console.error(`[pdf-reporter] failed to generate PDF: ${err.message}`);
    });
  }

  _writePdf(summary, rows) {
    fs.mkdirSync(this.outputDir, { recursive: true });

    // Timestamp like 20260627-185130
    const ts = new Date()
      .toISOString()
      .slice(0, 19)
      .replace(/[-:T]/g, (m) => (m === 'T' ? '-' : ''));

    const fileName = `api-test-report-${ts}.pdf`;
    const filePath = path.join(this.outputDir, fileName);
    const latestPath = path.join(this.outputDir, 'latest.pdf');

    const COLORS = {
      heading: '#1f2933',
      sub: '#52606d',
      passed: '#2e7d32',
      failed: '#c62828',
      flaky: '#f9a825',
      skipped: '#607d8b',
      line: '#cbd2d9',
    };

    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // ---- Header ----
    doc.fillColor(COLORS.heading).fontSize(20).text('API Test Execution Report', { align: 'left' });
    doc.moveDown(0.3);
    doc
      .fillColor(COLORS.sub)
      .fontSize(10)
      .text(`Generated: ${new Date().toLocaleString()}`)
      .text(`Environment: ${process.env.TEST_ENV || 'qa'}`)
      .text(`Overall status: ${summary.status.toUpperCase()}`);
    doc.moveDown(0.8);

    // ---- Summary cards ----
    const passRate = summary.total ? Math.round((summary.passed / summary.total) * 100) : 0;
    const cells = [
      ['Total', String(summary.total), COLORS.heading],
      ['Passed', String(summary.passed), COLORS.passed],
      ['Failed', String(summary.failed), COLORS.failed],
      ['Flaky', String(summary.flaky), COLORS.flaky],
      ['Skipped', String(summary.skipped), COLORS.skipped],
      ['Pass rate', `${passRate}%`, COLORS.heading],
      ['Duration', `${(summary.durationMs / 1000).toFixed(1)}s`, COLORS.sub],
    ];
    const startX = doc.x;
    let x = startX;
    const cardW = 72;
    const top = doc.y;
    cells.forEach(([label, value, color]) => {
      doc.fillColor(COLORS.sub).fontSize(9).text(label, x, top, { width: cardW });
      doc.fillColor(color).fontSize(16).text(value, x, top + 12, { width: cardW });
      x += cardW;
    });
    doc.moveDown(2.5);

    // ---- Results table ----
    doc.fillColor(COLORS.heading).fontSize(13).text('Scenario results', startX, doc.y);
    doc.moveDown(0.5);

    const cols = { idx: 24, status: 70, duration: 70 };
    const tableLeft = startX;
    const tableRight = 555;
    const titleW = tableRight - tableLeft - cols.idx - cols.status - cols.duration;

    const drawRow = (cells2, opts = {}) => {
      const y = doc.y;
      const font = opts.bold ? 'Helvetica-Bold' : 'Helvetica';
      doc.font(font).fontSize(9);
      let cx = tableLeft;
      doc.fillColor(opts.color || COLORS.heading).text(cells2[0], cx, y, { width: cols.idx });
      cx += cols.idx;
      doc.fillColor(opts.titleColor || COLORS.heading).text(cells2[1], cx, y, { width: titleW });
      cx += titleW;
      doc.fillColor(opts.statusColor || COLORS.heading).text(cells2[2], cx, y, { width: cols.status });
      cx += cols.status;
      doc.fillColor(COLORS.sub).text(cells2[3], cx, y, { width: cols.duration });
      doc.font('Helvetica');
    };

    drawRow(['#', 'Scenario', 'Status', 'Duration'], { bold: true });
    doc.moveDown(0.3);
    doc.strokeColor(COLORS.line).moveTo(tableLeft, doc.y).lineTo(tableRight, doc.y).stroke();
    doc.moveDown(0.3);

    const statusColor = (o) =>
      ({ expected: COLORS.passed, unexpected: COLORS.failed, flaky: COLORS.flaky, skipped: COLORS.skipped }[o] ||
      COLORS.heading);
    const statusLabel = (o) =>
      ({ expected: 'PASSED', unexpected: 'FAILED', flaky: 'FLAKY', skipped: 'SKIPPED' }[o] || o.toUpperCase());

    rows.forEach((r, i) => {
      if (doc.y > 760) doc.addPage();
      drawRow(
        [String(i + 1), r.title, statusLabel(r.outcome), `${(r.duration / 1000).toFixed(2)}s`],
        { statusColor: statusColor(r.outcome) }
      );
      doc.moveDown(0.5);
    });

    // ---- Footer ----
    doc.moveDown(1);
    doc.strokeColor(COLORS.line).moveTo(tableLeft, doc.y).lineTo(tableRight, doc.y).stroke();
    doc.moveDown(0.3);
    doc
      .fillColor(COLORS.sub)
      .fontSize(8)
      .text('Generated automatically by the Playwright-BDD API framework (pdf-reporter).', tableLeft);

    doc.end();

    return new Promise((resolve, reject) => {
      stream.on('finish', () => {
        try {
          fs.copyFileSync(filePath, latestPath);
        } catch {
          /* ignore copy errors */
        }
        console.log(`\n[pdf-reporter] PDF report written: ${filePath}`);
        resolve();
      });
      stream.on('error', reject);
    });
  }
}
