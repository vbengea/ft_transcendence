import asyncio
import pathlib
import ssl
import json
import websockets

ssl_context = ssl.SSLContext()
ssl_context.verify_mode = ssl.CERT_NONE
ssl_context.check_hostname = False

def params():
	domain = input("Specify server domain or IP (localhost): ") or 'localhost'
	port = input("Port (3000): ") or 3000
	tournamentId = input("Specify tournament ID: ")
	cookie = input("Web session: ")
	asyncio.run(hand_shake(tournamentId, cookie, domain, port))

async def hand_shake(tournamentId, cookie, domain = 'localhost', port = 3000):
	uri = f"wss://{domain}:{port}/ws"
	connect = {"type":"pong","subtype":"connect","paddles":[{"x":4,"y":285.4666748046875,"w":12,"h":81.55000305175781},{"x":2224,"y":285.4666748046875,"w":12,"h":81.55000305175781}],"screen":{"w":2240,"h":652.5,"lineHeight":8},"ball":{"w":12,"h":12},"tournamentId":tournamentId}
	headers = {"Cookie": f"{cookie}"}
	async with websockets.connect(uri, ssl=ssl_context, additional_headers=headers) as ws:
		await ws.recv()
		await ws.send(json.dumps(connect))
		while (True):
			play = input("Play (a OR z)? ")
			isDown = 0
			if play == 'z':
				isDown = 1
			await ws.send(json.dumps({ 'type': 'pong', 'subtype': 'play', 'isDown': isDown, 'key': play, 'side': 0 }))
			# response = await ws.recv()
			# print(f"< {response}")

params()