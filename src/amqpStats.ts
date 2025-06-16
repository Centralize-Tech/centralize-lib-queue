import axios from 'axios';

import { IAmqpStats } from './interfaces/IAmqpStats';

export class AmqpStats {

  public hostname: any;
  public username: any;
  public password: any;
  public protocol: any;
  public requestInstance: any;
  constructor(options: IAmqpStats = {}) {
    this.hostname = options.hostname || 'localhost:55672';
    this.username = options.username || 'guest';
    this.password = options.password || 'guest';
    this.protocol = options.protocol || 'http';
    this.requestInstance = axios;
  }

  setRequestInstance(instance: any) {
    this.requestInstance = instance;
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
