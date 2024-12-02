"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const rabbitmqService_1 = __importDefault(require("./services/rabbitmqService"));
const config_1 = __importDefault(require("./config"));
const executeCommand = async (command) => {
    const { command_id, action, parameters } = command;
    console.log(`Executing command: ${action} with parameters:`, parameters);
    let status = 'success';
    let result = '';
    try {
        // Simulate command execution
        switch (action) {
            case 'restart':
                // Simulate restart
                await new Promise((resolve) => setTimeout(resolve, 2000));
                result = 'Device restarted successfully.';
                break;
            case 'update':
                // Simulate update
                const { download_url, checksum } = parameters;
                result = await performUpdate(download_url, checksum);
                break;
            default:
                status = 'failure';
                result = `Unknown action: ${action}`;
        }
    }
    catch (error) {
        status = 'failure';
        result = `Error executing command: ${error.message}`;
    }
    // Send response back to manager
    const response = {
        command_id,
        status,
        result,
        timestamp: new Date().toISOString(),
        device_id: config_1.default.deviceId,
    };
    await rabbitmqService_1.default.sendResponse(response);
};
const performUpdate = async (downloadUrl, checksum) => {
    // Placeholder for actual update logic
    console.log(`Downloading update from ${downloadUrl}`);
    // Simulate download
    await new Promise((resolve) => setTimeout(resolve, 3000));
    // Simulate checksum verification
    if (checksum !== 'abc123...') {
        throw new Error('Checksum verification failed.');
    }
    console.log('Update applied successfully.');
    return 'Firmware updated to version 2.0.0 successfully.';
};
const sendLogs = async () => {
    // Simulate sending logs periodically
    setInterval(async () => {
        const log = {
            device_id: config_1.default.deviceId,
            timestamp: new Date().toISOString(),
            log_level: 'INFO',
            message: 'Sensor reading: temperature=22.5°C',
            metadata: {
                sensor_id: 'sensor_456',
                location: 'Building A - Floor 3',
            },
        };
        await rabbitmqService_1.default.sendLog(log);
    }, 10000); // Every 10 seconds
};
const start = async () => {
    try {
        await rabbitmqService_1.default.connect();
        // Start listening for commands
        rabbitmqService_1.default.listenForCommands(executeCommand);
        // Start sending logs
        sendLogs();
        console.log(`Agent for ${config_1.default.deviceId} is running.`);
    }
    catch (error) {
        console.error('Agent failed to start:', error);
        process.exit(1);
    }
};
start();
//# sourceMappingURL=app.js.map