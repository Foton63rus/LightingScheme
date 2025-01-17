import * as THREE from "three";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import {SceneColor} from "./scenecolor.js";

export class SceneManager{
    settings = {};
    camera = null;
    scene3d = null;
    
    constructor(settings){
        this.settings = settings;

        // scene
        this.scene3d = new THREE.Scene();
        settings.scene = this.scene3d;
        this.scene3d.background = new THREE.Color( 0x111111 );

        // camera
        this.camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 1000 );
        settings.camera = this.camera;
        this.camera.position.set( 0, 5, 0 );
        this.camera.scale.set(1, 1, 1);
        this.scene3d.add( this.camera );

        // light
        var light = new THREE.PointLight( 0xffffff, 100 );
        this.camera.add( light );

        // loaders
        let glbLoader = new GLTFLoader();
        settings.glbLoader = glbLoader;
    }

    createTestObj(){
        const geometry = new THREE.BoxGeometry( 0.5, 0.5, 0.5 ); 
        const material = new THREE.MeshBasicMaterial( ); 
        //console.log(SceneColor);
        //material.color = (SceneColor.green);
        const material2 = new THREE.MeshBasicMaterial( {color: 0xff0000} ); 
        const material3 = new THREE.MeshBasicMaterial( {color: 0x0000ff} ); 
        const cube = new THREE.Mesh( geometry, material ); 
        const cube2 = new THREE.Mesh( geometry, material2 ); 
        const cube3 = new THREE.Mesh( geometry, material3 );
        cube2.position.set(5,0,0);
        cube3.position.set(0,0,-5);
        this.scene3d.add( cube );
        this.scene3d.add( cube2 );
        this.scene3d.add( cube3 );
      }
}