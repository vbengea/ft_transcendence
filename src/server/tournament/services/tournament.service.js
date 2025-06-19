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
					const len = matchData.users.length;

					if (matchData.users && len) {

						matchData.users.sort((a, b) => {
							if (a.human && !b.human)
								return -1;
							else if (!a.human && b.human)
								return 1;
							else if (a.human && b.human && a.id === organizerId)
								return -1;
							else if (a.human && b.human && b.id === organizerId)
								return 1;
							else
								return 0;
						});

						await prisma.match.create({
							data: len == 2 ? {
								user1Id: matchData.users[0].id,
								user2Id: matchData.users[1].id,
								user3Id: null,
								user4Id: null,
								roundId: round.id,
								winScore: gameName === 'pong' ? 10 : 3
							} : {
								user1Id: matchData.users[0].id,
								user2Id: matchData.users[2].id,
								user3Id: matchData.users[1].id,
								user4Id: matchData.users[3].id,
								roundId: round.id,
								winScore: gameName === 'pong' ? 10 : 3
							}
						});
					} 
					else {
						await prisma.match.create({
							data: {
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
									},
									user3: {
										select: { id: true, name: true, avatar: true }
									},
									user4: {
										select: { id: true, name: true, avatar: true }
									}
								}
							}
						}
					}
				}
			});
		},

		async getCurrentTournamentMatchByUserId(userId, tournamentId) {
			return prisma.match.findMany({
				where: { 
					OR: [{ 
						user1Id: userId 
					}, { 
						user2Id: userId 
					},{ 
						user3Id: userId 
					}, { 
						user4Id: userId 
					}],
					user1Score: 0,
					user2Score: 0,
					round: {
						tournament: { id: tournamentId }
					}
				},
				include: {
					user1: {
						select: { id: true, name: true, avatar: true, human: true }
					},
					user2: {
						select: { id: true, name: true, avatar: true, human: true }
					},
					user3: {
						select: { id: true, name: true, avatar: true, human: true }
					},
					user4: {
						select: { id: true, name: true, avatar: true, human: true }
					},
					round: {
						include: {
							tournament: { 
								include: {
									game: true
								}
							}
						}
					}
				},
				orderBy: [{
					creationTime: 'asc'
				}]
			});
		},

		async getMatchesByUserId(userId) {
			return prisma.match.findMany({
				where: { 
					OR: [{ 
						user1Id: userId 
					}, { 
						user2Id: userId 
					},{ 
						user3Id: userId 
					}, { 
						user4Id: userId 
					}],
					NOT: { endTime: null }
				},
				include: {
					user1: {
						select: { id: true, name: true, avatar: true, human: true }
					},
					user2: {
						select: { id: true, name: true, avatar: true, human: true }
					},
					user3: {
						select: { id: true, name: true, avatar: true, human: true }
					},
					user4: {
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
							matches: {
								include: {
									user1: true,
									user2: true
								}
							}
						}
					},
					game: true
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

		async endMatch(id, user1Score, user2Score, user3Score = 0, user4Score = 0) {
			await prisma.match.update({
				where: {
					id
				},
				data: {
					user1Score, 
					user2Score,
					user3Score,
					user4Score,
					endTime: new Date()
				}
			});
		},

		async advanceToNextMatch(match, user) {
			const t = match.round.tournament;
			if (t.totalRounds > match.round.number) {
				const tournamentId = t.id;

				let round = await prisma.round.findUnique({ where: { id: match.round.id }, include: { matches: true } });
				let i = 0;
				for(let r of round.matches) {
					if (r.user1Id === user.id || r.user2Id === user.id)
						break;
					i++;
				}
				
				let j = Math.floor(i / 2);

				round = (await prisma.round.findMany({
					where: { tournamentId, number: round.number + 1 }, 
					include: { matches: true } 
				}))[0];
				
				match = round.matches[j];
				
				if (i % 2 == 0)
					await prisma.match.update({ where:{ id: match.id }, data: { user1Id: user.id }})
				else if (match.user2 == null)
					await prisma.match.update({ where:{ id: match.id }, data: { user2Id: user.id }})
			}
		}
	};
}

module.exports = createTournamentService