import * as THREE from "three";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class Arrangement{
    objects = [];

    constructor(){
        this.objects = [];
    }

    addObjects(jsonObject){
        this.objects = [];
        jsonObject.objects.forEach(element => {
            this.objects.push(element);
        });
        console.log(this.objects);
    }

    loadObjects2Scene(scene, glbLoader){
        if(this.objects.length == 0){
            console.log('no objects');
            return;
        }
        this.objects.forEach(element => {
            glbLoader.load(
                // resource URL like '/skate.glb'
                element.model,

                function ( gltf ) {
                    let currentObject = gltf.scene;
                    if(element.rotation){
                        currentObject.rotateY(Math.PI/180*element.rotation);
                    }
                    if(element.position){
                        let pos = element.position
                        currentObject.position.set(pos.x,0,pos.z);
                    }
                    if(element.head_rotation){
                        currentObject.children.forEach(x => {
                            if(x.name == "Head"){
                                x.rotateX(Math.PI/180*element.head_rotation);
                            }
                        });
                    }
                    scene.add( currentObject );
                    
                    gltf.animations; // Array<THREE.AnimationClip>
                    gltf.scene; // THREE.Group
                    gltf.scenes; // Array<THREE.Group>
                    gltf.cameras; // Array<THREE.Camera>
                    gltf.asset; // Object

                    console.log(gltf.scene);
                },
                // called while loading is progressing
                function ( xhr ) {
                    console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
                },
                // called when loading has errors
                function ( error ) {
                    console.log( `An error happened: ${error}` );
                }
            ); 
        });
    }
}