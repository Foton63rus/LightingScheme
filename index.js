import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter";
import { USDZExporter } from 'three/addons/exporters/USDZExporter.js';
import { SceneJSONParser} from './sceneJSONParser.js';
import * as Arrangement from "./arrangement.js";

import {SceneManager} from "./SceneManager.js";

import testJSON from './testObjects.json';

let renderer

let settings = {
  objects: {}
};
let scene_manager;

let clock = new THREE.Clock();
let delta = 0;
let interval = 1 / 30;

init();
render();

document.addEventListener( 'mousedown', onDocumentMouseDown );

function onDocumentMouseDown( event ) {    
  event.preventDefault();
  var mouse3D = new THREE.Vector3( ( event.clientX / window.innerWidth ) * 2 - 1,   
                          -( event.clientY / window.innerHeight ) * 2 + 1,  
                          0.5 );     
  var raycaster =  new THREE.Raycaster();                                        
  raycaster.setFromCamera( mouse3D, scene_manager.camera );
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

    scene_manager.setPointer(currentObject);
  }
}

function init() {
  // renderer
  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setClearColor( 0x000000, 1.0 );
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  scene_manager = new SceneManager(settings);
  scene_manager.createTestObj();
  console.log(scene_manager);

  // controls
  var controls = new OrbitControls( scene_manager.camera, renderer.domElement );
  controls.addEventListener( 'change', render );
  controls.minDistance = 10;
  controls.maxDistance = 50;

  let arrangement = new Arrangement.Arrangement();
  arrangement.addObjects(testJSON);
  arrangement.loadObjects2Scene(settings);

  render();
}

function render() {
  requestAnimationFrame(render);
  delta += clock.getDelta();
  if (delta  > interval) {
    scene_manager.animate();
    renderer.render( scene_manager.scene3d, scene_manager.camera );

    delta = delta % interval;
  }
}