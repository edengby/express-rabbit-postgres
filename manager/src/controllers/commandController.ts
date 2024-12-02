import { Request, Response } from 'express';
import { Device } from '../models';
import rabbitmqService from '../services/rabbitmqService';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

// Define the schema using Zod
const commandSchema = z.object({
    deviceId: z.string().nonempty(),
    action: z.string().nonempty(),
    parameters: z.record(z.any()).optional(),
});

export const sendCommand = async (req: Request, res: Response): Promise<Response> => {
    try {
        // Validate the request body
        const { deviceId, action, parameters } = commandSchema.parse(req.body);

        // Check if device exists, else create
        let device = await Device.findByPk(deviceId);
        if (!device) {
            device = await Device.create({ id: deviceId, status: 'online' });
        }

        const command = {
            command_id: uuidv4(),
            action,
            parameters: parameters || {},
            timestamp: new Date().toISOString(),
        };

        await rabbitmqService.sendCommand(deviceId, command);

        return res.status(200).json({ message: 'Command sent successfully.', command });
    } catch (error) {
        console.error('Error sending command:', error);
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        return res.status(500).json({ error: 'Failed to send command.' });
    }
};
