import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { DebtsService, DEBTS_QUEUE, MARK_OVERDUE_JOB } from './debts.service';

/**
 * BullMQ worker for daily overdue debt processing (DEBT-04).
 */
@Processor(DEBTS_QUEUE)
export class DebtsProcessor extends WorkerHost {
  private readonly logger = new Logger(DebtsProcessor.name);

  constructor(private readonly debtsService: DebtsService) {
    super();
  }

  async process(job: Job): Promise<void> {
    if (job.name === MARK_OVERDUE_JOB) {
      const count = await this.debtsService.markOverdueDebts();
      this.logger.debug(`Overdue job completed: ${count} debts updated`);
    }
  }
}
