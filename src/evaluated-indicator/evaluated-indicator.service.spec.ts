import { Test, TestingModule } from '@nestjs/testing';
import { EvaluatedIndicatorService } from './evaluated-indicator.service';

describe('EvaluatedIndicatorService', () => {
  let service: EvaluatedIndicatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EvaluatedIndicatorService],
    }).compile();

    service = module.get<EvaluatedIndicatorService>(EvaluatedIndicatorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
