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
            // Declare queue
            const commandQueue = `commands_${config_1.default.deviceId}`;
            await this.channel.assertQueue(commandQueue, { durable: true });
            await this.channel.bindQueue(commandQueue, 'commands', `command.${config_1.default.deviceId}`);
            console.log(`Agent ${config_1.default.deviceId} connected to RabbitMQ`);
        }
        catch (error) {
            console.error('Agent failed to connect to RabbitMQ:', error);
            setTimeout(() => this.connect(), 5000); // Retry after 5 seconds
        }
    }
    async listenForCommands(onCommand) {
        const commandQueue = `commands_${config_1.default.deviceId}`;
        await this.channel.consume(commandQueue, (msg) => {
            if (msg !== null) {
                const content = msg.content.toString();
                const command = JSON.parse(content);
                onCommand(command);
                this.channel.ack(msg);
            }
        });
    }
    async sendResponse(response) {
        const routingKey = 'response';
        const message = Buffer.from(JSON.stringify(response));
        await this.channel.publish('responses', routingKey, message);
        console.log('Sent response:', response);
    }
    async sendLog(log) {
        const message = Buffer.from(JSON.stringify(log));
        await this.channel.publish('logs', '', message);
        console.log('Sent log:', log);
    }
}
exports.default = RabbitMQService.getInstance();
//# sourceMappingURL=rabbitmqService.js.map