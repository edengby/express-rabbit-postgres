import rabbitmqService from './services/rabbitmqService';
import config from './config';

const executeCommand = async (command: any): Promise<void> => {
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
    } catch (error: any) {
        status = 'failure';
        result = `Error executing command: ${error.message}`;
    }

    // Send response back to manager
    const response = {
        command_id,
        status,
        result,
        timestamp: new Date().toISOString(),
        device_id: config.deviceId,
    };

    await rabbitmqService.sendResponse(response);
};

const performUpdate = async (downloadUrl: string, checksum: string): Promise<string> => {
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

const sendLogs = async (): Promise<void> => {
    // Simulate sending logs periodically
    setInterval(async () => {
        const log = {
            device_id: config.deviceId,
            timestamp: new Date().toISOString(),
            log_level: 'INFO',
            message: 'Sensor reading: temperature=22.5°C',
            metadata: {
                sensor_id: 'sensor_456',
                location: 'Building A - Floor 3',
            },
        };
        await rabbitmqService.sendLog(log);
    }, 10000); // Every 10 seconds
};

const start = async (): Promise<void> => {
    try {
        await rabbitmqService.connect();

        // Start listening for commands
        rabbitmqService.listenForCommands(executeCommand);

        // Start sending logs
        sendLogs();

        console.log(`Agent for ${config.deviceId} is running.`);
    } catch (error) {
        console.error('Agent failed to start:', error);
        process.exit(1);
    }
};

start();
