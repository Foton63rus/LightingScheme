import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter";
import { USDZExporter } from 'three/addons/exporters/USDZExporter.js';
import { SceneJSONParser} from './sceneJSONParser.js';
import * as ArrangementLoader from "./arrangement.js";
import {SceneColor} from "./scenecolor.js";

import testJSON from './testObjects.json';

let renderer, scene3d, camera;
let glbLoader;
let settings = {
  objects: {}
};


init();
render();

document.addEventListener( 'mousedown', onDocumentMouseDown );

function onDocumentMouseDown( event ) {    
  event.preventDefault();
  var mouse3D = new THREE.Vector3( ( event.clientX / window.innerWidth ) * 2 - 1,   
                          -( event.clientY / window.innerHeight ) * 2 + 1,  
                          0.5 );     
  var raycaster =  new THREE.Raycaster();                                        
  raycaster.setFromCamera( mouse3D, camera );
  var intersects = raycaster.intersectObjects( Object.values(settings.objects) );
  //console.log(settings.objects);
  if ( intersects.length > 0 ) {
    let currentObject = intersects[ 0 ].object.parent;
    currentObject = currentObject.name == "Scene" ? currentObject : currentObject.parent;
    currentObject = currentObject.name == "Scene" ? currentObject : currentObject.parent;
    const boxSize = new THREE.Box3().setFromObject( currentObject ); 
    console.log(boxSize.getSize(new THREE.Vector3()));
    console.log(currentObject);
      //intersects[ 0 ].object.material.color.setHex( Math.random() * 0xffffff );
  }
}

function init() {
  // renderer
  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setClearColor( 0x000000, 1.0 );
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  // scene
  scene3d = new THREE.Scene();
  settings.scene = scene3d;
  scene3d.background = new THREE.Color( 0x111111 );

  // camera
  camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 1000 );
  settings.camera = camera;
  camera.position.set( 0, 5, 0 );
  camera.scale.set(1, 1, 1);
  scene3d.add( camera );


  // controls
  var controls = new OrbitControls( camera, renderer.domElement );
  controls.addEventListener( 'change', render );
  controls.minDistance = 10;
  controls.maxDistance = 50;

  // ambient
  //scene.add( new THREE.AmbientLight( 0xffffff, 0.1 ) );

  // light
  var light = new THREE.PointLight( 0xffffff, 100 );
  camera.add( light );

  glbLoader = new GLTFLoader();
  settings.glbLoader = glbLoader;

  let arrangement = new ArrangementLoader.Arrangement();
  arrangement.addObjects(testJSON);
  arrangement.loadObjects2Scene(settings);

  createTestObj();

  render();
}

function createTestObj(){
  const geometry = new THREE.BoxGeometry( 0.5, 0.5, 0.5 ); 
  const material = new THREE.MeshBasicMaterial( ); 
  console.log(SceneColor);
  material.color = (SceneColor.green);
  const material2 = new THREE.MeshBasicMaterial( {color: 0xff0000} ); 
  const material3 = new THREE.MeshBasicMaterial( {color: 0x0000ff} ); 
  const cube = new THREE.Mesh( geometry, material ); 
  const cube2 = new THREE.Mesh( geometry, material2 ); 
  const cube3 = new THREE.Mesh( geometry, material3 );
  cube2.position.set(5,0,0);
  cube3.position.set(0,0,-5);
  scene3d.add( cube );
  scene3d.add( cube2 );
  scene3d.add( cube3 );
}

function render() {
	renderer.render( scene3d, camera );
}