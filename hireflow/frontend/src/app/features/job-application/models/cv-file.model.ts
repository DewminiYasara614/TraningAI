export type CvFileType = 'pdf' | 'doc' | 'docx';

/** CV details only — the file itself is never uploaded or stored (spec FR-013, non-goal). */
export interface CvFile {
  name: string;
  sizeBytes: number;
  type: CvFileType;
}
