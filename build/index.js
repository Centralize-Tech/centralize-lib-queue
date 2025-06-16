"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Amqp = void 0;
const amqp_1 = require("./src/amqp");
Object.defineProperty(exports, "Amqp", { enumerable: true, get: function () { return amqp_1.Amqp; } });
const amqpInstance = new amqp_1.Amqp();
exports.default = amqpInstance;
