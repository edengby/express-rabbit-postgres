"use strict";
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
    async connect() {
        try {
            this.connection = await amqplib_1.default.connect(config_1.default.rabbitmqUrl);
            this.channel = await this.connection.createChannel();
            // Declare exchanges
            await this.channel.assertExchange('commands', 'direct', { durable: true });
            await this.channel.assertExchange('responses', 'direct', { durable: true });
            await this.channel.assertExchange('logs', 'fanout', { durable: true });
            // Declare queues
            const [responseQueue, logQueue] = await Promise.all([
                this.channel.assertQueue('responses_manager', { durable: true }),
                this.channel.assertQueue('logs_manager', { durable: true }),
            ]);
            // Bind queues
            await this.channel.bindQueue(responseQueue.queue, 'responses', 'response');
            await this.channel.bindQueue(logQueue.queue, 'logs', '');
            console.log('Connected to RabbitMQ');
        }
        catch (error) {
            console.error('Failed to connect to RabbitMQ:', error);
            setTimeout(() => this.connect(), 5000); // Retry after 5 seconds
        }
    }
    async sendCommand(deviceId, command) {
        const routingKey = `command.${deviceId}`;
        const message = Buffer.from(JSON.stringify(command));
        await this.channel.publish('commands', routingKey, message);
        console.log(`Sent command to ${deviceId}:`, command);
    }
    async consumeResponses(onMessage) {
        await this.channel.consume('responses_manager', (msg) => {
            if (msg !== null) {
                const content = msg.content.toString();
                const data = JSON.parse(content);
                onMessage(data);
                this.channel.ack(msg);
            }
        });
    }
    async consumeLogs(onLog) {
        await this.channel.consume('logs_manager', (msg) => {
            if (msg !== null) {
                const content = msg.content.toString();
                const data = JSON.parse(content);
                onLog(data);
                this.channel.ack(msg);
            }
        });
    }
}
exports.default = RabbitMQService.getInstance();
//# sourceMappingURL=rabbitmqService.js.map