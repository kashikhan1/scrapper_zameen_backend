import { DataTypes, Model } from 'sequelize';
import { User } from '@interfaces/users.interface';
import { sequelize } from '../config/sequelize';

export interface UserInstance extends Model<User>, User {}

export const UserModel = sequelize.define<UserInstance>(
  'User',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
    },
  },
  { paranoid: true },
);
