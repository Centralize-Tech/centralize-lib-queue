import axios from 'axios';

import { IAmqpStats } from './interfaces/IAmqpStats';

export class AmqpStats {

  hostname: any;
  username: any;
  password: any;
  protocol: any;
  requestInstance: any;
  constructor(options: IAmqpStats = {}) {
    this.hostname = options.hostname || 'localhost:55672';
    this.username = options.username || 'guest';
    this.password = options.password || 'guest';
    this.protocol = options.protocol || 'http';
    this.requestInstance = axios;
  }

  sendRequest(endpoint: string, params: object = {}, method: string = 'GET') {
    const url = this.getRequestPath(endpoint);
    console.log(url);
    const requestOptions = {
      url,
      method,
      auth: {
        username: this.username,
        password: this.password,
      },
      params,
    };

    return this.requestInstance(requestOptions).then((response: any) => response.data).catch(console.error);
  }

  getRequestPath(endpoint: string): string {
    return `${this.protocol}://${this.hostname}/api/${endpoint}`;
  }

  queues() {
    return this.sendRequest('queues');
  }
}
