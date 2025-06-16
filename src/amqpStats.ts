import axios from 'axios';

import { IAmqpStats } from './interfaces/IAmqpStats';

export class AmqpStats {

  private static hostname: any;
  private static username: any;
  private static password: any;
  private static protocol: any;
  private static requestInstance: any;
  constructor(options: IAmqpStats = {}) {
    AmqpStats.hostname = options.hostname || 'localhost:55672';
    AmqpStats.username = options.username || 'guest';
    AmqpStats.password = options.password || 'guest';
    AmqpStats.protocol = options.protocol || 'http';
    AmqpStats.requestInstance = axios;
  }

  static sendRequest(endpoint: string, params: object = {}, method: string = 'GET') {
    const url = AmqpStats.getRequestPath(endpoint);
    console.log(url);
    const requestOptions = {
      url,
      method,
      auth: {
        username: AmqpStats.username,
        password: AmqpStats.password,
      },
      params,
    };

    return AmqpStats.requestInstance(requestOptions).then((response: any) => response.data).catch(console.error);
  }

  static getRequestPath(endpoint: string): string {
    return `${AmqpStats.protocol}://${AmqpStats.hostname}/api/${endpoint}`;
  }

  static queues() {
    return AmqpStats.sendRequest('queues');
  }
}
