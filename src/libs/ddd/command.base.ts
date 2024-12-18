import { RequestContextService } from '@src/libs/application/context/app-request.context';
import { HttpInternalServerErrorException } from '@src/libs/exceptions/server-errors/exceptions/http-internal-server-error.exception';
import { COMMON_ERROR_CODE } from '@src/libs/exceptions/types/errors/common/common-error-code.constant';
import { Guard } from '@src/libs/guard';
import { getTsid } from 'tsid-ts';

export type CommandProps<T> = Omit<T, 'id' | 'metadata'> & Partial<Command>;

type CommandMetadata = {
  /** ID for correlation purposes (for commands that
   *  arrive from other microservices,logs correlation, etc). */
  readonly correlationId: string;

  /**
   * Causation id to reconstruct execution order if needed
   */
  readonly causationId?: string;

  /**
   * ID of a user who invoked the command. Can be useful for
   * logging and tracking execution of commands and events
   */
  readonly userId?: bigint;

  /**
   * Time when the command occurred. Mostly for tracing purposes
   */
  readonly timestamp: number;
};

export class Command {
  /**
   * Command id, in case if we want to save it
   * for auditing purposes and create a correlation/causation chain
   */
  readonly id: bigint;

  readonly metadata: CommandMetadata;

  constructor(props: CommandProps<unknown>) {
    if (Guard.isEmpty(props)) {
      throw new HttpInternalServerErrorException({
        ctx: 'Command props should not be empty',
        code: COMMON_ERROR_CODE.SERVER_ERROR,
      });
    }
    const ctx = RequestContextService.getContext();
    this.id = props.id || getTsid().toBigInt();
    this.metadata = {
      correlationId: props?.metadata?.correlationId || ctx.requestId,
      causationId: props?.metadata?.causationId,
      timestamp: props?.metadata?.timestamp || Date.now(),
      userId: props?.metadata?.userId,
    };
  }
}
