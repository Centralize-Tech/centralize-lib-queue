import amqpLib from 'amqplib';
import { AmqpStats } from './amqpStats';
import { IConfig } from './interfaces/IConfig';
export declare class Amqp {
    config: any;
    ampqStats: AmqpStats;
    queueLib: typeof amqpLib;
    connection: any;
    channel: any;
    constructor(inputConfig?: IConfig);
    setConfig(inputConfig?: any): void;
    private parseBoolean;
    private get connectionOptions();
    sendPriorityMessage(message: object | Array<string>, queue: string, priority: number, maxPriority?: number, isMassive?: boolean): Promise<string>;
    sendJSONMessage(message: object, queue: string, isMassive?: boolean): Promise<string>;
    sendMessage(message: object | Array<string>, queue: string, isMassive?: boolean, options?: any): Promise<string>;
    ack(messageObj: any, channel: any): Promise<any>;
    consume(queueName: string, _function: any, noAckParam?: boolean, prefetchParam?: number, maxPriority?: boolean): Promise<amqpLib.Replies.Consume>;
    serverConnect(): Promise<amqpLib.ChannelModel>;
}
//# sourceMappingURL=amqp.d.ts.map