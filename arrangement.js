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
    }

    loadObjects2Scene(settings){
        if(this.objects.length == 0){
            console.log('no objects');
            return;
        }
        this._focusCamera(settings);
        this.objects.forEach(element => {
            settings.glbLoader.load(
                // resource URL like '/modelname.glb'
                element.model,

                function ( gltf ) {
                    let currentObject = gltf.scene;
                    if(element.id){
                        currentObject.objid = element.id;
                        currentObject.onClick = () => {
                            console.log(`on click object: ${currentObject.objid}`);
                        }
                    }
                    if(element.position){
                        let pos = element.position
                        currentObject.position.set(pos.x,0,-pos.z);
                    }
                    if(element.height){
                        let height0;
                        currentObject.children.forEach(x => {
                            if(x.name == "Lift"){
                                height0 = x.position.y;
                                x.scale.setY(element.height);
                                
                            }
                        });
                        currentObject.children.forEach(x => {
                            if(x.name == "Head"){
                                x.position.setY(height0 + element.height);
                            }
                        });
                    }
                    if(element.rotation){
                        currentObject.rotateY(-Math.PI/180*element.rotation);
                    }
                    if(element.head_rotation){
                        currentObject.children.forEach(x => {
                            if(x.name == "Head"){
                                x.rotateX(Math.PI/180*element.head_rotation);
                            }
                        });
                    }
                    if(element.mark){
                        currentObject.mark = element.mark;
                        const geometry = new THREE.SphereGeometry( 0.25, 8, 8 ); 
                        const material = new THREE.MeshBasicMaterial({color: 0xFF0000});
                        const mark_color = settings.color[element.mark];
                        material.color.setRGB(mark_color.r, mark_color.g, mark_color.b);
                        const sphere = new THREE.Mesh( geometry, material ); 
                        const boxSize = new THREE.Box3().setFromObject( currentObject ); 
                        sphere.position.set( 0, boxSize.getSize(new THREE.Vector3()).y + 0.5, 0 );
                        sphere.name = "mark";
                        currentObject.add(sphere);
                    }
                    settings.scene.add( currentObject );
                    settings.objects[currentObject.uuid] = currentObject;
                    
                    gltf.animations; // Array<THREE.AnimationClip>
                    gltf.scene; // THREE.Group
                    gltf.scenes; // Array<THREE.Group>
                    gltf.cameras; // Array<THREE.Camera>
                    gltf.asset; // Object
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

    _calculateBounds(){
        let xmin, xmax, zmin, zmax = null;
        this.objects.forEach(element => {
            xmin = (xmin == null || element.position.x < xmin) ? element.position.x : xmin;
            xmax = (xmax == null || element.position.x > xmax) ? element.position.x : xmax;
            zmin = (zmin == null || element.position.z < zmin) ? element.position.z : zmin;
            zmax = (zmax == null || element.position.z > zmax) ? element.position.z : zmax;
        });
        return {xmin: xmin, xmax: xmax, zmin: zmin, zmax: zmax}
    }

    _focusCamera(settings){
        var camera = settings.camera;
        var bounds = this._calculateBounds();
        var target = new THREE.Vector3((bounds.xmin+bounds.xmax)/2, 0, -(bounds.zmin+bounds.zmax)/2);
        var maxWide = Math.max((bounds.xmax-bounds.xmin), (bounds.zmax-bounds.zmin));
        camera.position.set(target.x, maxWide, -target.z+2);
        camera.lookAt(target);
        return null;
    }
}