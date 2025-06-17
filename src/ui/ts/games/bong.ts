import { Data } from '../types';
import { get } from './main';
import { THREEx } from './keyboard';
import * as BABYLON from "@babylonjs/core";

function bongInit() {
	const canvas : HTMLCanvasElement = document.querySelector("#bong");
	const engine = new BABYLON.Engine(canvas, true);
	const keyboard = new THREEx.KeyboardState();
	const scene = createScene(engine);

	let goingUp = false;
	let initialPosition = true;
	let zMovement = Math.floor(Math.random() * 10) / 10;

	engine.runRenderLoop(() => {
		checkMovement(scene, keyboard);
		ballMovement(scene, { initialPosition, goingUp, zMovement });
		scene.render();
	});

	window.addEventListener("resize", () => {
		engine.resize();
	});
}

function createScene(engine) {
	const scene = new BABYLON.Scene(engine);
	const camera = new BABYLON.ArcRotateCamera(
		"Camera",  
		BABYLON.Tools.ToRadians(0),  
		BABYLON.Tools.ToRadians(0), 50,  
		new BABYLON.Vector3(0,0,0), scene);

	scene.gravity = new BABYLON.Vector3(0, -9.81, 0);
	scene.collisionsEnabled = true;
	camera.checkCollisions = true;
	camera.keysUp.push(13);
	camera.keysDown.push(83);
	camera.keysLeft.push(65);
	camera.keysRight.push(68);

	const light1 = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(1, 1, 0), scene);
	const light2 = new BABYLON.PointLight("light2", new BABYLON.Vector3(0, 1, -1), scene);

	const sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter:1.5}, scene);
	const tiledBox = BABYLON.MeshBuilder.CreateTiledBox("box", { width:10, tileSize:1, depth: 1}, scene);
	const tiledBox2 = BABYLON.MeshBuilder.CreateTiledBox("box2", { width:10, tileSize:1, depth: 1}, scene);

	tiledBox.position = new BABYLON.Vector3(0,0,35)
	tiledBox2.position = new BABYLON.Vector3(0,0,-35)
	sphere.position = new BABYLON.Vector3(0,0,0)

	return scene;
}

function checkMovement(scene, keyboard){
	const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
	const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)

	let limit = (vw / vh * 19)
	let isInside = (scene.getMeshByName("box").position.x > limit * -1)
	let isInside2 = ( scene.getMeshByName("box").position.x < limit )

	let box2IsInside = (scene.getMeshByName("box2").position.x > limit * -1)
	let box2IsInside2 = ( scene.getMeshByName("box2").position.x < limit )

	if(keyboard.pressed("K") && isInside){
		scene.getMeshByName("box").position.x -= 1;
	}
	if(keyboard.pressed("M") && isInside2){
		scene.getMeshByName("box").position.x += 1;
	}
	if(keyboard.pressed("A") && box2IsInside){
		scene.getMeshByName("box2").position.x -= 1;
	}
	if(keyboard.pressed("Z") && box2IsInside2){
		scene.getMeshByName("box2").position.x += 1;
	}
}

function ballMovement(scene, { initialPosition, goingUp, zMovement }){
	if(scene.getMeshByName("sphere").intersectsMesh(scene.getMeshByName("box2"), true)){
		initialPosition = false;
		goingUp = true;
	} else if(scene.getMeshByName("sphere").intersectsMesh(scene.getMeshByName("box"), true)){
		initialPosition = false;
		goingUp = false;
	}

	const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
	const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)

	let limit = (vw / vh * 21)
	let isLeaving = (scene.getMeshByName("sphere").position.x > limit * -1)
	let isLeaving2 = ( scene.getMeshByName("sphere").position.x < limit )

	if(!isLeaving || !isLeaving2){
		scene.getMeshByName("sphere").position.z += zMovement * -1
		zMovement = zMovement * -1;
	}

	if(initialPosition || goingUp){
		scene.getMeshByName("sphere").position.z += 0.4;
	} else {
		scene.getMeshByName("sphere").position.z -= 0.4;
	}

	scene.getMeshByName("sphere").position.x -= zMovement;
}

export function getLayoutPayloadBong(subtype : string, tournamentId : string) {
	const sc = {
		w: get(document.body, "width"),
		h: get(document.body, "height")
	};
	bongInit();
	return { type: "bong", subtype, screen: sc, tournamentId };
}

export function displayBong(data: Data) {
	
}
