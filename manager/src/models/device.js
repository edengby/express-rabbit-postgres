"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
class Device extends sequelize_1.Model {
}
exports.default = (sequelize) => {
    Device.init({
        id: {
            type: sequelize_1.DataTypes.STRING,
            primaryKey: true,
        },
        status: {
            type: sequelize_1.DataTypes.STRING,
            defaultValue: 'offline',
        },
        version: {
            type: sequelize_1.DataTypes.STRING,
            defaultValue: '1.0.0',
        },
    }, {
        tableName: 'devices',
        sequelize,
    });
    return Device;
};
