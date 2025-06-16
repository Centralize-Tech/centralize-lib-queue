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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Amqp = exports.getQueuePriorityMessageCount = exports.getQueueMessageCount = exports.purgePriorityQueue = exports.purgeQueue = exports.ack = exports.consume = exports.sendPriorityMessage = exports.sendJSONMessage = void 0;
const amqp_1 = require("./amqp");
Object.defineProperty(exports, "Amqp", { enumerable: true, get: function () { return amqp_1.Amqp; } });
const sendJSONMessage = (message_1, queue_1, ...args_1) => __awaiter(void 0, [message_1, queue_1, ...args_1], void 0, function* (message, queue, isMassive = false) {
    const amqpInstance = new amqp_1.Amqp();
    return amqpInstance.sendJSONMessage(message, queue, isMassive);
});
exports.sendJSONMessage = sendJSONMessage;
const sendPriorityMessage = (message_1, queue_1, priority_1, ...args_1) => __awaiter(void 0, [message_1, queue_1, priority_1, ...args_1], void 0, function* (message, queue, priority, maxPriority = 10, isMassive = false) {
    const amqpInstance = new amqp_1.Amqp();
    return amqpInstance.sendPriorityMessage(message, queue, priority, maxPriority, isMassive);
});
exports.sendPriorityMessage = sendPriorityMessage;
const consume = (queueName_1, _function_1, ...args_1) => __awaiter(void 0, [queueName_1, _function_1, ...args_1], void 0, function* (queueName, _function, noAckParam = true, prefetchParam = 0, maxPriority = false) {
    const amqpInstance = new amqp_1.Amqp();
    return amqpInstance.consume(queueName, _function, noAckParam, prefetchParam, maxPriority);
});
exports.consume = consume;
const ack = (messageObj, channel) => __awaiter(void 0, void 0, void 0, function* () {
    const amqpInstance = new amqp_1.Amqp();
    return amqpInstance.ack(messageObj, channel);
});
exports.ack = ack;
const purgeQueue = (queue_1, ...args_1) => __awaiter(void 0, [queue_1, ...args_1], void 0, function* (queue, options = {}) {
    const amqpInstance = new amqp_1.Amqp();
    return amqpInstance.purgeQueue(queue, options);
});
exports.purgeQueue = purgeQueue;
const purgePriorityQueue = (queue_1, ...args_1) => __awaiter(void 0, [queue_1, ...args_1], void 0, function* (queue, maxPriority = 10) {
    const amqpInstance = new amqp_1.Amqp();
    return amqpInstance.purgePriorityQueue(queue, maxPriority);
});
exports.purgePriorityQueue = purgePriorityQueue;
const getQueueMessageCount = (queue_1, ...args_1) => __awaiter(void 0, [queue_1, ...args_1], void 0, function* (queue, queueOptions = {}) {
    const amqpInstance = new amqp_1.Amqp();
    return amqpInstance.getQueueMessageCount(queue, queueOptions);
});
exports.getQueueMessageCount = getQueueMessageCount;
const getQueuePriorityMessageCount = (queue_1, ...args_1) => __awaiter(void 0, [queue_1, ...args_1], void 0, function* (queue, maxQueuePriority = 10) {
    const amqpInstance = new amqp_1.Amqp();
    return amqpInstance.getQueuePriorityMessageCount(queue, maxQueuePriority);
});
exports.getQueuePriorityMessageCount = getQueuePriorityMessageCount;
