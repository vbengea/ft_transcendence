const bcrypt = require('bcrypt');
const prisma = require('../prisma/prisma.cjs');
const SALT_ROUNDS = 10

async function createUser(req, reply) {
  const { password, email, name } = req.body
  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
  })
  if (user) {
    return reply.code(401).send({
      message: 'User already exists with this email',
    })
  }
  try {
    const hash = await bcrypt.hash(password, SALT_ROUNDS)
    const user = await prisma.user.create({
      data: {
        password: hash,
        email,
        name,
      },
    })
    return reply.code(201).send(user)
  } catch (e) {
    return reply.code(500).send(e)
  }
}

async function login(req, reply) {
  const { email, password } = req.body
  const user = await prisma.user.findUnique({ where: { email: email } })
  const isMatch = user && (await bcrypt.compare(password, user.password))
  if (!user || !isMatch) {
    return reply.code(401).send({
      message: 'Invalid email or password',
    })
  }
  const payload = {
    id: user.id,
    email: user.email,
    name: user.name,
  }
  const token = req.jwt.sign(payload)
  reply.setCookie('access_token', token, {
    path: '/',
    httpOnly: true,
    secure: true,
  })
  return { accessToken: token }
}

async function logout(req, reply) {
  reply.clearCookie('access_token')
  return reply.send({ message: 'Logout successful' })
}

async function getGames(req, reply) {
  const users = await prisma.game.findMany({
    select: {
      name: true,
      id: true,
      description: true,
    },
  })
  return reply.code(200).send(users)
}

exports.createUser = createUser;
exports.login = login;
exports.logout = logout;
exports.getGames = getGames;