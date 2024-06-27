import { App } from '@/app';
import { ValidateEnv } from '@utils/validateEnv';
import { PropertyRoute } from '@routes/property.route';

ValidateEnv();

const app = new App([new PropertyRoute()]);

app.listen();
