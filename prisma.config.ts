import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
	schema: 'src/server/prisma/schema.prisma',
	migrations: {
		path: 'src/server/prisma/migrations'
	},
	datasource: {
		url: env('DATABASE_URL')
	}
});
