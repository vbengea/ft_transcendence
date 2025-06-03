'use strict'

const { ADDRESS, PORT, TKEY, TCRT } = process.env;

const fs = require('fs')
const path = require('path')
const fastify = require('fastify')({
	https: {
	  key: fs.readFileSync(TKEY),
	  cert: fs.readFileSync(TCRT)
	}
})

fastify.register(require('@fastify/static'), {
	root: path.join(__dirname, '../../public'),
	prefix: '/'
  })
  

// User auth .......................................

fastify.register(require('@fastify/jwt'), {
	secret: process.env.JWT_SECRET
})

fastify.get('/', function (req, reply) {
  reply.sendFile('index.html')
})

fastify.register(require('@fastify/websocket'))
fastify.register(require('./games/ws.cjs'))

fastify.listen({ host: ADDRESS, port: parseInt(PORT, 10) }, err => {
  if (err) {
	fastify.log.error(err)
	process.exit(1)
  }
  console.log(`Ready to receive websocket connections on port ${PORT}`)
})
