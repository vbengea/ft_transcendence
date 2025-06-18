'use strict'

const { ADDRESS, PORT, TKEY, TCRT, JWT_SECRET, COOKIE_SECRET_KEY } = process.env;

const fs = require('fs')
const path = require('path')
const multipart = require('@fastify/multipart');

const fastify = require('fastify')({
    https: {
      key: fs.readFileSync(TKEY),
      cert: fs.readFileSync(TCRT)
    }
})

fastify.register(multipart, {
  limits: {
    fileSize: 2 * 1024 * 1024
  }
});

const cors = require('@fastify/cors');
fastify.register(cors, {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
})


// AUTH VERIFICATION ................................................................................
const fjwt = require('@fastify/jwt')
const fCookie = require('@fastify/cookie')
const createAuthUtils = require('./user-auth/utils/auth')

fastify.register(fjwt, { secret: JWT_SECRET })
fastify.register(fCookie, { secret: COOKIE_SECRET_KEY, hook: 'preHandler' })

fastify.decorate('authenticate', async (req, reply) => {
  const token = req.cookies.access_token
  if (!token)
    return reply.status(401).send({ message: 'Authentication required' })
  try {
    const decoded = req.jwt.verify(token)
    req.user = decoded
  } catch (err) {
    return reply.status(401).send({ message: 'Invalid or expired token' })
  }
})

fastify.addHook('preHandler', (req, res, next) => {
  req.jwt = fastify.jwt
  return next()
})

fastify.register(require('./user-auth/app.js'), { 
  authUtils: createAuthUtils()
})
// ....................................................................................

fastify.register(require('./tournament/app.js'));

fastify.register(require('@fastify/static'), {
  root: path.join(__dirname, '../../public'),
  prefix: '/'
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

const listeners = ['SIGINT', 'SIGTERM']
listeners.forEach((signal) => {
  process.on(signal, async () => {
    await fastify.close()
    process.exit(0)
  })
})