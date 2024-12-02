import { DataTypes, Sequelize, Model, Optional } from 'sequelize';

interface LogAttributes {
    id: string;
    deviceId: string;
    logLevel: string;
    message: string;
    metadata?: Record<string, unknown>;
    createdAt?: Date;
    updatedAt?: Date;
}

type LogCreationAttributes = Optional<LogAttributes, 'id'>;

class Log extends Model<LogAttributes, LogCreationAttributes> implements LogAttributes {
    public id!: string;
    public deviceId!: string;
    public logLevel!: string;
    public message!: string;
    public metadata?: Record<string, unknown>;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

export default (sequelize: Sequelize) => {
    Log.init(
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            deviceId: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            logLevel: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            message: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            metadata: {
                type: DataTypes.JSONB,
                allowNull: true,
            },
        },
        {
            tableName: 'logs',
            sequelize,
        }
    );

    return Log;
};
