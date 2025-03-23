import { Test, TestingModule } from '@nestjs/testing';
import { GraphicDesignService } from './graphic-design.service';

describe('GraphicDesignService', () => {
  let service: GraphicDesignService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GraphicDesignService],
    }).compile();

    service = module.get<GraphicDesignService>(GraphicDesignService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
