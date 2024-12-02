import dotenv from 'dotenv';
dotenv.config();

export default {
    rabbitmqUrl: process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672',
    deviceId: process.env.DEVICE_ID || 'device_123',
};
