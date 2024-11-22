import { Test, TestingModule } from '@nestjs/testing';
import { IndicatorEvaluationService } from './indicator-evaluation.service';

describe('IndicatorEvaluationServiceService', () => {
  let service: IndicatorEvaluationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IndicatorEvaluationService],
    }).compile();

    service = module.get<IndicatorEvaluationService>(IndicatorEvaluationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
