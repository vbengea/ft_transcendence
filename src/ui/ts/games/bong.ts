import { Data, Game, Customization } from '../types';
import * as BABYLON from "@babylonjs/core";
import { gameLoop } from '../events';

var scene = null;
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
const width = 40;
const height = 90;

async function bongInit(paddles, customization: Customization) {
	const userData = JSON.parse(sessionStorage.TRANSCENDER_USER).user;
	const canvas : HTMLCanvasElement = document.querySelector("#bong");
	const engine = new BABYLON.Engine(canvas, true);

	customization = await (await fetch(`/auth/customization/${userData.customization.id}`)).json();

	scene = await createScene(engine, paddles, customization);
	
	(window as any).scene = scene;

	scene.render();
	
	window.addEventListener("resize", () => {
		engine.resize();
	});
}

async function createScene(engine, paddles, customization: Customization) {
	const scene = new BABYLON.Scene(engine);
	const { map, color, camera } = customization;

	if (camera === 1) {
		new BABYLON.ArcRotateCamera(
			"Camera",  
			BABYLON.Tools.ToRadians(0),  
			BABYLON.Tools.ToRadians(70), 60,  
			new BABYLON.Vector3(10,0,0), scene);

	} else if (camera === 2) {
		new BABYLON.ArcRotateCamera(
			"Camera",  
			BABYLON.Tools.ToRadians(-90),  
			BABYLON.Tools.ToRadians(70), 60,  
			new BABYLON.Vector3(0,0,-20), scene);

	} else if (camera === 3) {
		new BABYLON.ArcRotateCamera(
			"Camera",  
			BABYLON.Tools.ToRadians(0),  
			BABYLON.Tools.ToRadians(0), 60,  
			new BABYLON.Vector3(0,0,0), scene);
	}

    var light = new BABYLON.DirectionalLight("light", new BABYLON.Vector3(0, -1, 0), scene);
    var light2 = new BABYLON.PointLight("light2", new BABYLON.Vector3(-1, 5, 3), scene);
    var light3 = new BABYLON.PointLight("light3", new BABYLON.Vector3(3, 0, -5), scene);

	const sphere = BABYLON.MeshBuilder.CreateSphere("sphere", { diameter: 0.75 }, scene);
	sphere.position = new BABYLON.Vector3(0,0,0)
	
	pads(scene, paddles, color);
	txt(scene);

    var ground = BABYLON.MeshBuilder.CreateGround("ground", { width, height }, scene);

    const diffuseTexture = new BABYLON.Texture(`images/maps/${map}a.png`, scene);
    const detailTexture = new BABYLON.Texture(`images/maps/${map}b.png`, scene);
    const bumpTexture = new BABYLON.Texture(`images/maps/${map}c.png`, scene);

	ground.position = new BABYLON.Vector3(-0.5,-0.5,0);

    const setDetailTexture = (mat) => {
        mat.detailMap.isEnabled = true;
        mat.detailMap.texture = detailTexture;
        mat.detailMap.texture.uScale = mat.saveUVScale || 10;
        mat.detailMap.texture.vScale = mat.saveUVScale || 10;
    };

    var matStd = new BABYLON.StandardMaterial("mat", scene);

    matStd.diffuseTexture = diffuseTexture;
    matStd.detailMap.isEnabled = true;
    matStd.detailMap.diffuseBlendLevel = 0.1;
    matStd.detailMap.bumpLevel = 1;
    matStd.bumpTexture = bumpTexture;
    matStd.bumpTexture.level = 1;
    matStd.detailMap.roughnessBlendLevel = 0.25;

    setDetailTexture(matStd);

    var matPBR = new BABYLON.PBRMaterial("matpbr", scene);

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

	return scene;
}

function pads(scene, paddles, color) {
	const LEFT = BABYLON.MeshBuilder.CreateTiledBox("left", { width: paddles[0].h, tileSize: 1, depth: 1 }, scene);
	const RIGHT = BABYLON.MeshBuilder.CreateTiledBox("right", { width: paddles[1].h, tileSize: 1, depth: 1 }, scene);

	RIGHT.position = new BABYLON.Vector3(0,0,height/2.0)
	LEFT.position = new BABYLON.Vector3(0,0,-height/2.0)
	LEFT.id = 'paddle-0';
	RIGHT.id = 'paddle-1';

	const mat0 = new BABYLON.BackgroundMaterial("RIGHT_0_COLOR_MAT", scene);
	mat0.useRGBColor = false;
	mat0.primaryColor = new BABYLON.Color3(...mapColor[color].map(c => c/255.0));

	const mat00 = new BABYLON.BackgroundMaterial("RIGHT_00_COLOR_MAT", scene);
	mat00.useRGBColor = false;
	mat00.primaryColor = new BABYLON.Color3(...mapColor[color].map(c => c/255.0));

	LEFT.material = mat0;
	RIGHT.material = mat00;

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
		LEFT2.id = 'paddle-3';

		const mat4 = new BABYLON.BackgroundMaterial("RIGHT_4_COLOR_MAT", scene);
		mat4.useRGBColor = false;
		mat4.primaryColor = BABYLON.Color3.Blue();
		RIGHT2.material = mat4;
		RIGHT2.id = 'paddle-4';

		RIGHT2.position = new BABYLON.Vector3(18,0,height/2.0)
		LEFT2.position = new BABYLON.Vector3(18,0,-height/2.0)

		RIGHT.position = new BABYLON.Vector3(-18,0,height/2.0)
		LEFT.position = new BABYLON.Vector3(-18,0,-height/2.0)
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

export function getLayoutPayloadBong(subtype : string, tournamentId : string, tournament: { id: number, totalPlayers: number, organizer: { customization: Customization } }) {
	const sc = {
		w: height,
		h: width,
		lineHeight: 1
	};

	const padH = 8;

	let paddles = [{
		x: 1,
		y: padH,
		w: 1,
		h: padH,
	},{
		x: height,
		y: padH,
		w: 1,
		h: padH,
	}]

	if (tournament.totalPlayers > 2) {
		const padH = 6;
		paddles = [{
			x: 1,
			y: 1,
			w: 1,
			h: padH,
		},{
			x: height,
			y: 1,
			w: 1,
			h: 6,
		},{
			x: 1,
			y: width/2.0 - padH,
			w: 1,
			h: padH,
		},{
			x: height,
			y: width/2.0 - padH,
			w: 1,
			h: padH,
		}]
	}

	const ball = {
		w: 1,
		h: 1,
	};

	bongInit(paddles, tournament.organizer.customization);
	gameLoop();
	return { type: "bong", subtype, screen: sc, paddles, ball, tournamentId };
}

export function displayBong(data: Data) {
	const game : Game = data.game;
	const side : number = data.side;

	let n = 0;
	for (let player of game.players) {
		const mesh = scene.getMeshById('paddle-' + player.paddleIndex);
		if (mesh){
			mesh.material.primaryColor = new BABYLON.Color3(...mapColor[player.user.customization.color].map(c => c/255.0));
		}
		if (player) {

			if (side == n) {
				const boxY = width;
				const boxX = height;
				
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
			}

			if (n % 2 == 0) {
				scene.getTextureByName("texture_left").drawText(player.score.toString(), null, 122, "bold 160px verdana", "white", "#08775f");
			} else {
				scene.getTextureByName("texture_right").drawText(player.score.toString(), null, 122, "bold 160px verdana", "white", "#08775f");
			}
		}
		n++;
	}
	scene.render();
}
