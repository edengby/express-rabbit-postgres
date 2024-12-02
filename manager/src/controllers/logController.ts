import { Request, Response } from 'express';
import { Log } from '../models';
import { Op } from 'sequelize';
import { z } from 'zod';

// Define the schema using Zod
const getLogsSchema = z.object({
    deviceId: z.string().optional(),
    logLevel: z.string().optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
});

export const getLogs = async (req: Request, res: Response): Promise<Response> => {
    try {
        // Validate query parameters
        const { deviceId, logLevel, startTime, endTime } = getLogsSchema.parse(req.query);

        const where: any = {};

        if (deviceId) where.deviceId = deviceId;
        if (logLevel) where.logLevel = logLevel;
        if (startTime || endTime) {
            where.createdAt = {};
            if (startTime) where.createdAt[Op.gte] = new Date(startTime);
            if (endTime) where.createdAt[Op.lte] = new Date(endTime);
        }

        const logs = await Log.findAll({ where, order: [['createdAt', 'DESC']] });
        return res.status(200).json(logs);
    } catch (error) {
        console.error('Error retrieving logs:', error);
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        return res.status(500).json({ error: 'Failed to retrieve logs.' });
    }
};
