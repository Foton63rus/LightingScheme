import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter";
import { USDZExporter } from 'three/addons/exporters/USDZExporter.js';
import { SceneJSONParser} from './sceneJSONParser.js';
import * as ArrangementLoader from "./arrangement.js";

import testJSON from './testObjects.json';

var renderer, scene3d, camera;
var glbLoader;

init();
render();

function init() {
  // renderer
  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setClearColor( 0x000000, 1.0 );
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  // scene
  scene3d = new THREE.Scene();
  scene3d.background = new THREE.Color( 0xf0f0f0 );

  // camera
  camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 1000 );
  camera.position.set( 15, 20, 30 );
  camera.scale.set(1, 1, 1);
  //scene.add( camera );


  // controls
  var controls = new OrbitControls( camera, renderer.domElement );
  controls.addEventListener( 'change', render );
  controls.minDistance = 10;
  controls.maxDistance = 50;

  // ambient
  //scene.add( new THREE.AmbientLight( 0xffffff, 0.1 ) );

  // light
  var light = new THREE.PointLight( 0xffffff, 1 );
  camera.add( light );

  glbLoader = new GLTFLoader();

  let arrangement = new ArrangementLoader.Arrangement();
  arrangement.addObjects(testJSON);
  arrangement.loadObjects2Scene(scene3d, glbLoader);

  render();
}

function render() {
	renderer.render( scene3d, camera );
}