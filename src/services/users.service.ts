import { hash } from 'bcrypt';
import { Service } from 'typedi';
import { HttpException } from '@exceptions/HttpException';
import { User } from '@interfaces/users.interface';
import { UserModel } from '@models/users.model';

@Service()
export class UserService {
  public async findAllUser(): Promise<User[]> {
    const users: Promise<User[]> = UserModel.findAll();
    return users;
  }

  public async findUserById(userId: number): Promise<User> {
    const findUser: User = await UserModel.findByPk(userId);
    if (!findUser) throw new HttpException(409, "User doesn't exist");

    return findUser;
  }

  public async createUser(userData: User): Promise<User> {
    const findUser: User = await UserModel.findOne({ where: { email: userData.email } });
    if (findUser) throw new HttpException(409, `This email ${userData.email} already exists`);

    const hashedPassword = await hash(userData.password, 10);
    const createUserData: Promise<User> = UserModel.create({ ...userData, password: hashedPassword });

    return createUserData;
  }

  public async updateUser(userId: number, userData: User): Promise<User> {
    const findUser: User = await UserModel.findByPk(userId);
    if (!findUser) throw new HttpException(409, "User doesn't exist");
    delete userData.password;
    const [updatedRows, [updatedUser]] = await UserModel.update(userData, {
      where: { id: userId },
      returning: true,
    });

    if (updatedRows !== 1) {
      throw new HttpException(500, 'Failed to update user');
    }
    return updatedUser;
  }

  public async deleteUser(userId: number): Promise<boolean> {
    const findUser: User = await UserModel.findByPk(userId);
    if (!findUser) throw new HttpException(409, "User doesn't exist");

    const deletedRows: number = await UserModel.destroy({ where: { id: userId } });
    return deletedRows === 1;
  }
}
