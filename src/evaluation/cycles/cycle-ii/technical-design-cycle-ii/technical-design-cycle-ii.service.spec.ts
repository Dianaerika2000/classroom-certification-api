import { Test, TestingModule } from '@nestjs/testing';
import { TechnicalDesignCycleIiService } from './technical-design-cycle-ii.service';

describe('TechnicalDesignCycleIiService', () => {
  let service: TechnicalDesignCycleIiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TechnicalDesignCycleIiService],
    }).compile();

    service = module.get<TechnicalDesignCycleIiService>(TechnicalDesignCycleIiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
