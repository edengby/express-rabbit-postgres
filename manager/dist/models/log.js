"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
class Log extends sequelize_1.Model {
}
exports.default = (sequelize) => {
    Log.init({
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
        },
        deviceId: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        logLevel: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        message: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: false,
        },
        metadata: {
            type: sequelize_1.DataTypes.JSONB,
            allowNull: true,
        },
    }, {
        tableName: 'logs',
        sequelize,
    });
    return Log;
};
//# sourceMappingURL=log.js.map