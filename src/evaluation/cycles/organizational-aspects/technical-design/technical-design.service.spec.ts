import { Test, TestingModule } from '@nestjs/testing';
import { TechnicalDesignService } from './technical-design.service';

describe('TechnicalDesignService', () => {
  let service: TechnicalDesignService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TechnicalDesignService],
    }).compile();

    service = module.get<TechnicalDesignService>(TechnicalDesignService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
