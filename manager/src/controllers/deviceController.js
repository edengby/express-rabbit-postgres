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
exports.registerDevice = void 0;
const models_1 = require("../models");
const registerDevice = (deviceId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let device = yield models_1.Device.findByPk(deviceId);
        if (!device) {
            device = yield models_1.Device.create({ id: deviceId, status: 'online' });
            console.log(`Registered new device: ${deviceId}`);
        }
        else {
            device.status = 'online';
            yield device.save();
            console.log(`Device ${deviceId} is online.`);
        }
    }
    catch (error) {
        console.error('Error registering device:', error);
    }
});
exports.registerDevice = registerDevice;
