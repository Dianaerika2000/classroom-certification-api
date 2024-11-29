import { Injectable } from '@nestjs/common';
import { IndicatorResult } from 'src/evaluation/interfaces/indicator-result.interface';

@Injectable()
export class GraphicDesignService {

  evaluateContentIndicators(
    content: any,
    indicators: any[],
  ): IndicatorResult[] {
    return indicators.map(indicator => ({
      indicatorId: indicator.id,
      result: 0,
      observation: indicator.name.toLowerCase().includes('no corresponde') ? 'No corresponde' : `El indicador "${indicator.name}" requiere verificación manual`
    }));
  }
}
