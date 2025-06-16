import { IConfig } from './src/interfaces/IConfig';

export class Amqp {
  constructor(config?: IConfig)
  setConfig(config: IConfig): void
  sendPriorityMessage(message: any, queue: string, priority: number, maxPriority?: number, isMassive?: boolean): Promise<any>
  sendJSONMessage(message: any, queue: string, isMassive?: boolean): Promise<any>
  consume(queueName:string, _function: any, noAckParam?: boolean, prefetchParam?: number, maxPriority?: Number): Promise<any>
  ack(messageObj: any, channel: any): Promise<any>
}
