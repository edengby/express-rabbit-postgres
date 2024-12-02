import { DataTypes, Sequelize, Model, Optional } from 'sequelize';

interface DeviceAttributes {
    id: string;
    status: string;
    version: string;
    createdAt?: Date;
    updatedAt?: Date;
}

type DeviceCreationAttributes = Optional<DeviceAttributes, 'status' | 'version'>;

class Device extends Model<DeviceAttributes, DeviceCreationAttributes> implements DeviceAttributes {
    public id!: string;
    public status!: string;
    public version!: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

export default (sequelize: Sequelize) => {
    Device.init(
        {
            id: {
                type: DataTypes.STRING,
                primaryKey: true,
            },
            status: {
                type: DataTypes.STRING,
                defaultValue: 'offline',
            },
            version: {
                type: DataTypes.STRING,
                defaultValue: '1.0.0',
            },
        },
        {
            tableName: 'devices',
            sequelize,
        }
    );

    return Device;
};
