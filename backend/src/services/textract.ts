import { TextractClient, DetectDocumentTextCommand, AnalyzeDocumentCommand, FeatureType } from '@aws-sdk/client-textract';
import { parseTextractResponse, NormalizedDocumentStructure, TextractBlock } from './textractParser';

const region = process.env.AWS_REGION || 'us-east-1';
const textractClient = new TextractClient({ region });

export interface NormalizedTextPage {
  pageNumber: number;
  text: string;
}

export interface NormalizedDocumentText {
  documentId: string;
  rawText: string;
  formattedText?: string;
  pages: NormalizedTextPage[];
  structure?: NormalizedDocumentStructure;
  extractionFailed?: boolean;
}

/**
 * Detects whether the given bytes are binary PDF content.
 * NEVER convert PDF binary to string — it produces garbled output like "%PDF-1.7 5 0 obj..."
 */
function isBinaryPdf(bytes: Uint8Array): boolean {
  if (bytes.length < 5) return false;
  // PDF magic bytes: %PDF (0x25 0x50 0x44 0x46)
  return bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46;
}

/**
 * Detects whether bytes are a binary image format (JPEG, PNG, TIFF, BMP, GIF).
 */
function isBinaryImage(bytes: Uint8Array): boolean {
  if (bytes.length < 4) return false;
  // JPEG: FF D8 FF
  if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) return true;
  // PNG: 89 50 4E 47
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) return true;
  // TIFF: 49 49 or 4D 4D
  if ((bytes[0] === 0x49 && bytes[1] === 0x49) || (bytes[0] === 0x4D && bytes[1] === 0x4D)) return true;
  // BMP: 42 4D
  if (bytes[0] === 0x42 && bytes[1] === 0x4D) return true;
  // GIF: 47 49 46
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) return true;
  return false;
}

const EXTRACTION_FAILED_MSG = 'LifeOS could not extract readable text from this document. The file may be a scanned image without text, a protected PDF, or an unsupported format. Please try re-uploading or use a different file format.';

export const textractService = {
  async extractText(documentId: string, imageOrPdfBytes: Uint8Array): Promise<NormalizedDocumentText> {
    const isBinary = isBinaryPdf(imageOrPdfBytes) || isBinaryImage(imageOrPdfBytes);

    try {
      let blocks: TextractBlock[] = [];

      // Attempt 1: Analyze Document with FORMS and TABLES features
      try {
        const analyzeCmd = new AnalyzeDocumentCommand({
          Document: { Bytes: imageOrPdfBytes },
          FeatureTypes: [FeatureType.TABLES, FeatureType.FORMS],
        });
        const analyzeRes = await textractClient.send(analyzeCmd);
        if (analyzeRes.Blocks) {
          blocks = analyzeRes.Blocks as TextractBlock[];
        }
      } catch (analyzeErr) {
        console.warn('AnalyzeDocument failed, falling back to DetectDocumentText:', analyzeErr);
        // Fallback to simple DetectDocumentText
        try {
          const detectCmd = new DetectDocumentTextCommand({
            Document: { Bytes: imageOrPdfBytes },
          });
          const detectRes = await textractClient.send(detectCmd);
          if (detectRes.Blocks) {
            blocks = detectRes.Blocks as TextractBlock[];
          }
        } catch (detectErr) {
          console.warn('DetectDocumentText also failed:', detectErr);
        }
      }

      if (blocks.length > 0) {
        const structure = parseTextractResponse(documentId, blocks);

        // SAFETY CHECK: Verify Textract actually extracted meaningful text
        if (structure.rawText && structure.rawText.trim().length > 10) {
          return {
            documentId,
            rawText: structure.rawText,
            formattedText: structure.formattedText,
            pages: structure.pages.map((p) => ({ pageNumber: p.pageNumber, text: p.text })),
            structure,
          };
        }
      }

      // ═══════════════════════════════════════════════════════
      // CRITICAL: NEVER convert binary (PDF/image) bytes to string.
      // If Textract returned no blocks, the extraction failed.
      // Return a clear error message — NOT garbled binary text.
      // ═══════════════════════════════════════════════════════
      if (isBinary) {
        console.error(`[TEXTRACT] Extraction returned no text for binary document ${documentId}. Textract may not support this file.`);
        return {
          documentId,
          rawText: EXTRACTION_FAILED_MSG,
          formattedText: EXTRACTION_FAILED_MSG,
          pages: [{ pageNumber: 1, text: EXTRACTION_FAILED_MSG }],
          extractionFailed: true,
        };
      }

      // Only for genuinely plain-text files (e.g., .txt, .csv) — NOT binary
      const textAttempt = Buffer.from(imageOrPdfBytes).toString('utf-8');
      // Validate it's actually readable text (no binary garbage)
      const printableRatio = textAttempt.split('').filter(c => c.charCodeAt(0) >= 32 && c.charCodeAt(0) <= 126 || c === '\n' || c === '\r' || c === '\t').length / textAttempt.length;
      if (printableRatio > 0.85 && textAttempt.trim().length > 10) {
        const cleanText = textAttempt.trim().substring(0, 10000);
        return {
          documentId,
          rawText: cleanText,
          formattedText: cleanText,
          pages: [{ pageNumber: 1, text: cleanText }],
        };
      }

      // Not readable text either — fail gracefully
      return {
        documentId,
        rawText: EXTRACTION_FAILED_MSG,
        formattedText: EXTRACTION_FAILED_MSG,
        pages: [{ pageNumber: 1, text: EXTRACTION_FAILED_MSG }],
        extractionFailed: true,
      };
    } catch (err) {
      console.error('[TEXTRACT] Critical extraction error for document', documentId, ':', err);

      // ═══════════════════════════════════════════════════════
      // CRITICAL: Do NOT fall back to converting binary to string.
      // Return a clear, human-readable error message.
      // ═══════════════════════════════════════════════════════
      return {
        documentId,
        rawText: EXTRACTION_FAILED_MSG,
        formattedText: EXTRACTION_FAILED_MSG,
        pages: [{ pageNumber: 1, text: EXTRACTION_FAILED_MSG }],
        extractionFailed: true,
      };
    }
  },
};
