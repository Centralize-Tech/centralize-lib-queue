import amqpLib from 'amqplib';

import { AmqpStats } from './amqpStats';
import { IConfig } from './interfaces/IConfig';
import { IConnectionOptions } from './interfaces/IAmqp';
import config from '../config';

export class Amqp {

  config: any;
  ampqStats: AmqpStats;
  queueLib: any;
  connection: any;
  channel: any;
  constructor(inputConfig: IConfig = {}) {
    this.config = { ...config, ...inputConfig };
    this.queueLib = amqpLib;

    const useSSL = ['true', 'TRUE'].includes(this.config.useSSL) || this.config.useSSL === true;
    console.log(`Connecting to ${this.config.host}`);
    this.ampqStats = new AmqpStats({
      username: this.config.consoleUser,
      password: this.config.consolePasswd,
      hostname: useSSL ? this.config.host : `${this.config.host}:${this.config.consolePort}`,
      protocol: useSSL ? 'https' : 'http',
    });
    console.log('Successful connection');
  }

  setConfig(inputConfig: any = {}): void {
    this.config = {...this.config, ...inputConfig};
  }

  setQueueLib(instance: any) {
    this.queueLib = instance;
  }

  sendPriorityMessage(message: object | Array<string>, queue: string, priority: number, maxPriority: number = 10, isMassive: boolean = false) {
    return this.sendMessage(message, queue, 'json', isMassive, {
      queueOptions: {
        maxPriority,
      },
      messageOptions: {
        priority,
      },
    });
  }
  
  sendJSONMessage(message: object, queue: string, isMassive: boolean = false) {
    return this.sendMessage(message, queue, 'json', isMassive);
  }

  async sendMessage(message: object | Array<string>, queue: string, type: string ,isMassive: boolean = false, options: any = {}): Promise<string> {
    const messagesOptions = options.messageOptions || {};
    const queueOptions = options.queueOptions || {};

    try {
      this.connection = await this.serverConnect();
      console.log('QUEUE Connection established');

      this.channel = await this.connection.createChannel();
      console.log('QUEUE Channel connected');

      await this.channel.assertQueue(queue, queueOptions);
      console.log('QUEUE Queue asserted');

      if (isMassive && Array.isArray(message)) {
        const promises = message.map((messageElement: any) =>
          this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(messageElement)), messagesOptions)
        );

        await Promise.allSettled(promises);
      } else {
        await this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), messagesOptions);
      }

      return 'Message sent successfully';
    } catch (error: any) {
      console.error('Error send message', error);
      throw error.message;
    } finally {
      await this.channel.close().catch(() => console.warn('Error closing channel'));
      await this.connection.close().catch(() => console.warn('Error closing connection'));
      console.log('QUEUE Closing connection');
    }
  }

  async purgePriorityQueue(queue: string, maxPriority: number = 10) {
    return this.purgeQueue(queue, {
      queueOptions: {
        maxPriority,
      },
    });
  }

  async purgeQueue(queue: string, options: any = {}) {
    const queueOptions = options.queueOptions || {};

    this.connection = await this.serverConnect();
    console.log('QUEUE Connection established');
    this.channel = await this.connection.createChannel();
    try {
      console.log('QUEUE Channel connected');
      await this.channel.assertQueue(queue, queueOptions);
      console.log('QUEUE Queue asserted');

      const purgeResponse = await this.channel.purgeQueue(queue);
      console.log(`QUEUE ${queue} purge with ${purgeResponse.messageCount || 0}  removes`);
    } catch (error: any) {
      console.error('Error purge queue', error);
      throw error.message;
    } finally {
      await this.channel.close().catch(() => console.warn('Error closing channel'));
      await this.connection.close().catch(() => console.warn('Error closing connection'));
      console.log('QUEUE Closing connection');
    }
  }

  async getQueueMessageCount(queue: string, queueOptions: any = {}) {
    this.connection = await this.serverConnect();
    this.channel = await this.connection.createChannel();
    try {
      const queueData = await this.channel.assertQueue(queue, queueOptions);
      await this.channel.close().catch(() => console.warn('Error closing channel'));
      await this.connection.close().catch(() => console.warn('Error closing connection'));
      return queueData.messageCount || 0;
    } catch (error: any) {
      console.error('Error get queue message count', error);
      throw error.message;
    }
  }

  async getQueuePriorityMessageCount(queue: string, maxQueuePriority: number = 10) {
    return this.getQueueMessageCount(queue, { maxPriority: maxQueuePriority });
  }

  connectionOptions(): IConnectionOptions {
    return {
      url: `amqps://${this.config.user}:${this.config.passwd}@${this.config.host}:${this.config.port}/${this.config.vhost}`,
      options: { heartbeat: this.config.connectionHeartbeat },
    };
  }

  async consume(queueName: string, _function: any, noAckParam: boolean = true, prefetchParam: number = 0, maxPriority: boolean = false) {
    this.connection = await this.serverConnect();
    this.channel = await this.connection.createChannel();
    console.log('QUEUE Channel connected');

    const queueOptions: any = { durable: true };
    if (maxPriority) {
      queueOptions.maxPriority = maxPriority;
    }

    await this.channel.assertQueue(queueName, queueOptions).then((ok: any) => {
      console.log(`[*] Waiting for messages from ${queueName}. To exit press CTRL+C`);
      return ok;
    });

    if (prefetchParam !== 0 && !noAckParam) {
      await this.channel.prefetch(prefetchParam);
    }

    return this.channel.consume(queueName, (msg: any): void => {
      console.log(' [x] Received in \'%s\': \'%s\'', queueName, msg.content.toString());
      _function(queueName, msg.content.toString(), this.channel, msg);
    }, { noAck: noAckParam });
  }

  async ack(messageObj: any, channel: any): Promise<any> {
    if (channel) {
      return channel.ack(messageObj);
    }

    return false;
  }

  async serverConnect() {
    const protocol = this.config.useSSL === true || ['true', 'TRUE'].includes(this.config.useSSL) ? 'amqps' : 'amqp';
    const connectionPath = `${protocol}://${this.config.user}:${this.config.passwd}@${this.config.host}:${this.config.port}/${this.config.vhost}`;
    console.log(`Connecting to ${connectionPath}`);

    return this.queueLib.connect(connectionPath, { heartbeat: this.config.connectionHeartbeat })
      .then((connection: any) => {
        console.log('QUEUE Connection established');
        return connection;
      });
  }
}
