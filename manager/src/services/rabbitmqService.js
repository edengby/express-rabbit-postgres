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
const config_1 = __importDefault(require("../config"));
class RabbitMQService {
    constructor() { }
    static getInstance() {
        if (!RabbitMQService.instance) {
            RabbitMQService.instance = new RabbitMQService();
        }
        return RabbitMQService.instance;
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.connection = yield amqplib_1.default.connect(config_1.default.rabbitmqUrl);
                this.channel = yield this.connection.createChannel();
                // Declare exchanges
                yield this.channel.assertExchange('commands', 'direct', { durable: true });
                yield this.channel.assertExchange('responses', 'direct', { durable: true });
                yield this.channel.assertExchange('logs', 'fanout', { durable: true });
                // Declare queues
                const [responseQueue, logQueue] = yield Promise.all([
                    this.channel.assertQueue('responses_manager', { durable: true }),
                    this.channel.assertQueue('logs_manager', { durable: true }),
                ]);
                // Bind queues
                yield this.channel.bindQueue(responseQueue.queue, 'responses', 'response');
                yield this.channel.bindQueue(logQueue.queue, 'logs', '');
                console.log('Connected to RabbitMQ');
            }
            catch (error) {
                console.error('Failed to connect to RabbitMQ:', error);
                setTimeout(() => this.connect(), 5000); // Retry after 5 seconds
            }
        });
    }
    sendCommand(deviceId, command) {
        return __awaiter(this, void 0, void 0, function* () {
            const routingKey = `command.${deviceId}`;
            const message = Buffer.from(JSON.stringify(command));
            yield this.channel.publish('commands', routingKey, message);
            console.log(`Sent command to ${deviceId}:`, command);
        });
    }
    consumeResponses(onMessage) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.channel.consume('responses_manager', msg => {
                if (msg !== null) {
                    const content = msg.content.toString();
                    const data = JSON.parse(content);
                    onMessage(data);
                    this.channel.ack(msg);
                }
            });
        });
    }
    consumeLogs(onLog) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.channel.consume('logs_manager', msg => {
                if (msg !== null) {
                    const content = msg.content.toString();
                    const data = JSON.parse(content);
                    onLog(data);
                    this.channel.ack(msg);
                }
            });
        });
    }
}
exports.default = RabbitMQService.getInstance();
