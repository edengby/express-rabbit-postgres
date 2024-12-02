import express from 'express';
import bodyParser from 'body-parser';
import config from './config';
import { sequelize, Device, Log } from './models';
import rabbitmqService from './services/rabbitmqService';
import * as commandController from './controllers/commandController';
import * as logController from './controllers/logController';
import { registerDevice } from './controllers/deviceController';
//import swaggerUi from 'swagger-ui-express';
//import swaggerSpec from './swagger';

const app = express();
app.use(bodyParser.json());

// Swagger documentation
//app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API Routes
app.post('/commands', commandController.sendCommand);
app.get('/logs', logController.getLogs);

// Start server and initialize services
const start = async () => {
  try {
    // Connect to PostgreSQL
    await sequelize.authenticate();
    console.log('Connected to PostgreSQL');

    // Sync models
    await sequelize.sync();
    console.log('PostgreSQL models synchronized');

    // Connect to RabbitMQ
    await rabbitmqService.connect();

    // Start consuming responses
    rabbitmqService.consumeResponses(async (data) => {
      console.log('Received response:', data);
      const { command_id, status, result, timestamp, device_id } = data;

      if (device_id) {
        await registerDevice(device_id);
        const device = await Device.findByPk(device_id);
        if (device) {
          device.status = status;
          await device.save();
        }
      }

      // You can extend this to handle command tracking
    });

    // Start consuming logs
    rabbitmqService.consumeLogs(async (logData) => {
      console.log('Received log:', logData);
      const { device_id, log_level, message, metadata, timestamp } = logData;

      await Log.create({
        deviceId: device_id,
        logLevel: log_level,
        message,
        metadata,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    });

    // Start Express server
    app.listen(config.serverPort, () => {
      console.log(`Manager API listening on port ${config.serverPort}`);
      console.log(`Swagger UI available at http://localhost:${config.serverPort}/api-docs`);
    });
  } catch (error) {
    console.error('Failed to start manager:', error);
    process.exit(1);
  }
};

start();
