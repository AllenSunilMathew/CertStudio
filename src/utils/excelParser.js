import * as XLSX from 'xlsx';

/**
 * Parse an Excel / CSV File and return headers + rows.
 * @param {File} file
 * @returns {{ headers: {index,label}[], rows: string[][], totalRows: number, detectedNameCol: number|null, names: string[] }}
 */
export async function parseExcel(file) {
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: 'array' });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const raw = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  if (!raw || raw.length === 0) throw new Error('The spreadsheet is empty');

  const headers = (raw[0] || []).map((h, i) => ({
    index: i,
    label: String(h ?? `Column ${i + 1}`),
  }));

  const dataRows = raw.slice(1).filter((r) => r.some((c) => c !== undefined && c !== ''));

  // Auto-detect name column
  const detectedNameCol = headers.findIndex((h) =>
    h.label.toLowerCase().includes('name')
  );

  const names =
    detectedNameCol >= 0
      ? dataRows.map((r) => String(r[detectedNameCol] ?? '').trim()).filter(Boolean)
      : [];

  return { headers, dataRows, totalRows: dataRows.length, detectedNameCol, names };
}

/**
 * Extract all values from a specific column index.
 */
export function extractColumn(dataRows, colIndex) {
  return dataRows
    .map((r) => String(r[colIndex] ?? '').trim())
    .filter(Boolean);
}
