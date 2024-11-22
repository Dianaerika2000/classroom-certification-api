import { Test, TestingModule } from '@nestjs/testing';
import { Cycle3TechnicalDesignService } from './cycle-3-technical-design.service';

describe('TechnicalDesignService', () => {
  let service: Cycle3TechnicalDesignService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Cycle3TechnicalDesignService],
    }).compile();

    service = module.get<Cycle3TechnicalDesignService>(Cycle3TechnicalDesignService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
