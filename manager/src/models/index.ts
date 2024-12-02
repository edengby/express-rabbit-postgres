import { Sequelize } from 'sequelize';
import config from '../config';

import deviceModel from './device';
import logModel from './log';

const sequelize = new Sequelize(config.postgresUrl, {
    dialect: 'postgres',
    logging: false,
});

const Device = deviceModel(sequelize);
const Log = logModel(sequelize);

Device.hasMany(Log, { foreignKey: 'deviceId', as: 'logs' });
Log.belongsTo(Device, { foreignKey: 'deviceId', as: 'device' });

export { sequelize, Device, Log };
