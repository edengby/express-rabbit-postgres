"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const config_1 = __importDefault(require("./config"));
const models_1 = require("./models");
const rabbitmqService_1 = __importDefault(require("./services/rabbitmqService"));
const commandController = __importStar(require("./controllers/commandController"));
const logController = __importStar(require("./controllers/logController"));
const deviceController_1 = require("./controllers/deviceController");
//import swaggerUi from 'swagger-ui-express';
//import swaggerSpec from './swagger';
const app = (0, express_1.default)();
app.use(body_parser_1.default.json());
// Swagger documentation
//app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// API Routes
app.post('/commands', commandController.sendCommand);
app.get('/logs', logController.getLogs);
// Start server and initialize services
const start = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Connect to PostgreSQL
        yield models_1.sequelize.authenticate();
        console.log('Connected to PostgreSQL');
        // Sync models
        yield models_1.sequelize.sync();
        console.log('PostgreSQL models synchronized');
        // Connect to RabbitMQ
        yield rabbitmqService_1.default.connect();
        // Start consuming responses
        rabbitmqService_1.default.consumeResponses((data) => __awaiter(void 0, void 0, void 0, function* () {
            console.log('Received response:', data);
            const { command_id, status, result, timestamp, device_id } = data;
            if (device_id) {
                yield (0, deviceController_1.registerDevice)(device_id);
                const device = yield models_1.Device.findByPk(device_id);
                if (device) {
                    device.status = status;
                    yield device.save();
                }
            }
            // You can extend this to handle command tracking
        }));
        // Start consuming logs
        rabbitmqService_1.default.consumeLogs((logData) => __awaiter(void 0, void 0, void 0, function* () {
            console.log('Received log:', logData);
            const { device_id, log_level, message, metadata, timestamp } = logData;
            yield models_1.Log.create({
                deviceId: device_id,
                logLevel: log_level,
                message,
                metadata,
                createdAt: timestamp,
                updatedAt: timestamp,
            });
        }));
        // Start Express server
        app.listen(config_1.default.serverPort, () => {
            console.log(`Manager API listening on port ${config_1.default.serverPort}`);
            console.log(`Swagger UI available at http://localhost:${config_1.default.serverPort}/api-docs`);
        });
    }
    catch (error) {
        console.error('Failed to start manager:', error);
        process.exit(1);
    }
});
start();
