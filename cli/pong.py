import requests
import ssl
from pynput import keyboard

# LOGIN ...................................................................

print('Frontier **********')
ip = input('ip: ')
BASE_URL = f'https://{ip}:3000'
url = f'{BASE_URL}/auth/login'
email = input('email: ')
password = input('password: ')
myobj = { "email": email, "password": password }
session = requests.Session()
x = session.post(url, json = myobj, verify=False)
headers = session.cookies.get_dict()
headers['Content-Type'] = "application/json; charset=utf-8"
user = x.json()['user']

# REQUEST NEXT MATCH ......................................................

url = f'{BASE_URL}/api/tournaments/current_match'
match = session.get(url, verify=False).json()

if(match and match['id']):

	# CONNECT ..........................................................

	tournamentId = match['round']['tournamentId']

	screen = {
		'w': 70,
		'h': 40,
		'lineHeight': 1
	}
	
	paddles = [{
		'x': 1,
		'y': 8,
		'w': 1,
		'h': 8,
	},{
		'x': 68,
		'y': 8,
		'w': 1,
		'h': 8,
	}]

	ball = {
		'w': 1,
		'h': 1,
	}

	data = { 
		'type': "bong", 
		'subtype': 'connect', 
		'screen': screen, 
		'paddles': paddles, 
		'ball': ball, 
		'tournamentId': tournamentId
	}

	print("\nCONNECT......\n")
	url = f'{BASE_URL}/api/play'
	r = session.post(url, verify=False, json = data).json()

	if(r['playing']):
		print("\nCONNECTED......\n")

		# PLAY LOOP ..................................................

		while True:
			with keyboard.Events() as events:
				event = events.get(1e6)
				isDown = False
				isA = False
				isZ = False
				if event.key == keyboard.KeyCode.from_char('q'):
					data = { 'type': "bong",  'subtype': 'giveup' }
					r = session.post(url, verify=False, json = data).json()
					break
				elif event.key == keyboard.KeyCode.from_char('a'):
					isA = True
				elif event.key == keyboard.KeyCode.from_char('z'):
					isZ = True
				if (isA or isZ):
					data = { 
						'type': "bong", 
						'subtype': 'play', 
						'isDown': isZ, 
						'side': 0, 
						'key': 'a' if isA else 'z',
						'mid': match['id']
					}
					r = session.post(url, verify=False, json = data).json()
					if(not r['playing']):
						print("\nRESULT......\n")
						print()
						break