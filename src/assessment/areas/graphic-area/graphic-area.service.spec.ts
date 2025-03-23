import { Test, TestingModule } from '@nestjs/testing';
import { GraphicAreaService } from './graphic-area.service';

describe('GraphicAreaService', () => {
  let service: GraphicAreaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GraphicAreaService],
    }).compile();

    service = module.get<GraphicAreaService>(GraphicAreaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
