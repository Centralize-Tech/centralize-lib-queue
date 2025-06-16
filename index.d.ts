import { IConfig } from './src/interfaces/IConfig';

export class Amqp {
  constructor(config?: IConfig)
  setConfig(config: IConfig): void
  sendPriorityMessage(message: any, queue: string, priority: number, maxPriority?: number, isMassive?: boolean): Promise<any>
  sendJSONMessage(message: any, queue: string, isMassive?: boolean): Promise<any>
  consume(queueName:string, _function: any, noAckParam?: boolean, prefetchParam?: number, maxPriority?: Number): Promise<any>
  ack(messageObj: any, channel: any): Promise<any>
  purgeQueue(queue: string, options?: any): Promise<any>
  purgePriorityQueue(queue: string, maxPriority?: number): Promise<any>
  getQueueMessageCount(queue: string, queueOptions?: any): Promise<number>
  getQueuePriorityMessageCount(queue: string, maxQueuePriority?: number): Promise<number>
}

// Exportar funciones individuales
export function sendJSONMessage(message: any, queue: string, isMassive?: boolean): Promise<any>;
export function sendPriorityMessage(message: any, queue: string, priority: number, maxPriority?: number, isMassive?: boolean): Promise<any>;
export function consume(queueName: string, _function: any, noAckParam?: boolean, prefetchParam?: number, maxPriority?: boolean): Promise<any>;
export function ack(messageObj: any, channel: any): Promise<any>;
export function purgeQueue(queue: string, options?: any): Promise<any>;
export function purgePriorityQueue(queue: string, maxPriority?: number): Promise<any>;
export function getQueueMessageCount(queue: string, queueOptions?: any): Promise<number>;
export function getQueuePriorityMessageCount(queue: string, maxQueuePriority?: number): Promise<number>;

// Exportar la instancia por defecto
declare const defaultExport: Amqp;
export default defaultExport;
