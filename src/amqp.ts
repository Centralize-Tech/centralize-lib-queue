import amqpLib from 'amqplib';

import { AmqpStats } from './amqpStats';
import { IConfig } from './interfaces/IConfig';
import { IConnectionOptions } from './interfaces/IAmqp';
import config from '../config';

export class Amqp {

  private static config: any;
  private static ampqStats: AmqpStats;
  private static queueLib: typeof amqpLib;
  private static connection: any;
  private static channel: any;
  constructor(inputConfig: IConfig = {}) {
    Amqp.config = { ...config, ...inputConfig };
    Amqp.queueLib = amqpLib;
    const useSSL = Amqp.parseBoolean(Amqp.config.useSSL);

    console.log(`Connecting to ${Amqp.config.host}`);
    Amqp.ampqStats = new AmqpStats({
      username: Amqp.config.consoleUser,
      password: Amqp.config.consolePasswd,
      hostname: useSSL ? Amqp.config.host : `${Amqp.config.host}:${Amqp.config.consolePort}`,
      protocol: useSSL ? 'https' : 'http'
    });
    console.log('Successful connection');
  }

  setConfig(inputConfig: any = {}): void {
    Amqp.config = {...Amqp.config, ...inputConfig};
  }

  private static parseBoolean(value: any): boolean {
    return value === true || value?.toString().toLowerCase() === 'true';
  }

  private static get connectionOptions(): IConnectionOptions {
    const protocol: string = Amqp.parseBoolean(Amqp.config.useSSL) ? 'amqps' : 'amqp';
    return {
      url: `${protocol}://${Amqp.config.user}:${Amqp.config.passwd}@${Amqp.config.host}:${Amqp.config.port}/${Amqp.config.vhost}`,
      options: { heartbeat: Amqp.config.connectionHeartbeat },
    };
  }

  static sendPriorityMessage(message: object | Array<string>, queue: string, priority: number, maxPriority: number = 10, isMassive: boolean = false) {
    return this.sendMessage(message, queue, isMassive, {
      queueOptions: {
        maxPriority,
      },
      messageOptions: {
        priority,
      },
    });
  }

  static sendJSONMessage(message: object, queue: string, isMassive: boolean = false) {
    return this.sendMessage(message, queue, isMassive);
  }

  static async sendMessage(message: object | Array<string>, queue: string, isMassive: boolean = false, options: any = {}): Promise<string> {
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

  static async ack(messageObj: any, channel: any): Promise<any> {
    if (channel) {
      return channel.ack(messageObj);
    }

    return false;
  }

  static async consume(queueName: string, _function: any, noAckParam: boolean = true, prefetchParam: number = 0, maxPriority: boolean = false) {
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

    Amqp.connection = connection;
    Amqp.channel = channel;
    return channel.consume(queueName, (msg: any): void => {
      console.log(' [x] Received in \'%s\': \'%s\'', queueName, msg.content.toString());
      _function(queueName, msg.content.toString(), channel, msg);
    }, { noAck: noAckParam });
  }

  static serverConnect() {
    const { url, options } = Amqp.connectionOptions;
    console.log(`Connecting to ${url}`);
    return Amqp.queueLib.connect(url, options);
  }
}
