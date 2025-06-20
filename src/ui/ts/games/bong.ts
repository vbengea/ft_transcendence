import { Data, Game } from '../types';
import * as BABYLON from "@babylonjs/core";
import { gameLoop } from '../events';

var scene = null;

async function bongInit() {
	const canvas : HTMLCanvasElement = document.querySelector("#bong");
	const engine = new BABYLON.Engine(canvas, true);
	scene = await createScene(engine, canvas);
	
	(window as any).scene = scene;

	scene.render();
	window.addEventListener("resize", () => {
		engine.resize();
	});
}

async function createScene(engine, canvas) {
	const scene = new BABYLON.Scene(engine);

	const camera = new BABYLON.ArcRotateCamera(
		"Camera",  
		BABYLON.Tools.ToRadians(0),  
		BABYLON.Tools.ToRadians(0), 50,  
		new BABYLON.Vector3(0,0,0), scene);

	const light1 = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(1, 1, 0), scene);
	const light2 = new BABYLON.PointLight("light2", new BABYLON.Vector3(0, 1, -1), scene);

	const sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter:1}, scene);
	const LEFT = BABYLON.MeshBuilder.CreateTiledBox("right", { width:8, tileSize:1, depth: 1}, scene);
	const RIGHT = BABYLON.MeshBuilder.CreateTiledBox("left", { width:8, tileSize:1, depth: 1}, scene);

	RIGHT.position = new BABYLON.Vector3(0,0,34)
	LEFT.position = new BABYLON.Vector3(0,0,-35)
	sphere.position = new BABYLON.Vector3(0,0,0)

	txt(scene);

	var ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 40, height: 70}, scene);
	ground.position = new BABYLON.Vector3(-0.5,-0.5,0);

	scene.clearColor = new BABYLON.Color4(0.5, 0.8, 0.5, 1);

	const backgroundMaterial = new BABYLON.BackgroundMaterial("backgroundMaterial", scene);
	backgroundMaterial.useRGBColor = false;
	backgroundMaterial.primaryColor = BABYLON.Color3.Black()

	ground.material = backgroundMaterial;

	return scene;
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

export function getLayoutPayloadBong(subtype : string, tournamentId : string) {
	const sc = {
		w: 70,
		h: 40,
		lineHeight: 1
	};

	const paddles = [{
		x: 1,
		y: 8,
		w: 1,
		h: 10,
	},{
		x: 68,
		y: 8,
		w: 1,
		h: 10,
	}]

	const ball = {
		w: 1,
		h: 1,
	};

	bongInit();
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
				
				let LEFT = player.screen.paddles[1].y - boxY/2.0 + 5;
				let RIGHT = player.screen.paddles[0].y - boxY/2.0 + 5;
				let x = player.screen.ball.y - boxY/2.0;
				let z = player.screen.ball.x - boxX/2.0;

				scene.getMeshByName("sphere").position.x = x;
				scene.getMeshByName("sphere").position.z = z;
				scene.getMeshByName("right").position.x = RIGHT;
				scene.getMeshByName("left").position.x = LEFT;
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
