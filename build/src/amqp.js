"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Amqp = void 0;
const amqplib_1 = __importDefault(require("amqplib"));
const amqpStats_1 = require("./amqpStats");
const config_1 = __importDefault(require("../config"));
class Amqp {
    constructor(inputConfig = {}) {
        this.config = { ...config_1.default, ...inputConfig };
        this.queueLib = amqplib_1.default;
        const useSSL = this.parseBoolean(this.config.useSSL);
        console.log(`Connecting to ${this.config.host}`);
        this.ampqStats = new amqpStats_1.AmqpStats({
            username: this.config.consoleUser,
            password: this.config.consolePasswd,
            hostname: useSSL ? this.config.host : `${this.config.host}:${this.config.consolePort}`,
            protocol: useSSL ? 'https' : 'http'
        });
        console.log('Successful connection');
    }
    setConfig(inputConfig = {}) {
        this.config = { ...this.config, ...inputConfig };
    }
    parseBoolean(value) {
        return value === true || value?.toString().toLowerCase() === 'true';
    }
    get connectionOptions() {
        const protocol = this.parseBoolean(this.config.useSSL) ? 'amqps' : 'amqp';
        return {
            url: `${protocol}://${this.config.user}:${this.config.passwd}@${this.config.host}:${this.config.port}/${this.config.vhost}`,
            options: { heartbeat: this.config.connectionHeartbeat },
        };
    }
    sendPriorityMessage(message, queue, priority, maxPriority = 10, isMassive = false) {
        return this.sendMessage(message, queue, isMassive, {
            queueOptions: {
                maxPriority,
            },
            messageOptions: {
                priority,
            },
        });
    }
    sendJSONMessage(message, queue, isMassive = false) {
        return this.sendMessage(message, queue, isMassive);
    }
    async sendMessage(message, queue, isMassive = false, options = {}) {
        let connection;
        let channel;
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
                const promises = message.map((messageElement) => channel.sendToQueue(queue, Buffer.from(JSON.stringify(messageElement)), messagesOptions));
                await Promise.allSettled(promises);
            }
            else {
                await channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), messagesOptions);
            }
            return 'Message sent successfully';
        }
        catch (error) {
            console.error('Error send message', error);
            throw error.message;
        }
        finally {
            if (channel)
                await channel.close().catch(() => console.warn('Error closing channel'));
            if (connection)
                await connection.close().catch(() => console.warn('Error closing connection'));
            console.log('QUEUE Closing connection');
        }
    }
    async ack(messageObj, channel) {
        if (channel) {
            return channel.ack(messageObj);
        }
        return false;
    }
    async consume(queueName, _function, noAckParam = true, prefetchParam = 0, maxPriority = false) {
        const connection = await this.serverConnect();
        const channel = await connection.createChannel();
        console.log('QUEUE Channel connected');
        const queueOptions = { durable: true };
        if (maxPriority) {
            queueOptions.maxPriority = maxPriority;
        }
        await channel.assertQueue(queueName, queueOptions).then((ok) => {
            console.log(`[*] Waiting for messages from ${queueName}. To exit press CTRL+C`);
            return ok;
        });
        if (prefetchParam !== 0 && !noAckParam) {
            await channel.prefetch(prefetchParam);
        }
        this.connection = connection;
        this.channel = channel;
        return channel.consume(queueName, (msg) => {
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
exports.Amqp = Amqp;
