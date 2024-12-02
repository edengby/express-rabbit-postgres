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

            // Declare queues
            const [responseQueue, logQueue] = await Promise.all([
                this.channel.assertQueue('responses_manager', { durable: true }),
                this.channel.assertQueue('logs_manager', { durable: true }),
            ]);

            // Bind queues
            await this.channel.bindQueue(responseQueue.queue, 'responses', 'response');
            await this.channel.bindQueue(logQueue.queue, 'logs', '');

            console.log('Connected to RabbitMQ');
        } catch (error) {
            console.error('Failed to connect to RabbitMQ:', error);
            setTimeout(() => this.connect(), 5000); // Retry after 5 seconds
        }
    }

    public async sendCommand(deviceId: string, command: Record<string, unknown>): Promise<void> {
        const routingKey = `command.${deviceId}`;
        const message = Buffer.from(JSON.stringify(command));
        await this.channel.publish('commands', routingKey, message);
        console.log(`Sent command to ${deviceId}:`, command);
    }

    public async consumeResponses(onMessage: (data: any) => void): Promise<void> {
        await this.channel.consume('responses_manager', msg => {
            if (msg !== null) {
                const content = msg.content.toString();
                const data = JSON.parse(content);
                onMessage(data);
                this.channel.ack(msg);
            }
        });
    }

    public async consumeLogs(onLog: (data: any) => void): Promise<void> {
        await this.channel.consume('logs_manager', msg=> {
            if (msg !== null) {
                const content = msg.content.toString();
                const data = JSON.parse(content);
                onLog(data);
                this.channel.ack(msg);
            }
        });
    }
}

export default RabbitMQService.getInstance();
