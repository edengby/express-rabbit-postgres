"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Log = exports.Device = exports.sequelize = void 0;
const sequelize_1 = require("sequelize");
const config_1 = __importDefault(require("../config"));
const device_1 = __importDefault(require("./device"));
const log_1 = __importDefault(require("./log"));
const sequelize = new sequelize_1.Sequelize(config_1.default.postgresUrl, {
    dialect: 'postgres',
    logging: false,
});
exports.sequelize = sequelize;
const Device = (0, device_1.default)(sequelize);
exports.Device = Device;
const Log = (0, log_1.default)(sequelize);
exports.Log = Log;
Device.hasMany(Log, { foreignKey: 'deviceId', as: 'logs' });
Log.belongsTo(Device, { foreignKey: 'deviceId', as: 'device' });
