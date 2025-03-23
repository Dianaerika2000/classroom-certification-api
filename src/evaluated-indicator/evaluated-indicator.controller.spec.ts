import { Test, TestingModule } from '@nestjs/testing';
import { EvaluatedIndicatorController } from './evaluated-indicator.controller';

describe('EvaluatedIndicatorController', () => {
  let controller: EvaluatedIndicatorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EvaluatedIndicatorController],
    }).compile();

    controller = module.get<EvaluatedIndicatorController>(EvaluatedIndicatorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
