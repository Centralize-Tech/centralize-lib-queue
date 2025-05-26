import amqpLib from 'amqplib';

import { AmqpStats } from './amqpStats';
import { IConfig } from './interfaces/IConfig';
import { IConnectionOptions } from './interfaces/IAmqp';
import config from '../config';

export class Amqp {

  public config: any;
  public ampqStats: any;
  public queueLib: any;
  public connection: any;
  public channel: any;
  constructor(inputConfig: IConfig = {}) {
    this.config = { ...config, ...inputConfig };
    this.queueLib = amqpLib;
    const useSSL = this.parseBoolean(this.config.useSSL);

    console.log(`Connecting to ${this.config.host}`);
    this.ampqStats = new AmqpStats({
      username: this.config.consoleUser,
      password: this.config.consolePasswd,
      hostname: useSSL ? this.config.host : `${this.config.host}:${this.config.consolePort}`,
      protocol: useSSL ? 'https' : 'http'
    });
    console.log('Successful connection');
  }

  setConfig(inputConfig: any = {}): void {
    this.config = {...this.config, ...inputConfig};
  }

  private parseBoolean(value: any): boolean {
    return value === true || value?.toString().toLowerCase() === 'true';
  }

  private get connectionOptions(): IConnectionOptions {
    const protocol: string = this.parseBoolean(this.config.useSSL) ? 'amqps' : 'amqp';
    return {
      url: `${protocol}://${this.config.user}:${this.config.passwd}@${this.config.host}:${this.config.port}/${this.config.vhost}`,
      options: { heartbeat: this.config.connectionHeartbeat },
    };
  }

  sendPriorityMessage(message: object | Array<string>, queue: string, priority: number, maxPriority: number = 10, isMassive: boolean = false) {
    return this.sendMessage(message, queue, isMassive, {
      queueOptions: {
        maxPriority,
      },
      messageOptions: {
        priority,
      },
    });
  }

  sendJSONMessage(message: object, queue: string, isMassive: boolean = false) {
    return this.sendMessage(message, queue, isMassive);
  }

  async sendMessage(message: object | Array<string>, queue: string, isMassive: boolean = false, options: any = {}): Promise<string> {
    let connection: any;
    let channel: any;
    const messagesOptions = options.messageOptions || {};
    const queueOptions = options.queueOptions || {};

    try {
      connection = await this.serverConnect();
      console.log('QUEUE Connection established');

      channel = await connection.createChannel();
      console.log('QUEUE Channel connected');

      await channel.assertQueue(queue, queueOptions);
      console.log('QUEUE Queue asserted');

      if (isMassive && Array.isArray(message)) {
        const promises = message.map((messageElement: any) =>
          channel.sendToQueue(queue, Buffer.from(JSON.stringify(messageElement)), messagesOptions)
        );

        await Promise.allSettled(promises);
      } else {
        await channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), messagesOptions);
      }

      return 'Message sent successfully';
    } catch (error: any) {
      console.error('Error send message', error);
      throw error.message;
    } finally {
      if (channel) await channel.close().catch(() => console.warn('Error closing channel'));
      if (connection) await connection.close().catch(() => console.warn('Error closing connection'));
      console.log('QUEUE Closing connection');
    }
  }

  async ack(messageObj: any, channel: any): Promise<any> {
    if (channel) {
      return channel.ack(messageObj);
    }

    return false;
  }

  async consume(queueName: string, _function: any, noAckParam: boolean = true, prefetchParam: number = 0, maxPriority: boolean = false) {
    const connection = await this.serverConnect();
    const channel = await connection.createChannel();
    console.log('QUEUE Channel connected');

    const queueOptions: any = { durable: true };
    if (maxPriority) {
      queueOptions.maxPriority = maxPriority;
    }

    await channel.assertQueue(queueName, queueOptions).then((ok: any) => {
      console.log(`[*] Waiting for messages from ${queueName}. To exit press CTRL+C`);
      return ok;
    });

    if (prefetchParam !== 0 && !noAckParam) {
      await channel.prefetch(prefetchParam);
    }

    this.connection = connection;
    this.channel = channel;
    return channel.consume(queueName, (msg: any): void => {
      console.log(' [x] Received in \'%s\': \'%s\'', queueName, msg.content.toString());
      _function(queueName, msg.content.toString(), channel, msg);
    }, { noAck: noAckParam });
  }

  serverConnect() {
    const { url, options } = this.connectionOptions;
    console.log(`Connecting to ${url}`);
    return this.queueLib.connect(url, options);
  }
}

export default new Amqp();
