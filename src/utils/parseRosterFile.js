import Papa from 'papaparse';
import * as XLSX from 'xlsx';

// File extensions accepted by every roster upload path
export const ACCEPTED_EXTENSIONS = ['xlsx', 'xls', 'csv'];
export const ACCEPT_ATTRIBUTE = '.xlsx,.xls,.csv';

export const isSupportedRosterFile = (fileName) => {
  const ext = String(fileName || '').split('.').pop().toLowerCase();
  return ACCEPTED_EXTENSIONS.includes(ext);
};

// Parses a roster file (.csv via PapaParse, .xlsx/.xls via SheetJS) into an
// array of row objects keyed by header. Blank CSV cells are stripped so they
// behave like missing keys, matching SheetJS sheet_to_json output (otherwise
// Number('') would coerce missing grades to 0 instead of null downstream).
export const parseRosterFile = (file) => {
  return new Promise((resolve, reject) => {
    const ext = String(file.name || '').split('.').pop().toLowerCase();

    if (!ACCEPTED_EXTENSIONS.includes(ext)) {
      reject(new Error('Unsupported file format. Please upload a .xlsx, .xls, or .csv file.'));
      return;
    }

    if (ext === 'csv') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const rows = results.data.map((row) => {
            const clean = {};
            Object.entries(row).forEach(([key, value]) => {
              if (value !== '' && value !== null && value !== undefined) {
                clean[key] = value;
              }
            });
            return clean;
          });
          resolve(rows);
        },
        error: (err) => reject(err)
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const workbook = XLSX.read(e.target.result, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        resolve(XLSX.utils.sheet_to_json(sheet));
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read the file.'));
    reader.readAsArrayBuffer(file);
  });
};
