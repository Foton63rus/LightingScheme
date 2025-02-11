import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { ARButton } from 'three/addons/webxr/ARButton.js';
import {SceneManager} from "./SceneManager.js";

import testJSON from './testObjects.json';

let renderer;

let settings = {
  transformer: null, 
  transformer_gizmo: null,
  objects: {},
  color: {
    "red":      {r:1, g:0, b:0},
    "orange":   {r:1, g:0.5, b:0},
    "yellow":   {r:1, g:1, b:0},
    "green":    {r:0, g:1, b:0},   
    "lightblue":{r:0, g:0.5, b:1},  
    "blue":     {r:0, g:0, b:1},  
    "pink":     {r:1, g:0, b:0.5},  
    "violet":   {r:1, g:0, b:1},  
    "white":    {r:1, g:1, b:1}, 
  }
};
let scene_manager, orbit, transformer, transformer_gizmo;

let clock = new THREE.Clock();
let delta = 0;
let interval = 1 / 30;

init();
render();

document.addEventListener( 'mousedown', onDocumentMouseDown );
document.getElementById('btn_glb_convert').onclick = glbConvert;
document.getElementById('btn_usdz_convert').onclick = usdzConvert;
document.getElementById('btn_ar').onclick = enterAR;

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
    console.log(transformer);

    let currentObject = intersects[ 0 ].object.parent;
    currentObject = currentObject.name == "Scene" ? currentObject : currentObject.parent;
    currentObject = currentObject.name == "Scene" ? currentObject : currentObject.parent; //need too
    const boxSize = new THREE.Box3().setFromObject( currentObject ); 
    scene_manager.currentObject = currentObject;
    currentObject.onClick();

    scene_manager.setPointer();


    transformer.attach( currentObject );
    transformer.enabled = true;
    transformer_gizmo = transformer.getHelper();
    settings.transformer_gizmo = transformer_gizmo;
    scene_manager.scene3d.add( transformer_gizmo );

  }else{
    //scene_manager.clearPointer();
  }
}

function init() {
  // renderer
  renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setClearColor( 0x000000, 1.0 );
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  scene_manager = new SceneManager(settings);
  //scene_manager.createTestObj();
  console.log(scene_manager);
  scene_manager.load(testJSON);

  // controls orbit
  orbit = new OrbitControls( scene_manager.camera, renderer.domElement );
  orbit.addEventListener( 'change', render );
  orbit.minDistance = 5;
  orbit.maxDistance = 50;

  var target = scene_manager.getSceneCenter();
  orbit.target = target;
  orbit.update();

  transformer = new TransformControls( scene_manager.camera, renderer.domElement );
  settings.transformer = transformer;
  transformer.showY = false;
  transformer.addEventListener( 'change', render );
  transformer.addEventListener( 'dragging-changed', function ( event ) {
    orbit.enabled = ! event.value;
  } );

  keyInit();
  render();
}

function keyInit(){
  window.addEventListener( 'resize', onWindowResize );
  window.addEventListener( 'keydown', function ( event ) {

    switch ( event.key ) {

      case 'q':
        transformer.setSpace( transformer.space === 'local' ? 'world' : 'local' );
        break;

      case 'Shift':
        transformer.setTranslationSnap( 1 );
        transformer.setRotationSnap( THREE.MathUtils.degToRad( 15 ) );
        transformer.setScaleSnap( 0.25 );
        break;

      case 'w':
        transformer.setMode( 'translate' );
        transformer.showX = true;
        transformer.showY = false;
        transformer.showZ = true;
        break;

      case 'e':
        transformer.setMode( 'rotate' );
        transformer.showX = false;
        transformer.showY = true;
        transformer.showZ = false;
        break;

      case '+':
      case '=':
        transformer.setSize( transformer.size + 0.1 );
        break;

      case '-':
      case '_':
        transformer.setSize( Math.max( transformer.size - 0.1, 0.1 ) );
        break;

      case 'Escape':
        scene_manager.deleteTransformers();
        break;

    }

  } );

  window.addEventListener( 'keyup', function ( event ) {
    switch ( event.key ) {
      case 'Shift':
        transformer.setTranslationSnap( null );
        transformer.setRotationSnap( null );
        transformer.setScaleSnap( null );
        break;
    }
  } );
}

function onWindowResize() {
  if (renderer.xr.isPresenting) {
    return;
  }
  const aspect = window.innerWidth / window.innerHeight;

  let cameraPersp = scene_manager.camera;
  cameraPersp.aspect = aspect;
  cameraPersp.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

  render();

}

function render() {
  renderer.setAnimationLoop(function () {
    renderer.render(scene_manager.scene3d, scene_manager.camera);
  });
  if (renderer.xr.isPresenting) {
    return;
  }
  /*requestAnimationFrame(render);
  delta += clock.getDelta();
  if (delta  > interval) {
    scene_manager.animate();
    renderer.render( scene_manager.scene3d, scene_manager.camera );

    delta = delta % interval;
  }*/
}

function glbConvert(){
  scene_manager.deleteTransformers();
  //.deleteMarkObjects();
  scene_manager.downloadGLTF();
}

function usdzConvert(){
  scene_manager.deleteTransformers();
  //scene_manager.deleteMarkObjects();
  scene_manager.downloadUSDZ();
}

function enterAR() {
  renderer.xr.enabled = true;
  orbit.enabled = false;
  transformer.enabled = false;
  document.body.appendChild(ARButton.createButton(renderer, { requiredFeatures: ['hit-test'] }));

  renderer.xr.addEventListener('sessionend', () => {
    orbit.enabled = true; // Восстанавливаем OrbitControls
    transformer.enabled = true; // Восстанавливаем TransformControls
    renderer.xr.enabled = false; // Отключаем WebXR
    document.body.removeChild(arButton); // Убираем кнопку AR
  });
  
}