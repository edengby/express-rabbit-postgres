"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.default = {
    rabbitmqUrl: process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672',
    postgresUrl: process.env.POSTGRES_URL || 'postgres://admin:admin@localhost:5432/distributed_system',
    serverPort: parseInt(process.env.SERVER_PORT || '3000', 10),
};
//# sourceMappingURL=config.js.map