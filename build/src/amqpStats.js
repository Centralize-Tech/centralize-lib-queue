"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AmqpStats = void 0;
const axios_1 = __importDefault(require("axios"));
class AmqpStats {
    constructor(options = {}) {
        AmqpStats.hostname = options.hostname || 'localhost:55672';
        AmqpStats.username = options.username || 'guest';
        AmqpStats.password = options.password || 'guest';
        AmqpStats.protocol = options.protocol || 'http';
        AmqpStats.requestInstance = axios_1.default;
    }
    static sendRequest(endpoint, params = {}, method = 'GET') {
        const url = AmqpStats.getRequestPath(endpoint);
        console.log(url);
        const requestOptions = {
            url,
            method,
            auth: {
                username: AmqpStats.username,
                password: AmqpStats.password,
            },
            params,
        };
        return AmqpStats.requestInstance(requestOptions).then((response) => response.data).catch(console.error);
    }
    static getRequestPath(endpoint) {
        return `${AmqpStats.protocol}://${AmqpStats.hostname}/api/${endpoint}`;
    }
    static queues() {
        return AmqpStats.sendRequest('queues');
    }
}
exports.AmqpStats = AmqpStats;
