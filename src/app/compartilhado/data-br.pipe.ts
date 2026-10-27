import { Pipe, PipeTransform } from '@angular/core';

import { formatarDataBr } from '../dominio/datas';

@Pipe({ name: 'dataBr' })
export class DataBrPipe implements PipeTransform {
  transform(data: string): string {
    return formatarDataBr(data);
  }
}
