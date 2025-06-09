

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
						number: rounds.indexOf(roundData) + 1
					}
				});

				for (const matchData of roundData.matches) {
					if (matchData.users.length == 2) {
						await prisma.match.create({
							data: {
								user1Id: matchData.users[0].id,
								user2Id: matchData.users[1].id,
								tournamentId: tournament.id,
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
					matches: {
						include: {
							round: true,
							user1: {
								select: { id: true, name: true, avatar: true }
							},
							user2: {
								select: { id: true, name: true, avatar: true }
							}
						}
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
					}
				}
			});
		},

		async deleteTournament(id) {
			await prisma.match.deleteMany({
				where: { tournamentId: id }
			});

			return prisma.tournament.delete({
				where: { id }
			});
		}
	};
}

module.exports = createTournamentService