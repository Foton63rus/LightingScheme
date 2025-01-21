import * as THREE from "three";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class SceneManager{
    settings = {};
    camera = null;
    scene3d = null;
    
    constructor(settings){
        this.settings = settings;

        // scene
        this.scene3d = new THREE.Scene();
        this.settings.scene = this.scene3d;
        this.settings.objects = {};
        this.scene3d.background = new THREE.Color( 0xffffff );

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

        settings.glbLoader.load(
            "assets/models/pointer.glb",
            function ( gltf ) {
                settings.pointerModel = gltf.scene;
            },
            function ( xhr ) { },
            function ( error ) {
                console.log( `An error happened: ${error}` );
            }
        ); 
    }

    deleteMarkObjects(){
        console.log("element");
        for (let index = 0; index < this.scene3d.children.length; index++) {
            const element = array[index];
            console.log(element.name);
        }
    }

    createTestObj(){
        const geometry = new THREE.BoxGeometry( 0.5, 0.5, 0.5 ); 
        const material = new THREE.MeshBasicMaterial( {color: 0x00ff00}); 
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

    setPointer(object){
        if(!this.settings.pointerModel) return;

        if(this.settings.pointerModel.parent != this.scene3d){
            this.scene3d.add(this.settings.pointerModel);
        }

        const boxSize = new THREE.Box3().setFromObject( object ); 
        this.settings.pointerModel.position.set( object.position.x, boxSize.getSize(new THREE.Vector3()).y + 0.5, object.position.z );

        let currentColor = this.settings.color[object.mark];
        let currentMaterial = this.settings.pointerModel.children[0].material;
        currentMaterial.color.setRGB( currentColor.r, currentColor.g, currentColor.b );
        currentMaterial.emissive.setRGB( currentColor.r, currentColor.g, currentColor.b );
    }

    clearPointer(){
        if(this.settings.pointerModel){
            if(this.settings.pointerModel.parent == this.scene3d){
                this.scene3d.remove(this.settings.pointerModel);
            }
        }else{
            console.log("pointer model 404");
        }
        
    }

    animate(){
        if(this.settings.pointerModel){
            this.settings.pointerModel.rotation.y -= 0.1;
        }
    }
}