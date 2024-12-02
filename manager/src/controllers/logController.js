"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLogs = void 0;
const models_1 = require("../models");
const sequelize_1 = require("sequelize");
const zod_1 = require("zod");
// Define the schema using Zod
const getLogsSchema = zod_1.z.object({
    deviceId: zod_1.z.string().optional(),
    logLevel: zod_1.z.string().optional(),
    startTime: zod_1.z.string().optional(),
    endTime: zod_1.z.string().optional(),
});
const getLogs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Validate query parameters
        const { deviceId, logLevel, startTime, endTime } = getLogsSchema.parse(req.query);
        const where = {};
        if (deviceId)
            where.deviceId = deviceId;
        if (logLevel)
            where.logLevel = logLevel;
        if (startTime || endTime) {
            where.createdAt = {};
            if (startTime)
                where.createdAt[sequelize_1.Op.gte] = new Date(startTime);
            if (endTime)
                where.createdAt[sequelize_1.Op.lte] = new Date(endTime);
        }
        const logs = yield models_1.Log.findAll({ where, order: [['createdAt', 'DESC']] });
        return res.status(200).json(logs);
    }
    catch (error) {
        console.error('Error retrieving logs:', error);
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        return res.status(500).json({ error: 'Failed to retrieve logs.' });
    }
});
exports.getLogs = getLogs;
