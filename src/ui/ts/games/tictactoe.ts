import { get } from './main';
import { Data, Customization } from '../types';
import * as BABYLON from "@babylonjs/core";
import { send } from '../events';

var tscene = null;
let cl = null;
const mapColor = [
	[],
	[211, 119, 9],
	[45, 92, 242],
	[49, 144, 180],
	[0, 153, 102],
	[183, 21, 214],
	[76, 58, 237],
	[212, 36, 34]
];

async function bongInit1(customization: Customization) {
	const userData = JSON.parse(sessionStorage.TRANSCENDER_USER).user;
	const canvas : HTMLCanvasElement = document.querySelector("#tictactoe");
	const engine = new BABYLON.Engine(canvas, true);

	customization = await (await fetch(`/auth/customization/${userData.customization.id}`)).json();
	tscene = await createScene1(engine, customization);
	
	(window as any).tscene = tscene;

	tscene.render();
	
	window.addEventListener("resize", () => {
		engine.resize();
	});
}

async function createScene1(engine, customization: Customization) {
	const tscene = new BABYLON.Scene(engine);
	const { map, color, camera } = customization;

	cl = color;

	if (camera === 1) {
		new BABYLON.ArcRotateCamera(
			"Camera",  
			BABYLON.Tools.ToRadians(0),  
			BABYLON.Tools.ToRadians(30), 60,  
			new BABYLON.Vector3(5,0,0), tscene);
	} else if (camera === 2) {
		new BABYLON.ArcRotateCamera(
			"Camera",  
			BABYLON.Tools.ToRadians(-90),  
			BABYLON.Tools.ToRadians(30), 60,  
			new BABYLON.Vector3(0,0,-10), tscene);

	} else if (camera === 3) {
		new BABYLON.ArcRotateCamera(
			"Camera",  
			BABYLON.Tools.ToRadians(0),  
			BABYLON.Tools.ToRadians(0), 60,  
			new BABYLON.Vector3(0,0,0), tscene);
	}

	var light = new BABYLON.DirectionalLight("light", new BABYLON.Vector3(0, -1, 0), tscene);
	var light2 = new BABYLON.PointLight("light2", new BABYLON.Vector3(-1, 5, 3), tscene);
	var light3 = new BABYLON.PointLight("light3", new BABYLON.Vector3(3, 0, -5), tscene);
	
	txt(tscene);
	pads(tscene, color);

	var ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 40, height: 70 }, tscene);

	const diffuseTexture = new BABYLON.Texture(`images/maps/${map}a.png`, tscene);
	const detailTexture = new BABYLON.Texture(`images/maps/${map}b.png`, tscene);
	const bumpTexture = new BABYLON.Texture(`images/maps/${map}c.png`, tscene);

	ground.position = new BABYLON.Vector3(-0.5,-0.5,0);

	const setDetailTexture = (mat) => {
		mat.detailMap.isEnabled = true;
		mat.detailMap.texture = detailTexture;
		mat.detailMap.texture.uScale = mat.saveUVScale || 10;
		mat.detailMap.texture.vScale = mat.saveUVScale || 10;
	};

	var matStd = new BABYLON.StandardMaterial("mat", tscene);

	matStd.diffuseTexture = diffuseTexture;
	matStd.detailMap.isEnabled = true;
	matStd.detailMap.diffuseBlendLevel = 0.1;
	matStd.detailMap.bumpLevel = 1;
	matStd.bumpTexture = bumpTexture;
	matStd.bumpTexture.level = 1;
	matStd.detailMap.roughnessBlendLevel = 0.25;

	setDetailTexture(matStd);

	var matPBR = new BABYLON.PBRMaterial("matpbr", tscene);

	matPBR.metallic = 1.0;
	matPBR.roughness = 0.5;
	matPBR.albedoTexture = diffuseTexture;
	matPBR.detailMap.diffuseBlendLevel = 0.1;
	matPBR.detailMap.bumpLevel = 1;
	matPBR.bumpTexture = bumpTexture;
	matPBR.bumpTexture.level = 0.34;
	matPBR.detailMap.roughnessBlendLevel = 0.25;

	setDetailTexture(matPBR);

	var usePBR = false;

	const setMaterial = () => {
		var matDst = usePBR ? matPBR : matStd;
		var matSrc = usePBR ? matStd : matPBR;

		matDst.detailMap.texture = matSrc.detailMap.texture;
		matDst.bumpTexture = matSrc.bumpTexture;
		matDst.detailMap.normalBlendMethod = matSrc.detailMap.normalBlendMethod;
		matDst.detailMap.diffuseBlendLevel = matSrc.detailMap.diffuseBlendLevel;
		matDst.detailMap.bumpLevel = matSrc.detailMap.bumpLevel;
		matDst.detailMap.isEnabled = matSrc.detailMap.isEnabled;
		
		ground.material = matDst;

		light.intensity = usePBR ? 1 : 0.2;
		light2.intensity = usePBR ? 20 : 0.6;
		light3.intensity = usePBR ? 20 : 0.6;
	}

	setMaterial();

	return tscene;
}

function getPosition(i) {
	if (i == 1)
		return new BABYLON.Vector3(-9.0, 0, -9.5);
	else if (i == 2)
		return new BABYLON.Vector3(-9.0, 0, 0);
	else if (i == 3)
		return new BABYLON.Vector3(-9.0, 0, 9.5);
	else if (i == 4)
		return new BABYLON.Vector3(0.5, 0, -9.5);
	else if (i == 5)
		return new BABYLON.Vector3(0.5, 0, 0);
	else if (i == 6)
		return new BABYLON.Vector3(0.5, 0, 9.5);
	else if (i == 7)
		return new BABYLON.Vector3(10, 0, -9.5);
	else if (i == 8)
		return new BABYLON.Vector3(10, 0, 0);
	else if (i == 9)
		return new BABYLON.Vector3(10, 0, 9.5);
}

function pads(scene, color) {
	const LEFT = BABYLON.MeshBuilder.CreateTiledBox("left", { width: 30, tileSize: 1, depth: 1 }, scene);
	const RIGHT = BABYLON.MeshBuilder.CreateTiledBox("right", { width: 30, tileSize: 1, depth: 1 }, scene);

	const LEFT1 = BABYLON.MeshBuilder.CreateTiledBox("left1", { width: 30, tileSize: 1, depth: 1 }, scene);
	const RIGHT1 = BABYLON.MeshBuilder.CreateTiledBox("right1", { width: 30, tileSize: 1, depth: 1 }, scene);

	RIGHT.position = new BABYLON.Vector3(0.5,0,5)
	LEFT.position = new BABYLON.Vector3(0.5,0,-5)

	RIGHT1.position = new BABYLON.Vector3(5.5,0,0)
	LEFT1.position = new BABYLON.Vector3(-4.5,0,0)

	LEFT1.rotate(BABYLON.Axis.Y, -Math.PI/2, BABYLON.Space.WORLD);
	RIGHT1.rotate(BABYLON.Axis.Y, -Math.PI/2, BABYLON.Space.WORLD);

	const mat0 = new BABYLON.BackgroundMaterial("RIGHT_0_COLOR_MAT", scene);
	mat0.useRGBColor = false;
	mat0.primaryColor = BABYLON.Color3.White();
	LEFT.material = mat0;
	RIGHT.material = mat0;
	LEFT1.material = mat0;
	RIGHT1.material = mat0;

	const mat1 = new BABYLON.BackgroundMaterial("RIGHT_1_COLOR_MAT", scene);
	mat1.forceDepthWrite = true;
	mat1.alpha = 0.2;

	for(let i = 1; i <= 9; i++) {
		const box = BABYLON.MeshBuilder.CreateBox(i + '', {size: 8}, scene);
		box.position = getPosition(i);
		box.actionManager = new BABYLON.ActionManager(scene);
		box.actionManager.registerAction(
			new BABYLON.ExecuteCodeAction(
				BABYLON.ActionManager.OnPickTrigger,
				function(evt) {
					send(JSON.stringify({ 
						type: "tictactoe", 
						subtype: "play", 
						isDown: parseInt(evt.source.id) 
					}));
				}
			)
		);
		box.material = mat1;
	}
}

function txt(tscene) {
	const textLen = 2 + 0.5;
	const RIGHT_TEXT = BABYLON.MeshBuilder.CreatePlane("right_text", { width: textLen, height: 3 }, tscene);
	const LEFT_TEXT = BABYLON.MeshBuilder.CreatePlane("left_text", { width: textLen, height: 3 }, tscene);

	RIGHT_TEXT.material = new BABYLON.StandardMaterial("outputplane_right", tscene);
	LEFT_TEXT.material = new BABYLON.StandardMaterial("outputplane_left", tscene);

	const outputplaneTextureRight = new BABYLON.DynamicTexture('texture_right',{ width:220, height:130 }, tscene, true);
	const outputplaneTextureLeft = new BABYLON.DynamicTexture('texture_left',{ width:220, height:130 }, tscene, true);

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

export function getLayoutPayloadTicTacToe(subtype : string, tournamentId : string, tournament: { id: number, totalPlayers: number, organizer: { customization: Customization } }) {
	const sc = {
		w: get(document.body, "width"),
		h: get(document.body, "height")
	};
	bongInit1(tournament.organizer.customization);
	setTimeout(() => tscene.render(), 500);
	return { type: "tictactoe", subtype, screen: sc, tournamentId };
}

function tic(n, ch, cl) {
	const mat2 = new BABYLON.BackgroundMaterial("RIGHT_2_COLOR_MAT", tscene);

	mat2.useRGBColor = false;
	mat2.primaryColor = new BABYLON.Color3(...mapColor[cl].map(c => c/255.0));

	const position = getPosition(n);

	if (ch === 'x') {
		let cylinder = BABYLON.MeshBuilder.CreateCylinder('wmesh-' + n, {
			height: 7,
			diameter: 1
		});
		let newcylinder = cylinder.clone();
		newcylinder.rotation.x = -Math.PI / 2;;
		const mesh = BABYLON.Mesh.MergeMeshes([cylinder, newcylinder], tscene);
		mesh.rotation.y = Math.PI / 4;
		mesh.rotation.z = -Math.PI / 2;
		mesh.position.y = 1;
		mesh.position.x = position._x;
		mesh.position.z = position._z;
		mesh.material = mat2;
		mesh.isVisible = true;
		mesh.id = 'mesh-' + n;

	} else if (ch === 'o') {
		const options = {
			thickness: 1,
			diameter: 5,
			tessellation: 32
		};
		const torus = BABYLON.MeshBuilder.CreateTorus("mesh-" + n, options, tscene);
		torus.material = mat2;
		torus.isVisible = true;
		torus.position = position;
		torus.position.y = 1;
	}

	tscene.render();
}

export function displayTicTacToe(data: Data) {
	const game = data.game;

	let n = 0;
	for (let player of game.players) {
		if (player && tscene) {
			if (n % 2 == 0) {
				tscene.getTextureByName("texture_left").drawText(player.score.toString(), null, 122, "bold 160px verdana", "white", "#08775f");
			} else {
				tscene.getTextureByName("texture_right").drawText(player.score.toString(), null, 122, "bold 160px verdana", "white", "#08775f");
			}
		}
		n++;
	}

	n = 0;
	for (let i = 0; i < game.matrix.length; i++) {
		for (let j = 0; j < game.matrix[i].length; j++) {
			if (!tscene) 
				break;
			const m = tscene.getMeshByID('mesh-' + (n + 1));
			if (m) {
				m.dispose();
			}
			let p = game.matrix[i][j];
			if (p !== '0'){
				let color = game.players[p === 'x' ? 0 : 1].user.customization.color;
				tic(n + 1, p, color);
			}
			n++;
		}
	}
	if (tscene)
		tscene.render();
}
