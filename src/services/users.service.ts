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
    const createUserData: User = { ...userData, password: hashedPassword };

    return createUserData;
  }

  public async updateUser(userId: number, userData: User): Promise<User> {
    const findUser: User = await UserModel.findByPk(userId);
    if (!findUser) throw new HttpException(409, "User doesn't exist");

    const hashedPassword = await hash(userData.password, 10);
    await UserModel.update({ ...userData, password: hashedPassword }, { where: { id: userId } });
    const updatedUser: User | null = await UserModel.findByPk(userId);
    if (!updatedUser) {
      throw new HttpException(500, 'Failed to fetch updated user data');
    }
    return updatedUser;
  }

  public async deleteUser(userId: number): Promise<number> {
    const findUser: User = await UserModel.findByPk(userId);
    if (!findUser) throw new HttpException(409, "User doesn't exist");

    return UserModel.destroy({ where: { id: userId } });
  }
}
