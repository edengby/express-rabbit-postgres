import { Device } from '../models';

export const registerDevice = async (deviceId: string): Promise<void> => {
    try {
        let device = await Device.findByPk(deviceId);
        if (!device) {
            device = await Device.create({ id: deviceId, status: 'online' });
            console.log(`Registered new device: ${deviceId}`);
        } else {
            device.status = 'online';
            await device.save();
            console.log(`Device ${deviceId} is online.`);
        }
    } catch (error) {
        console.error('Error registering device:', error);
    }
};
