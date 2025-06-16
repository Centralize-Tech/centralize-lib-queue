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
exports.Amqp = void 0;
const amqplib_1 = __importDefault(require("amqplib"));
const amqpStats_1 = require("./amqpStats");
const config_1 = __importDefault(require("../config"));
class Amqp {
    constructor(inputConfig = {}) {
        this.config = Object.assign(Object.assign({}, config_1.default), inputConfig);
        this.queueLib = amqplib_1.default;
        console.log(`Connecting to ${this.config.host}`);
        this.ampqStats = new amqpStats_1.AmqpStats({
            username: this.config.consoleUser,
            password: this.config.consolePasswd,
            hostname: this.config.host,
            protocol: 'https'
        });
        console.log('Successful connection');
    }
    setConfig(inputConfig = {}) {
        this.config = Object.assign(Object.assign({}, this.config), inputConfig);
    }
    parseBoolean(value) {
        return value === true || (value === null || value === void 0 ? void 0 : value.toString().toLowerCase()) === 'true';
    }
    connectionOptions() {
        return {
            url: `amqps://${this.config.user}:${this.config.passwd}@${this.config.host}:${this.config.port}/${this.config.vhost}`,
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
    sendMessage(message_1, queue_1) {
        return __awaiter(this, arguments, void 0, function* (message, queue, isMassive = false, options = {}) {
            let connection;
            let channel;
            const messagesOptions = options.messageOptions || {};
            const queueOptions = options.queueOptions || {};
            try {
                connection = yield this.serverConnect();
                console.log('QUEUE Connection established');
                channel = yield connection.createChannel();
                console.log('QUEUE Channel connected');
                yield channel.assertQueue(queue, queueOptions);
                console.log('QUEUE Queue asserted');
                if (isMassive && Array.isArray(message)) {
                    const promises = message.map((messageElement) => channel.sendToQueue(queue, Buffer.from(JSON.stringify(messageElement)), messagesOptions));
                    yield Promise.allSettled(promises);
                }
                else {
                    yield channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), messagesOptions);
                }
                return 'Message sent successfully';
            }
            catch (error) {
                console.error('Error send message', error);
                throw error.message;
            }
            finally {
                if (channel)
                    yield channel.close().catch(() => console.warn('Error closing channel'));
                if (connection)
                    yield connection.close().catch(() => console.warn('Error closing connection'));
                console.log('QUEUE Closing connection');
            }
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
    consume(queueName_1, _function_1) {
        return __awaiter(this, arguments, void 0, function* (queueName, _function, noAckParam = true, prefetchParam = 0, maxPriority = false) {
            const connection = yield this.serverConnect();
            const channel = yield connection.createChannel();
            console.log('QUEUE Channel connected');
            const queueOptions = { durable: true };
            if (maxPriority) {
                queueOptions.maxPriority = maxPriority;
            }
            yield channel.assertQueue(queueName, queueOptions).then((ok) => {
                console.log(`[*] Waiting for messages from ${queueName}. To exit press CTRL+C`);
                return ok;
            });
            if (prefetchParam !== 0 && !noAckParam) {
                yield channel.prefetch(prefetchParam);
            }
            this.connection = connection;
            this.channel = channel;
            return channel.consume(queueName, (msg) => {
                console.log(' [x] Received in \'%s\': \'%s\'', queueName, msg.content.toString());
                _function(queueName, msg.content.toString(), channel, msg);
            }, { noAck: noAckParam });
        });
    }
    serverConnect() {
        const { url, options } = this.connectionOptions();
        console.log(`Connecting to ${url}`);
        return this.queueLib.connect(url, options);
    }
}
exports.Amqp = Amqp;
