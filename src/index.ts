import { Amqp } from './amqp';

// Exportar funciones individuales
export const sendJSONMessage = async (message: object, queue: string, isMassive: boolean = false) => {
  const amqpInstance = new Amqp();
  return amqpInstance.sendJSONMessage(message, queue, isMassive);
};

export const sendPriorityMessage = async (message: object | Array<string>, queue: string, priority: number, maxPriority: number = 10, isMassive: boolean = false) => {
  const amqpInstance = new Amqp();
  return amqpInstance.sendPriorityMessage(message, queue, priority, maxPriority, isMassive);
};

export const consume = async (queueName: string, _function: any, noAckParam: boolean = true, prefetchParam: number = 0, maxPriority: boolean = false) => {
  const amqpInstance = new Amqp();
  return amqpInstance.consume(queueName, _function, noAckParam, prefetchParam, maxPriority);
};

export const ack = async (messageObj: any, channel: any) => {
  const amqpInstance = new Amqp();
  return amqpInstance.ack(messageObj, channel);
};

export const purgeQueue = async (queue: string, options: any = {}) => {
  const amqpInstance = new Amqp();
  return amqpInstance.purgeQueue(queue, options);
};

export const purgePriorityQueue = async (queue: string, maxPriority: number = 10) => {
  const amqpInstance = new Amqp();
  return amqpInstance.purgePriorityQueue(queue, maxPriority);
};

export const getQueueMessageCount = async (queue: string, queueOptions: any = {}) => {
  const amqpInstance = new Amqp();
  return amqpInstance.getQueueMessageCount(queue, queueOptions);
};

export const getQueuePriorityMessageCount = async (queue: string, maxQueuePriority: number = 10) => {
  const amqpInstance = new Amqp();
  return amqpInstance.getQueuePriorityMessageCount(queue, maxQueuePriority);
};

// Exportar la clase para uso con instancias personalizadas
export { Amqp };
