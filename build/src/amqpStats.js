"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AmqpStats = void 0;
const axios_1 = __importDefault(require("axios"));
class AmqpStats {
    constructor(options = {}) {
        this.hostname = options.hostname || 'localhost:55672';
        this.username = options.username || 'guest';
        this.password = options.password || 'guest';
        this.protocol = options.protocol || 'http';
        this.requestInstance = axios_1.default;
    }
    setRequestInstance(instance) {
        this.requestInstance = instance;
    }
    sendRequest(endpoint, params = {}, method = 'GET') {
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
        return this.requestInstance(requestOptions).then((response) => response.data).catch(console.error);
    }
    getRequestPath(endpoint) {
        return `${this.protocol}://${this.hostname}/api/${endpoint}`;
    }
    queues() {
        return this.sendRequest('queues');
    }
}
exports.AmqpStats = AmqpStats;
