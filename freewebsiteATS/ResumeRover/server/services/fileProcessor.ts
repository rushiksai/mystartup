import * as fs from 'fs';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);

export class FileProcessor {
  static async extractText(filePath: string, mimeType: string): Promise<string> {
    try {
      if (mimeType === 'application/pdf') {
        return await this.extractFromPDF(filePath);
      } else if (
        mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        mimeType === 'application/msword'
      ) {
        return await this.extractFromWord(filePath);
      } else {
        throw new Error('Unsupported file type. Please upload PDF or Word documents.');
      }
    } catch (error) {
      throw new Error(`Failed to extract text from file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private static async extractFromPDF(filePath: string): Promise<string> {
    const buffer = await readFile(filePath);
    const data = await pdf(buffer);
    return data.text;
  }

  private static async extractFromWord(filePath: string): Promise<string> {
    const buffer = await readFile(filePath);
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  static validateFile(file: any): { isValid: boolean; error?: string } {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];
    
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.mimetype)) {
      return {
        isValid: false,
        error: 'Invalid file type. Please upload PDF, DOC, or DOCX files only.'
      };
    }

    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'File size exceeds 5MB limit.'
      };
    }

    return { isValid: true };
  }
}
