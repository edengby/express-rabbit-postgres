"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerDevice = void 0;
const models_1 = require("../models");
const registerDevice = async (deviceId) => {
    try {
        let device = await models_1.Device.findByPk(deviceId);
        if (!device) {
            device = await models_1.Device.create({ id: deviceId, status: 'online' });
            console.log(`Registered new device: ${deviceId}`);
        }
        else {
            device.status = 'online';
            await device.save();
            console.log(`Device ${deviceId} is online.`);
        }
    }
    catch (error) {
        console.error('Error registering device:', error);
    }
};
exports.registerDevice = registerDevice;
//# sourceMappingURL=deviceController.js.map