export interface TextractBlock {
  BlockType?: string;
  Confidence?: number;
  Text?: string;
  TextType?: string;
  RowIndex?: number;
  ColumnIndex?: number;
  RowSpan?: number;
  ColumnSpan?: number;
  Id?: string;
  Relationships?: Array<{
    Type?: string;
    Ids?: string[];
  }>;
  EntityTypes?: string[];
  SelectionStatus?: string;
  Page?: number;
  Geometry?: any;
}

export interface ParsedTable {
  pageNumber: number;
  rowCount: number;
  columnCount: number;
  rows: string[][];
}

export interface ParsedKeyValue {
  pageNumber: number;
  key: string;
  value: string;
  confidence?: number;
}

export interface ParsedSection {
  pageNumber: number;
  title: string;
  content: string[];
}

export interface ParsedPage {
  pageNumber: number;
  text: string;
  sections: ParsedSection[];
  tables: ParsedTable[];
  keyValues: ParsedKeyValue[];
}

export interface NormalizedDocumentStructure {
  documentId: string;
  rawText: string;
  formattedText: string;
  pageCount: number;
  pages: ParsedPage[];
  tables: ParsedTable[];
  keyValues: ParsedKeyValue[];
}

export function parseTextractResponse(documentId: string, blocks: TextractBlock[] = []): NormalizedDocumentStructure {
  const blockMap = new Map<string, TextractBlock>();
  for (const block of blocks) {
    if (block.Id) {
      blockMap.set(block.Id, block);
    }
  }

  // 1. Group text by page
  const pageMap = new Map<number, TextractBlock[]>();
  let maxPage = 1;

  for (const block of blocks) {
    const pageNum = block.Page || 1;
    if (pageNum > maxPage) maxPage = pageNum;

    const pageBlocks = pageMap.get(pageNum) || [];
    pageBlocks.push(block);
    pageMap.set(pageNum, pageBlocks);
  }

  // Helper: Get text from child relationship IDs
  function getChildText(block: TextractBlock, targetTypes?: string[]): string {
    if (!block.Relationships) return '';
    const textParts: string[] = [];

    for (const rel of block.Relationships) {
      if (rel.Type === 'CHILD' && rel.Ids) {
        for (const childId of rel.Ids) {
          const childBlock = blockMap.get(childId);
          if (childBlock) {
            if (!targetTypes || (childBlock.BlockType && targetTypes.includes(childBlock.BlockType))) {
              if (childBlock.Text) {
                textParts.push(childBlock.Text);
              } else if (childBlock.BlockType === 'SELECTION_ELEMENT') {
                textParts.push(childBlock.SelectionStatus === 'SELECTED' ? '[X]' : '[ ]');
              }
            }
          }
        }
      }
    }

    return textParts.join(' ');
  }

  // Helper: Extract Key-Value Pairs
  function extractKeyValuePairsForPage(pageBlocks: TextractBlock[], pageNum: number): ParsedKeyValue[] {
    const keyValues: ParsedKeyValue[] = [];

    const keyBlocks = pageBlocks.filter(
      (b) => b.BlockType === 'KEY_VALUE_SET' && b.EntityTypes && b.EntityTypes.includes('KEY')
    );

    for (const keyBlock of keyBlocks) {
      const keyText = getChildText(keyBlock, ['WORD', 'SELECTION_ELEMENT']);
      let valText = '';

      if (keyBlock.Relationships) {
        for (const rel of keyBlock.Relationships) {
          if (rel.Type === 'VALUE' && rel.Ids) {
            for (const valId of rel.Ids) {
              const valBlock = blockMap.get(valId);
              if (valBlock) {
                valText = getChildText(valBlock, ['WORD', 'SELECTION_ELEMENT']);
              }
            }
          }
        }
      }

      if (keyText.trim()) {
        keyValues.push({
          pageNumber: pageNum,
          key: keyText.trim(),
          value: valText.trim() || 'Not specified',
          confidence: keyBlock.Confidence,
        });
      }
    }

    return keyValues;
  }

  // Helper: Extract Tables
  function extractTablesForPage(pageBlocks: TextractBlock[], pageNum: number): ParsedTable[] {
    const tables: ParsedTable[] = [];
    const tableBlocks = pageBlocks.filter((b) => b.BlockType === 'TABLE');

    for (const tableBlock of tableBlocks) {
      const cellMap = new Map<string, string>();
      let maxRow = 0;
      let maxCol = 0;

      if (tableBlock.Relationships) {
        for (const rel of tableBlock.Relationships) {
          if (rel.Type === 'CHILD' && rel.Ids) {
            for (const childId of rel.Ids) {
              const cellBlock = blockMap.get(childId);
              if (cellBlock && cellBlock.BlockType === 'CELL') {
                const row = cellBlock.RowIndex || 1;
                const col = cellBlock.ColumnIndex || 1;
                if (row > maxRow) maxRow = row;
                if (col > maxCol) maxCol = col;

                const cellText = getChildText(cellBlock, ['WORD', 'SELECTION_ELEMENT']);
                cellMap.set(`${row}:${col}`, cellText.trim());
              }
            }
          }
        }
      }

      if (maxRow > 0 && maxCol > 0) {
        const rows: string[][] = [];
        for (let r = 1; r <= maxRow; r++) {
          const rowText: string[] = [];
          for (let c = 1; c <= maxCol; c++) {
            rowText.push(cellMap.get(`${r}:${c}`) || '');
          }
          rows.push(rowText);
        }

        tables.push({
          pageNumber: pageNum,
          rowCount: maxRow,
          columnCount: maxCol,
          rows,
        });
      }
    }

    return tables;
  }

  // Process Page by Page
  const pages: ParsedPage[] = [];
  const allTables: ParsedTable[] = [];
  const allKeyValues: ParsedKeyValue[] = [];
  const fullTextLines: string[] = [];

  for (let p = 1; p <= maxPage; p++) {
    const pageBlocks = pageMap.get(p) || [];

    // Extract lines for text
    const lineBlocks = pageBlocks.filter((b) => b.BlockType === 'LINE' && b.Text);
    const lineTexts = lineBlocks.map((b) => b.Text as string);
    const pageText = lineTexts.join('\n');

    if (lineTexts.length > 0) {
      fullTextLines.push(`--- PAGE ${p} ---`);
      fullTextLines.push(...lineTexts);
    }

    // Extract Key-Values & Tables
    const keyValues = extractKeyValuePairsForPage(pageBlocks, p);
    const tables = extractTablesForPage(pageBlocks, p);

    allKeyValues.push(...keyValues);
    allTables.push(...tables);

    // Extract Sections based on line patterns
    const sections: ParsedSection[] = [];
    let currentSection: ParsedSection = { pageNumber: p, title: 'Main Content', content: [] };

    for (const line of lineTexts) {
      const trimmed = line.trim();
      if (
        (trimmed.length > 3 && trimmed.length < 60 && trimmed === trimmed.toUpperCase() && /[A-Z]/.test(trimmed)) ||
        (trimmed.endsWith(':') && trimmed.length < 50)
      ) {
        if (currentSection.content.length > 0) {
          sections.push(currentSection);
        }
        currentSection = { pageNumber: p, title: trimmed.replace(/:$/, ''), content: [] };
      } else {
        currentSection.content.push(line);
      }
    }
    if (currentSection.content.length > 0) {
      sections.push(currentSection);
    }

    pages.push({
      pageNumber: p,
      text: pageText,
      sections,
      tables,
      keyValues,
    });
  }

  const rawText = fullTextLines.join('\n').trim();

  // Create clean formatted text for Bedrock consumption
  const formattedParts: string[] = [];
  formattedParts.push(`DOCUMENT CONTENT SUMMARY:`);

  if (allKeyValues.length > 0) {
    formattedParts.push(`\nEXTRACTED FORM FIELDS / KEY-VALUE PAIRS:`);
    for (const kv of allKeyValues) {
      formattedParts.push(`- ${kv.key}: ${kv.value} (Page ${kv.pageNumber})`);
    }
  }

  if (allTables.length > 0) {
    formattedParts.push(`\nEXTRACTED TABLES:`);
    for (const t of allTables) {
      formattedParts.push(`[Table Page ${t.pageNumber} (${t.rowCount} rows x ${t.columnCount} cols)]`);
      for (const row of t.rows) {
        formattedParts.push(`  | ${row.join(' | ')} |`);
      }
    }
  }

  formattedParts.push(`\nFULL DOCUMENT TEXT BY PAGE:`);
  formattedParts.push(rawText);

  const formattedText = formattedParts.join('\n');

  return {
    documentId,
    rawText,
    formattedText,
    pageCount: pages.length,
    pages,
    tables: allTables,
    keyValues: allKeyValues,
  };
}

export function extractPlainText(blocks: TextractBlock[] = []): string {
  const lineBlocks = blocks.filter((b) => b.BlockType === 'LINE' && b.Text);
  return lineBlocks.map((b) => b.Text).join('\n');
}

export function extractTables(blocks: TextractBlock[] = []): ParsedTable[] {
  const parsed = parseTextractResponse('temp', blocks);
  return parsed.tables;
}

export function extractKeyValuePairs(blocks: TextractBlock[] = []): ParsedKeyValue[] {
  const parsed = parseTextractResponse('temp', blocks);
  return parsed.keyValues;
}

export function extractSections(blocks: TextractBlock[] = []): ParsedSection[] {
  const parsed = parseTextractResponse('temp', blocks);
  return parsed.pages.flatMap((p) => p.sections);
}

export function extractPageMetadata(blocks: TextractBlock[] = []): { pageCount: number } {
  let maxPage = 1;
  for (const b of blocks) {
    if (b.Page && b.Page > maxPage) maxPage = b.Page;
  }
  return { pageCount: maxPage };
}
