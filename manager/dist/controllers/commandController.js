"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendCommand = void 0;
const models_1 = require("../models");
const rabbitmqService_1 = __importDefault(require("../services/rabbitmqService"));
const uuid_1 = require("uuid");
const zod_1 = require("zod");
// Define the schema using Zod
const commandSchema = zod_1.z.object({
    deviceId: zod_1.z.string().nonempty(),
    action: zod_1.z.string().nonempty(),
    parameters: zod_1.z.record(zod_1.z.any()).optional(),
});
const sendCommand = async (req, res) => {
    try {
        // Validate the request body
        const { deviceId, action, parameters } = commandSchema.parse(req.body);
        // Check if device exists, else create
        let device = await models_1.Device.findByPk(deviceId);
        if (!device) {
            device = await models_1.Device.create({ id: deviceId, status: 'online' });
        }
        const command = {
            command_id: (0, uuid_1.v4)(),
            action,
            parameters: parameters || {},
            timestamp: new Date().toISOString(),
        };
        await rabbitmqService_1.default.sendCommand(deviceId, command);
        return res.status(200).json({ message: 'Command sent successfully.', command });
    }
    catch (error) {
        console.error('Error sending command:', error);
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        return res.status(500).json({ error: 'Failed to send command.' });
    }
};
exports.sendCommand = sendCommand;
//# sourceMappingURL=commandController.js.map