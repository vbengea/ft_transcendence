import { Data, Game } from '../types';
import * as BABYLON from "@babylonjs/core";
import { gameLoop } from '../events';

var scene = null;

async function bongInit(paddles) {
	const canvas : HTMLCanvasElement = document.querySelector("#bong");
	const engine = new BABYLON.Engine(canvas, true);

	scene = await createScene(engine, paddles);
	
	(window as any).scene = scene;

	scene.render();
	
	window.addEventListener("resize", () => {
		engine.resize();
	});
}

async function createScene(engine, paddles) {
	const scene = new BABYLON.Scene(engine);

	const camera = new BABYLON.ArcRotateCamera(
		"Camera",  
		BABYLON.Tools.ToRadians(0),  
		BABYLON.Tools.ToRadians(0), 60,  
		new BABYLON.Vector3(0,0,0), scene);

	const light1 = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(1, 1, 0), scene);
	const light2 = new BABYLON.PointLight("light2", new BABYLON.Vector3(0, 1, -1), scene);

	const sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter:1}, scene);
	
	pads(scene, paddles);

	sphere.position = new BABYLON.Vector3(0,0,0)

	txt(scene);

	var ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 40, height: 70}, scene);
	ground.position = new BABYLON.Vector3(-0.5,-0.5,0);

	scene.clearColor = new BABYLON.Color4(0.5, 0.8, 0.5, 1);

	const backgroundMaterial = new BABYLON.StandardMaterial("backgroundMaterial", scene);
	backgroundMaterial.bumpTexture = new BABYLON.Texture("PATH TO NORMAL MAP", scene);



	// backgroundMaterial.useRGBColor = false;
	// backgroundMaterial.primaryColor = BABYLON.Color3.Black()

	ground.material = backgroundMaterial;

	return scene;
}

function pads(scene, paddles) {
	const LEFT = BABYLON.MeshBuilder.CreateTiledBox("left", { width: paddles[0].h, tileSize: 1, depth: 1 }, scene);
	const RIGHT = BABYLON.MeshBuilder.CreateTiledBox("right", { width: paddles[1].h, tileSize: 1, depth: 1 }, scene);

	RIGHT.position = new BABYLON.Vector3(0,0,34)
	LEFT.position = new BABYLON.Vector3(0,0,-35)

	if (paddles.length > 2) {
		const LEFT2 = BABYLON.MeshBuilder.CreateTiledBox("left2", { width: paddles[2].h, tileSize: 1, depth: 1 }, scene);
		const RIGHT2 = BABYLON.MeshBuilder.CreateTiledBox("right2", { width: paddles[3].h, tileSize: 1, depth: 1 }, scene);


		const mat1 = new BABYLON.BackgroundMaterial("RIGHT_1_COLOR_MAT", scene);
		mat1.useRGBColor = false;
		mat1.primaryColor = BABYLON.Color3.Red();
		LEFT.material = mat1;

		const mat2 = new BABYLON.BackgroundMaterial("RIGHT_2_COLOR_MAT", scene);
		mat2.useRGBColor = false;
		mat2.primaryColor = BABYLON.Color3.Yellow();
		RIGHT.material = mat2;

		// ................................................................................................................

		const mat3 = new BABYLON.BackgroundMaterial("RIGHT_3_COLOR_MAT", scene);
		mat3.useRGBColor = false;
		mat3.primaryColor = BABYLON.Color3.Green();
		LEFT2.material = mat3;

		const mat4 = new BABYLON.BackgroundMaterial("RIGHT_4_COLOR_MAT", scene);
		mat4.useRGBColor = false;
		mat4.primaryColor = BABYLON.Color3.Blue();
		RIGHT2.material = mat4;


		RIGHT2.position = new BABYLON.Vector3(18,0,34)
		LEFT2.position = new BABYLON.Vector3(18,0,-35)

		RIGHT.position = new BABYLON.Vector3(-18,0,34)
		LEFT.position = new BABYLON.Vector3(-18,0,-35)
	}
}

function txt(scene) {
	const textLen = 2 + 0.5;
	const RIGHT_TEXT = BABYLON.MeshBuilder.CreatePlane("right_text", { width: textLen, height: 3 }, scene);
	const LEFT_TEXT = BABYLON.MeshBuilder.CreatePlane("left_text", { width: textLen, height: 3 }, scene);

	RIGHT_TEXT.material = new BABYLON.StandardMaterial("outputplane_right", scene);
	LEFT_TEXT.material = new BABYLON.StandardMaterial("outputplane_left", scene);

	const outputplaneTextureRight = new BABYLON.DynamicTexture('texture_right',{ width:220, height:130 }, scene, true);
	const outputplaneTextureLeft = new BABYLON.DynamicTexture('texture_left',{ width:220, height:130 }, scene, true);

	RIGHT_TEXT.material['diffuseTexture'] = outputplaneTextureRight;
	LEFT_TEXT.material['diffuseTexture'] = outputplaneTextureLeft;
	RIGHT_TEXT.material.backFaceCulling = false;
	LEFT_TEXT.material.backFaceCulling = false;
	
	outputplaneTextureRight.drawText('0', null, 110, "bold 120px verdana", "white", "black");
	outputplaneTextureRight.update();
	outputplaneTextureLeft.drawText('0', null, 110, "bold 120px verdana", "white", "black");
	outputplaneTextureLeft.update();

	RIGHT_TEXT.position = new BABYLON.Vector3(-18,0,3)
	RIGHT_TEXT.rotate(BABYLON.Axis.X, Math.PI/2, BABYLON.Space.WORLD);
	RIGHT_TEXT.rotate(BABYLON.Axis.Y, -Math.PI/2, BABYLON.Space.WORLD);

	LEFT_TEXT.position = new BABYLON.Vector3(-18,0,-3)
	LEFT_TEXT.rotate(BABYLON.Axis.X, Math.PI/2, BABYLON.Space.WORLD);
	LEFT_TEXT.rotate(BABYLON.Axis.Y, -Math.PI/2, BABYLON.Space.WORLD);
}

export function getLayoutPayloadBong(subtype : string, tournamentId : string, tournament: { id: number, totalPlayers: number }) {
	const sc = {
		w: 70,
		h: 40,
		lineHeight: 1
	};

	let paddles = [{
		x: 1,
		y: 8,
		w: 1,
		h: 8,
	},{
		x: 68,
		y: 8,
		w: 1,
		h: 8,
	}]

	if (tournament.totalPlayers > 2) {
		paddles = [{
			x: 1,
			y: 1,
			w: 1,
			h: 6,
		},{
			x: 68,
			y: 1,
			w: 1,
			h: 6,
		},{
			x: 1,
			y: 32,
			w: 1,
			h: 6,
		},{
			x: 68,
			y: 32,
			w: 1,
			h: 6,
		}]
	}

	const ball = {
		w: 1,
		h: 1,
	};

	bongInit(paddles);
	gameLoop();
	return { type: "bong", subtype, screen: sc, paddles, ball, tournamentId };
}

export function displayBong(data: Data) {
	const game : Game = data.game;
	const side : number = data.side;

	let n = 0;
	for (let player of game.players) {
		if (player) {
			if (side == n) {
				const boxY = 40;
				const boxX = 70;
				
				let LEFT = player.screen.paddles[0].y - boxY/2.0 + 3;
				let RIGHT = player.screen.paddles[1].y - boxY/2.0 + 3;
				scene.getMeshByName("right").position.x = RIGHT;
				scene.getMeshByName("left").position.x = LEFT;

				if (player.screen.paddles.length > 2) {
					let LEFT2 = player.screen.paddles[2].y - boxY/2.0 + 3;
					let RIGHT2 = player.screen.paddles[3].y - boxY/2.0 + 3;
					scene.getMeshByName("right2").position.x = RIGHT2;
					scene.getMeshByName("left2").position.x = LEFT2;
				}

				let x = player.screen.ball.y - boxY/2.0;
				let z = player.screen.ball.x - boxX/2.0;

				scene.getMeshByName("sphere").position.x = x;
				scene.getMeshByName("sphere").position.z = z;

				scene.render();
			}

			if (n % 2 == 0) {
				scene.getTextureByName("texture_left").drawText(player.score.toString(), null, 122, "bold 160px verdana", "white", "#08775f");
			} else {
				scene.getTextureByName("texture_right").drawText(player.score.toString(), null, 122, "bold 160px verdana", "white", "#08775f");
			}
		}
		n++;
	}
}
