const fs = require('fs');
const path = require('path');

// Ensure uploads directory exists
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Allowed MIME types
const ALLOWED_MIME_TYPES = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'application/pdf': '.pdf'
};

// Maximum file size: 5MB
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

/**
 * Validates uploaded file buffers or base64 data for profile photos and verification documents
 * @param {Object} fileData
 * @param {string} fileData.base64 Base64 data string (e.g., data:image/png;base64,...)
 * @param {string} [fileData.fileName]
 * @returns {{ valid: boolean, error?: string, safePath?: string, url?: string }}
 */
function validateAndSaveUpload({ base64, fileName = 'upload' }) {
  if (!base64 || typeof base64 !== 'string') {
    return { valid: false, error: 'No file data provided' };
  }

  // Parse header
  const matches = base64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    return { valid: false, error: 'Invalid file format. Must be a valid base64 data URI.' };
  }

  const mimeType = matches[1].toLowerCase();
  const rawBase64 = matches[2];

  // 1. Validate MIME Type
  if (!ALLOWED_MIME_TYPES[mimeType]) {
    return {
      valid: false,
      error: `Disallowed file type: ${mimeType}. Allowed types: JPEG, PNG, WEBP, PDF.`
    };
  }

  // 2. Validate Size
  const buffer = Buffer.from(rawBase64, 'base64');
  if (buffer.length > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size exceeds the 5MB limit (Provided size: ${(buffer.length / (1024 * 1024)).toFixed(2)} MB).`
    };
  }

  // 3. Generate safe persistent filename
  const extension = ALLOWED_MIME_TYPES[mimeType];
  const safeBaseName = fileName.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30);
  const uniqueName = `${safeBaseName}_${Date.now()}_${Math.floor(Math.random() * 10000)}${extension}`;
  const targetFilePath = path.join(UPLOADS_DIR, uniqueName);

  // Write file persistently
  fs.writeFileSync(targetFilePath, buffer);

  return {
    valid: true,
    fileName: uniqueName,
    mimeType,
    sizeBytes: buffer.length,
    url: `/uploads/${uniqueName}`
  };
}

module.exports = {
  validateAndSaveUpload,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
  UPLOADS_DIR
};
