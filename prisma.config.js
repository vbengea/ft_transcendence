require('dotenv/config');
const { defineConfig } = require('prisma/config');

module.exports = defineConfig({
	schema: 'src/server/prisma/schema.prisma',
	migrations: {
		path: 'src/server/prisma/migrations'
	},
	datasource: {
		url: process.env.DATABASE_URL
	}
});
