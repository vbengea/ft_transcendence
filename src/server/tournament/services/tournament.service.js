

function createTournamentService(prisma) {
	return {
		async createTournament(organizerId, name, users, rounds, gameName) {
			const game = await prisma.game.findFirst({
				where: { name: gameName }
			});

			if (!game) {
				throw new Error('Game not found');
			}

			const tournament = await prisma.tournament.create({
				data: {
					name,
					totalRounds: rounds.length,
					totalPlayers: users.length,
					customization: JSON.stringify({}),
					gameId: game.id,
					organizerId
				}
			});

			for (const roundData of rounds) {
				const round = await prisma.round.create({
					data: {
						name: roundData.name,
						number: rounds.indexOf(roundData) + 1,
						tournamentId: tournament.id
					}
				});

				for (const matchData of roundData.matches) {
					if (matchData.users.length == 2) {
						await prisma.match.create({
							data: {
								user1Id: matchData.users[0].id,
								user2Id: matchData.users[1].id,
								roundId: round.id,
								winScore: 10
							}
						});
					}
				}
			}
			return tournament;
		},

		async getTournaments() {
			return prisma.tournament.findMany({
				include: {
					organizer: {
						select: { id: true, name: true, avatar: true }
					},
					game: true,
					rounds: {
						include: {
							matches: {
								include: {
									user1: {
										select: { id: true, name: true, avatar: true }
									},
									user2: {
										select: { id: true, name: true, avatar: true }
									}
								}
							}
						}
					}
				}
			});
		},

		async getCurrentTournamentMatchByUserId(userId) {
			return prisma.match.findMany({
				where: { 
					OR: [{ 
						user1Id: userId 
					}, { 
						user2Id: userId 
					}],
					user1Score: 0, 
					user2Score: 0
				},
				include: {
					user1: {
						select: { id: true, name: true, avatar: true, human: true }
					},
					user2: {
						select: { id: true, name: true, avatar: true, human: true }
					}
				}
			});
		},

		async getMatchesByUserId(userId) {
			return prisma.match.findMany({
				where: { 
					OR: [{ 
						user1Id: userId 
					}, { 
						user2Id: userId 
					}],
					NOT: { endTime: null }
				},
				include: {
					user1: {
						select: { id: true, name: true, avatar: true, human: true }
					},
					user2: {
						select: { id: true, name: true, avatar: true, human: true }
					}
				}
			});
		},

		async getTournamentById(id) {
			return prisma.tournament.findUnique({
				where: { id },
				include: {
					organizer: {
						select: { id: true, name: true, avatar: true }
					},
					rounds: {
						include: {
							matches: true
						}
					}
				}
			});
		},

		async deleteTournament(id) {
			const rounds = await prisma.round.findMany({
				where: { tournamentId: id },
				select: { id: true }
			});

			for (const round of rounds) {
				await prisma.match.deleteMany({
					where: { roundId: round.id}
				});
			}
			
			await prisma.match.deleteMany({
				where: { tournamentId: id }
			});

			return prisma.tournament.delete({
				where: { id }
			});
		},

		async startMatch(id) {
			await prisma.match.update({
				where: {
					id
				},
				data: {
					startTime: new Date()
				}
			});
		},

		async endMatch(id, user1Score, user2Score) {
			await prisma.match.update({
				where: {
					id
				},
				data: {
					user1Score, 
					user2Score,
					endTime: new Date()
				}
			});
		}
	};
}

module.exports = createTournamentService