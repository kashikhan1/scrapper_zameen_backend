import passport from 'passport';
import { compare } from 'bcrypt';
import { Strategy } from 'passport-local';
import { UserModel } from '@/models/users.model';
import { User } from '@/interfaces/users.interface';

passport.use(
  new Strategy({ usernameField: 'email' }, async (email, password, done) => {
    const user = await UserModel.findOne({ where: { email } });
    if (!user) {
      return done(null, false, { message: 'Incorrect email or password.' });
    }
    const isValidPassword = await compare(password, user.password);
    if (!isValidPassword) {
      return done(null, false, { message: 'Incorrect email or password.' });
    }
    return done(null, user);
  }),
);

passport.serializeUser((user: User, done) => {
  done(null, user?.id);
});

passport.deserializeUser(async (id: number, done) => {
  const user = await UserModel.findByPk(id);
  done(null, user);
});

export const Passport = passport;
