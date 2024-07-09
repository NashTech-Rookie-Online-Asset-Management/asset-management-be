import { Column, Workbook } from 'exceljs';
import { FileFormat } from 'src/common/constants/file-format';
import { Injectable } from '@nestjs/common';

export class GenerateFileInput {
  data: any[];
  format: FileFormat;
  columns: Partial<Column>[];
  name: string;
}

@Injectable()
export class FileService {
  async generate(input: GenerateFileInput): Promise<unknown> {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet(input.name);
    worksheet.columns = input.columns;
    input.data.forEach((row) => {
      worksheet.addRow(row);
    });
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }
}
