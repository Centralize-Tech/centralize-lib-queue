"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const amqplib_1 = __importDefault(require("amqplib"));
const amqpStats_1 = require("./amqpStats");
const config_1 = __importDefault(require("../config"));
class Amqp {
    constructor(inputConfig = {}) {
        this.config = Object.assign(Object.assign({}, config_1.default), inputConfig);
        this.queueLib = amqplib_1.default;
        const useSSL = ['true', 'TRUE'].includes(this.config.useSSL) || this.config.useSSL === true;
        console.log(`Connecting to ${this.config.host}`);
        this.ampqStats = new amqpStats_1.AmqpStats({
            username: this.config.consoleUser,
            password: this.config.consolePasswd,
            hostname: useSSL ? this.config.host : `${this.config.host}:${this.config.consolePort}`,
            protocol: useSSL ? 'https' : 'http',
        });
        console.log('Successful connection');
    }
    setConfig(inputConfig = {}) {
        this.config = Object.assign(Object.assign({}, this.config), inputConfig);
    }
    setQueueLib(instance) {
        this.queueLib = instance;
    }
    sendPriorityMessage(message, queue, priority, maxPriority = 10, isMassive = false) {
        return this.sendMessage(message, queue, 'json', isMassive, {
            queueOptions: {
                maxPriority,
            },
            messageOptions: {
                priority,
            },
        });
    }
    sendJSONMessage(message, queue, isMassive = false) {
        return this.sendMessage(message, queue, 'json', isMassive);
    }
    sendMessage(message_1, queue_1, type_1) {
        return __awaiter(this, arguments, void 0, function* (message, queue, type, isMassive = false, options = {}) {
            const messagesOptions = options.messageOptions || {};
            const queueOptions = options.queueOptions || {};
            try {
                this.connection = yield this.serverConnect();
                console.log('QUEUE Connection established');
                this.channel = yield this.connection.createChannel();
                console.log('QUEUE Channel connected');
                yield this.channel.assertQueue(queue, queueOptions);
                console.log('QUEUE Queue asserted');
                if (isMassive && Array.isArray(message)) {
                    const promises = message.map((messageElement) => this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(messageElement)), messagesOptions));
                    yield Promise.allSettled(promises);
                }
                else {
                    yield this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), messagesOptions);
                }
                return 'Message sent successfully';
            }
            catch (error) {
                console.error('Error send message', error);
                throw error.message;
            }
            finally {
                yield this.channel.close().catch(() => console.warn('Error closing channel'));
                yield this.connection.close().catch(() => console.warn('Error closing connection'));
                console.log('QUEUE Closing connection');
            }
        });
    }
    purgePriorityQueue(queue_1) {
        return __awaiter(this, arguments, void 0, function* (queue, maxPriority = 10) {
            return this.purgeQueue(queue, {
                queueOptions: {
                    maxPriority,
                },
            });
        });
    }
    purgeQueue(queue_1) {
        return __awaiter(this, arguments, void 0, function* (queue, options = {}) {
            const queueOptions = options.queueOptions || {};
            this.connection = yield this.serverConnect();
            console.log('QUEUE Connection established');
            this.channel = yield this.connection.createChannel();
            try {
                console.log('QUEUE Channel connected');
                yield this.channel.assertQueue(queue, queueOptions);
                console.log('QUEUE Queue asserted');
                const purgeResponse = yield this.channel.purgeQueue(queue);
                console.log(`QUEUE ${queue} purge with ${purgeResponse.messageCount || 0}  removes`);
            }
            catch (error) {
                console.error('Error purge queue', error);
                throw error.message;
            }
            finally {
                yield this.channel.close().catch(() => console.warn('Error closing channel'));
                yield this.connection.close().catch(() => console.warn('Error closing connection'));
                console.log('QUEUE Closing connection');
            }
        });
    }
    getQueueMessageCount(queue_1) {
        return __awaiter(this, arguments, void 0, function* (queue, queueOptions = {}) {
            this.connection = yield this.serverConnect();
            this.channel = yield this.connection.createChannel();
            try {
                const queueData = yield this.channel.assertQueue(queue, queueOptions);
                yield this.channel.close().catch(() => console.warn('Error closing channel'));
                yield this.connection.close().catch(() => console.warn('Error closing connection'));
                return queueData.messageCount || 0;
            }
            catch (error) {
                console.error('Error get queue message count', error);
                throw error.message;
            }
        });
    }
    getQueuePriorityMessageCount(queue_1) {
        return __awaiter(this, arguments, void 0, function* (queue, maxQueuePriority = 10) {
            return this.getQueueMessageCount(queue, { maxPriority: maxQueuePriority });
        });
    }
    connectionOptions() {
        return {
            url: `amqps://${this.config.user}:${this.config.passwd}@${this.config.host}:${this.config.port}/${this.config.vhost}`,
            options: { heartbeat: this.config.connectionHeartbeat },
        };
    }
    consume(queueName_1, _function_1) {
        return __awaiter(this, arguments, void 0, function* (queueName, _function, noAckParam = true, prefetchParam = 0, maxPriority = false) {
            this.connection = yield this.serverConnect();
            this.channel = yield this.connection.createChannel();
            console.log('QUEUE Channel connected');
            const queueOptions = { durable: true };
            if (maxPriority) {
                queueOptions.maxPriority = maxPriority;
            }
            yield this.channel.assertQueue(queueName, queueOptions).then((ok) => {
                console.log(`[*] Waiting for messages from ${queueName}. To exit press CTRL+C`);
                return ok;
            });
            if (prefetchParam !== 0 && !noAckParam) {
                yield this.channel.prefetch(prefetchParam);
            }
            return this.channel.consume(queueName, (msg) => {
                console.log(' [x] Received in \'%s\': \'%s\'', queueName, msg.content.toString());
                _function(queueName, msg.content.toString(), this.channel, msg);
            }, { noAck: noAckParam });
        });
    }
    ack(messageObj, channel) {
        return __awaiter(this, void 0, void 0, function* () {
            if (channel) {
                return channel.ack(messageObj);
            }
            return false;
        });
    }
    serverConnect() {
        return __awaiter(this, void 0, void 0, function* () {
            const protocol = this.config.useSSL === true || ['true', 'TRUE'].includes(this.config.useSSL) ? 'amqps' : 'amqp';
            const connectionPath = `${protocol}://${this.config.user}:${this.config.passwd}@${this.config.host}:${this.config.port}/${this.config.vhost}`;
            console.log(`Connecting to ${connectionPath}`);
            return this.queueLib.connect(connectionPath, { heartbeat: this.config.connectionHeartbeat })
                .then((connection) => {
                console.log('QUEUE Connection established');
                return connection;
            });
        });
    }
}
module.exports = Amqp;
