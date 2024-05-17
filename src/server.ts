import { App } from '@/app';
import { AuthRoute } from '@routes/auth.route';
import { UserRoute } from '@routes/users.route';
import { ValidateEnv } from '@utils/validateEnv';
import { PropertyRoute } from '@routes/property.route';

ValidateEnv();

const app = new App([new UserRoute(), new AuthRoute(), new PropertyRoute()]);

app.listen();
