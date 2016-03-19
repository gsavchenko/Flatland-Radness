/// <reference path="_reference.ts"/>

/* 
MAIN GAME FILE
Source file	name:       game.ts
Author’s name:	        George Savcheko and Jason Gunter
Last modified by:       Jason Gunter
Date last modified:     2016-03-16
Program	description:    Create your own simple First Person Perspective game. The game must include hazards for the player to avoid. A scoring
                        system must also be included. You must build your own graphic and sound assets. You must use ThreeJS and a JavaScript 
                        Physics Engine to build your game. 
Revision history:       made the madness 'uphill' and some life functions
THREEJS Aliases
*/
import Scene = Physijs.Scene;
import Renderer = THREE.WebGLRenderer;
import PerspectiveCamera = THREE.PerspectiveCamera;
import BoxGeometry = THREE.BoxGeometry;
import CubeGeometry = THREE.CubeGeometry;
import PlaneGeometry = THREE.PlaneGeometry;
import SphereGeometry = THREE.SphereGeometry;
import Geometry = THREE.Geometry;
import AxisHelper = THREE.AxisHelper;
import LambertMaterial = THREE.MeshLambertMaterial;
import MeshBasicMaterial = THREE.MeshBasicMaterial;
import Material = THREE.Material;
import Mesh = THREE.Mesh;
import Object3D = THREE.Object3D;
import SpotLight = THREE.SpotLight;
import PointLight = THREE.PointLight;
import AmbientLight = THREE.AmbientLight;
import Control = objects.Control;
import GUI = dat.GUI;
import Color = THREE.Color;
import Vector3 = THREE.Vector3;
import Face3 = THREE.Face3;
import Point = objects.Point;
import CScreen = config.Screen;
import Clock = THREE.Clock;
//import TextGeometry = THREE.TextGeometry;

//Custom Game Objects
import gameObject = objects.gameObject;

// Setup a Web Worker for Physijs
Physijs.scripts.worker = "/Scripts/lib/Physijs/physijs_worker.js";
Physijs.scripts.ammo = "/Scripts/lib/Physijs/examples/js/ammo.js";


// setup an IIFE structure (Immediately Invoked Function Expression)
var game = (() => {

    // declare game objects
    var havePointerLock: boolean;
    var element: any;
    var scene: Scene = new Scene(); // Instantiate Scene Object
    var renderer: Renderer;
    var camera: PerspectiveCamera;
    var control: Control;
    var gui: GUI;
    var stats: Stats;
    var blocker: HTMLElement;
    var instructions: HTMLElement;
    var spotLight: SpotLight;
    var groundGeometry: CubeGeometry;
    var groundMaterial: Physijs.Material;
    var ground: Physijs.Mesh;
    var clock: Clock;
    var playerGeometry: CubeGeometry;
    var playerMaterial: Physijs.Material;
    var player: Physijs.Mesh;
    var sphereGeometry: SphereGeometry;
    var sphereMaterial: Physijs.Material;
    var sphere: Physijs.Mesh;
    var coin: Physijs.Mesh;
    var coinGeo: SphereGeometry;
    var coinMaterial: Physijs.Material;
    var keyboardControls: objects.KeyboardControls;
    var mouseControls: objects.MouseControls;
    var isGrounded: boolean;
    var velocity: Vector3 = new Vector3(0, 0, 0);
    var prevTime: number = 0;
    var lives = 1;
    var livesText;
    var collidableMeshList = [];

    function init() {
        // Create to HTMLElements
        blocker = document.getElementById("blocker");
        instructions = document.getElementById("instructions");
        
        updateLives();
        //check to see if pointerlock is supported
        havePointerLock = 'pointerLockElement' in document ||
            'mozPointerLockElement' in document ||
            'webkitPointerLockElement' in document;

        keyboardControls = new objects.KeyboardControls();
        mouseControls = new objects.MouseControls();

        if (havePointerLock) {
            element = document.body;

            instructions.addEventListener('click', () => {

                // Ask the user for pointer lock
                console.log("Requesting PointerLock");

                element.requestPointerLock = element.requestPointerLock ||
                    element.mozRequestPointerLock ||
                    element.webkitRequestPointerLock;

                element.requestPointerLock();
            });

            document.addEventListener('pointerlockchange', pointerLockChange);
            document.addEventListener('mozpointerlockchange', pointerLockChange);
            document.addEventListener('webkitpointerlockchange', pointerLockChange);
            document.addEventListener('pointerlockerror', pointerLockError);
            document.addEventListener('mozpointerlockerror', pointerLockError);
            document.addEventListener('webkitpointerlockerror', pointerLockError);
        }

        // Scene changes for Physijs
        scene.name = "Main";
        scene.fog = new THREE.Fog(0xffffff, 0, 750);
        scene.setGravity(new THREE.Vector3(0, -10, 0));

        scene.addEventListener('update', () => {
            scene.simulate(undefined, 2);
        });

        // setup a THREE.JS Clock object
        clock = new Clock();

        setupRenderer(); // setup the default renderer

        setupCamera(); // setup the camera


        // Spot Light
        spotLight = new SpotLight(0xffffff);
        spotLight.position.set(40, 100, -40);
        spotLight.castShadow = true;
        spotLight.intensity = 1;
        spotLight.lookAt(new Vector3(0, 10, 0));
        spotLight.shadowCameraNear = 2;
        spotLight.shadowCameraFar = 200;
        spotLight.shadowCameraLeft = -5;
        spotLight.shadowCameraRight = 5;
        spotLight.shadowCameraTop = 5;
        spotLight.shadowCameraBottom = -5;
        spotLight.shadowMapWidth = 2048;
        spotLight.shadowMapHeight = 2048;
        spotLight.shadowDarkness = 0.5;
        spotLight.name = "Spot Light";
        scene.add(spotLight);
        console.log("Added spotLight to scene");

        // Burnt Ground
        groundGeometry = new BoxGeometry(100, 1, 30);
        var wallGeo = new BoxGeometry(100, 1, 100);
        //groundGeometry.verticesNeedUpdate = true;
        // Back - Top - Right
        //groundGeometry.vertices[0] = new THREE.Vector3(50, 10, 50);
        // Back - Top - Left
        //groundGeometry.vertices[1] = new THREE.Vector3(50, 10, -50);
        // Back - Bottom - Right
        //groundGeometry.vertices[2] = new THREE.Vector3(50, 9.1, 50);
        // Back - Bottom - Left
        //groundGeometry.vertices[3] = new THREE.Vector3(50, 9.1, -50);
        groundMaterial = Physijs.createMaterial(new LambertMaterial({ color: 0x00ff00 }), 0, 0);            
        ground = new Physijs.ConvexMesh(groundGeometry, groundMaterial, 0);
        ground.receiveShadow = true;
        ground.name = "Ground";
        scene.add(ground);
        console.log("Added Burnt Ground to scene");
        
        var wall = new Physijs.ConvexMesh(wallGeo, groundMaterial, 0);
        wall.receiveShadow = true;
        wall.name = "Wall1";
        wall.rotation.x = 0.8;
        wall.position.set(0,0,0);
        scene.add(wall);
        
        var wall2 = new Physijs.ConvexMesh(wallGeo, groundMaterial, 0);
        wall2.receiveShadow = true;
        wall2.name = "Wall2";
        wall2.rotation.x = -0.8;
        wall2.position.set(0,0,10); 
        scene.add(wall2);
        console.log("Walls Added");4

        // spehere
        sphereGeometry = new SphereGeometry(2, 32, 32);
        sphereMaterial = Physijs.createMaterial(new LambertMaterial({ color: 0x00ff00 }), 0.4, 0);
        sphere = new Physijs.SphereMesh(sphereGeometry, sphereMaterial, 1);
        // coin
        coinGeo = new SphereGeometry(0.5, 32, 32);
        coinMaterial = Physijs.createMaterial(new LambertMaterial({ color: 0xf1ff00 }), 0.4, 0);
        coin = new Physijs.SphereMesh(coinGeo, coinMaterial, 1);
        
        //spawn objects
        spawnCoin();
        spawnBoulders();
        // Player Object
        playerGeometry = new BoxGeometry(2, 2, 2);
        playerMaterial = Physijs.createMaterial(new LambertMaterial({ color: 0x00ff00 }), 0.4, 0);

        player = new Physijs.BoxMesh(playerGeometry, playerMaterial, 1);
        player.position.set(20,5,1.5);
        player.receiveShadow = true;
        player.castShadow = true;
        player.name = "Player";
        player.rotation.y = 0.99;
        scene.add(player);
        console.log("Added Player to Scene");

        player.addEventListener('collision', (event) => {
            if (event.name === "Ground") {
                console.log("player hit the ground");
                isGrounded = true;
            }
            if (event.name === "Sphere") {
                updateLives();
                console.log("player hit the sphere");
            }
        });
        
        //Add camera to player
        player.add(camera);
        camera.position.set(0, 1, 0);

        // add controls
        gui = new GUI();
        control = new Control();
        addControl(control);

        // Add framerate stats
        addStatsObject();
        console.log("Added Stats to scene...");

        document.body.appendChild(renderer.domElement);
        gameLoop(); // render the scene	
        scene.simulate();

        window.addEventListener('resize', onWindowResize, false);
    }

    //PointerLockChange Event Handler
    function pointerLockChange(event): void {
        if (document.pointerLockElement === element) {
            // enable our mouse and keyboard controls
            keyboardControls.enabled = true;
            mouseControls.enabled = true;
            blocker.style.display = 'none';
        } else {
            // disable our mouse and keyboard controls
            keyboardControls.enabled = false;
            mouseControls.enabled = false;
            blocker.style.display = '-webkit-box';
            blocker.style.display = '-moz-box';
            blocker.style.display = 'box';
            instructions.style.display = '';
            console.log("PointerLock disabled");
        }
    }

    //PointerLockError Event Handler
    function pointerLockError(event): void {
        instructions.style.display = '';
        console.log("PointerLock Error Detected!!");
    }

    // Window Resize Event Handler
    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function addControl(controlObject: Control): void {
        /* ENTER CODE for the GUI CONTROL HERE */
    }

    // Add Frame Rate Stats to the Scene
    function addStatsObject() {
        stats = new Stats();
        stats.setMode(0);
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.left = '0px';
        stats.domElement.style.top = '0px';
        document.body.appendChild(stats.domElement);
    }
    
    function spawnBoulders(): void{
        // Sphere Object
        sphere.position.set(0, 1, 1.5);
        sphere.rotation.y = 1;
        sphere.receiveShadow = true;
        sphere.castShadow = true;
        sphere.name = "Sphere";
        scene.add(sphere);
        console.log("Added Sphere to Scene");      
    };
    
    function spawnCoin() {
        // Coin Object
        coin.position.set(0, 1, 1.5);
        coin.receiveShadow = true;
        coin.castShadow = true;
        coin.name = "Coin";
        scene.add(coin);
        console.log("Added Coin to Scene");  
    }
    
    function checkSpawns() {
        if (sphere.position.x < -50 || sphere.position.x > 50) {
            spawnBoulders();
        }
        if (coin.position.x < - 50 || coin.position.x > 50) {
            spawnCoin();
        }
    }
    
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };
    function updateLives(): void{
        var text2 = document.getElementById("lives");
        text2.style.color = "white"
        text2.style.fontSize = "20";
        text2.style.top = 50 + 'px';
        text2.style.left = 50 + 'px';
        text2.innerHTML = "Lives: " + lives--;
    };

    // Setup main game loop
    function gameLoop(): void {
        stats.update();
        
        checkControls();
        
        checkSpawns();

        // render using requestAnimationFrame
        requestAnimationFrame(gameLoop);

        // render the scene
        renderer.render(scene, camera);
    }
    
    function checkControls(): void {
        if (keyboardControls.enabled) {
            velocity = new Vector3();

            var time: number = performance.now();
            var delta: number = (time - prevTime) / 1000;

            if (isGrounded) {
                var direction = new Vector3(0, 0, 0);
                if (keyboardControls.moveLeft) {
                    velocity.x -= 600.0 * delta;
                }
                if (keyboardControls.moveRight) {
                    velocity.x += 600.0 * delta;
                }
                if (keyboardControls.jump) {
                    velocity.y += 4000.0 * delta;
                    if (player.position.y > 4) {
                        isGrounded = false;
                    }
                }

                player.setDamping(0.7, 0.1);
                // Changing player's rotation
                player.setAngularVelocity(new Vector3(0, mouseControls.yaw, 0));
                //player movement
                direction.addVectors(direction, velocity);
                direction.applyQuaternion(player.quaternion);
                if (Math.abs(player.getLinearVelocity().x) < 20 && Math.abs(player.getLinearVelocity().y) < 10) {
                    player.applyCentralForce(direction);
                }
                
                // other objects movement
                var velocity2 = new Vector3();
                var direction2 = new Vector3();
                velocity2.z += 400 * delta;
                direction2.addVectors(direction2, velocity2);
                direction2.applyQuaternion(coin.quaternion);
                if (Math.abs(coin.getLinearVelocity().x) < 20 && Math.abs(coin.getLinearVelocity().y) < 10) {
                    coin.applyCentralForce(direction2);
                }
                
                var velocity3 = new Vector3();
                var direction3 = new Vector3();
                velocity3.z += 400 * delta;
                direction3.addVectors(direction3, velocity3);
                direction3.applyQuaternion(sphere.quaternion);
                if (Math.abs(sphere.getLinearVelocity().x) < 20 && Math.abs(sphere.getLinearVelocity().y) < 10) {
                    sphere.applyCentralForce(direction3);
                }

                cameraLook();

            } // isGrounded ends

            //reset Pitch and Yaw
            mouseControls.pitch = 0;
            mouseControls.yaw = 0;

            prevTime = time;
        } // Controls Enabled ends
        else {
            player.setAngularVelocity(new Vector3(0, 0, 0));
        }
    }
    
    function cameraLook(): void {
        var zenith: number = THREE.Math.degToRad(10);
        var nadir: number = THREE.Math.degToRad(-10);

        var cameraPitch: number = camera.rotation.x + mouseControls.pitch;

        // Constrain the Camera Pitch
        camera.rotation.x = THREE.Math.clamp(cameraPitch, nadir, zenith);
    }

    // Setup default renderer
    function setupRenderer(): void {
        renderer = new Renderer({ antialias: true });
        renderer.setClearColor(0x404040, 1.0);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(CScreen.WIDTH, CScreen.HEIGHT);
        renderer.shadowMap.enabled = true;
        console.log("Finished setting up Renderer...");
    }

    // Setup main camera for the scene
    function setupCamera(): void {
        camera = new PerspectiveCamera(35, config.Screen.RATIO, 0.1, 100);
        // if camera is attached to player - comment next 2 lines
        //camera.position.set(-50, 10, 30);
        //camera.lookAt(new Vector3(0, 0, 0));
        console.log("Finished setting up Camera...");
    }

    window.onload = init;

    return {
        scene: scene
    }

})();
