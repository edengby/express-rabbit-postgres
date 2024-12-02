import dotenv from 'dotenv';
dotenv.config();

export default {
    rabbitmqUrl: process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672',
    postgresUrl: process.env.POSTGRES_URL || 'postgres://admin:admin@localhost:5432/distributed_system',
    serverPort: parseInt(process.env.SERVER_PORT || '3000', 10),
};
