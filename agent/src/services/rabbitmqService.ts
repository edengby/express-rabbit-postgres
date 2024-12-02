import amqp, { Connection, Channel } from 'amqplib';
import config from '../config';

class RabbitMQService {
    private static instance: RabbitMQService;
    private connection!: Connection;
    private channel!: Channel;

    private constructor() {}

    public static getInstance(): RabbitMQService {
        if (!RabbitMQService.instance) {
            RabbitMQService.instance = new RabbitMQService();
        }
        return RabbitMQService.instance;
    }

    public async connect(): Promise<void> {
        try {
            this.connection = await amqp.connect(config.rabbitmqUrl);
            this.channel = await this.connection.createChannel();

            // Declare exchanges
            await this.channel.assertExchange('commands', 'direct', { durable: true });
            await this.channel.assertExchange('responses', 'direct', { durable: true });
            await this.channel.assertExchange('logs', 'fanout', { durable: true });

            // Declare queue
            const commandQueue = `commands_${config.deviceId}`;
            await this.channel.assertQueue(commandQueue, { durable: true });
            await this.channel.bindQueue(commandQueue, 'commands', `command.${config.deviceId}`);

            console.log(`Agent ${config.deviceId} connected to RabbitMQ`);
        } catch (error) {
            console.error('Agent failed to connect to RabbitMQ:', error);
            setTimeout(() => this.connect(), 5000); // Retry after 5 seconds
        }
    }

    public async listenForCommands(onCommand: (command: any) => void): Promise<void> {
        const commandQueue = `commands_${config.deviceId}`;
        await this.channel.consume(commandQueue, (msg) => {
            if (msg !== null) {
                const content = msg.content.toString();
                const command = JSON.parse(content);
                onCommand(command);
                this.channel.ack(msg);
            }
        });
    }

    public async sendResponse(response: Record<string, unknown>): Promise<void> {
        const routingKey = 'response';
        const message = Buffer.from(JSON.stringify(response));
        await this.channel.publish('responses', routingKey, message);
        console.log('Sent response:', response);
    }

    public async sendLog(log: Record<string, unknown>): Promise<void> {
        const message = Buffer.from(JSON.stringify(log));
        await this.channel.publish('logs', '', message);
        console.log('Sent log:', log);
    }
}

export default RabbitMQService.getInstance();
