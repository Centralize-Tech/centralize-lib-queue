import { IAmqpStats } from './interfaces/IAmqpStats';
export declare class AmqpStats {
    hostname: any;
    username: any;
    password: any;
    protocol: any;
    requestInstance: any;
    constructor(options?: IAmqpStats);
    sendRequest(endpoint: string, params?: object, method?: string): any;
    getRequestPath(endpoint: string): string;
    queues(): any;
}
//# sourceMappingURL=amqpStats.d.ts.map