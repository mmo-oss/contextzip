export type FieldType = 's' | 't' | `n${number}`;

export interface FieldDef {
  name: string;
  type: FieldType;
}

export interface CompressOptions {
  minEnumFreq?: number;

  minPhraseFreq?: number;
}

export interface CompressionStats {
  originalChars: number;
  compressedChars: number;
  ratio: number;
  savings: string;
}
