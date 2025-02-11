import * as THREE from "three";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter";
import { USDZExporter } from 'three/addons/exporters/USDZExporter.js';
import * as Arrangement from "./arrangement.js";
import { MaterialConverter } from "./MaterialConverter.js";

export class SceneManager{
    settings = {};
    camera = null;
    scene3d = null;
    currentObject = null;
    material_converter = null;

    constructor(settings){
        this.settings = settings;

        this.material_converter = new MaterialConverter();

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

        this.settings.arrangement = new Arrangement.Arrangement();
    }

    load(json){
        this.settings.arrangement.addObjects(json);
        this.settings.arrangement.loadObjects2Scene(this.settings);
    }

    deleteMarkObjects(){
        this.scene3d.children.forEach(element => {
            if(element.type === "Group"){
                element.children.forEach( obj => {
                    if(obj.name === "mark"){
                        element.remove(obj);
                    }
                })
            }
        });
    }

    deleteTransformers(){
        this.settings.transformer.reset();
        this.settings.transformer.enabled = false;
        this.scene3d.remove( this.settings.transformer_gizmo );
        this.clearPointer();
    }

    createTestObj(){
        const geometry = new THREE.BoxGeometry( 0.5, 0.5, 0.5 ); 
        const material = new THREE.MeshStandardMaterial( {color: 0x00ff00, side:1}); 
        const material2 = new THREE.MeshStandardMaterial( {color: 0xff0000, side:1} ); 
        const material3 = new THREE.MeshStandardMaterial( {color: 0x0000ff, side:1} ); 
        const cube = new THREE.Mesh( geometry, material ); 
        const cube2 = new THREE.Mesh( geometry, material2 ); 
        const cube3 = new THREE.Mesh( geometry, material3 );
        cube2.position.set(5,0,0);
        cube3.position.set(0,0,-5);
        this.scene3d.add( cube );
        this.scene3d.add( cube2 );
        this.scene3d.add( cube3 );
    }

    setPointer(){

        if(!this.settings.pointerModel) return;

        this.currentObject.children.forEach( x => {
            if(x.name === "mark"){
                x.add(this.settings.pointerModel);
                this.settings.pointerModel.position.copy(x.position);
            }
        });

        let currentColor = this.settings.color[this.currentObject.mark];
        let currentMaterial = this.settings.pointerModel.children[0].material;
        currentMaterial.color.setRGB( currentColor.r, currentColor.g, currentColor.b );
        currentMaterial.emissive.setRGB( currentColor.r, currentColor.g, currentColor.b );
        
    }

    clearPointer(){
        if(this.settings.pointerModel){
            if(this.settings.pointerModel.parent != null){
                this.settings.pointerModel.parent.remove(this.settings.pointerModel);
                //this.scene3d.remove(this.settings.pointerModel);
            }
        }else{
            console.log("pointer model 404");
        }
        
    }

    getSceneCenter(){
        var bounds = this.settings.arrangement.calculateBounds();
        var target = this.settings.arrangement.centerScene(bounds);
        return target;
    }

    fixMaterials(){
        this.material_converter.Fix(this.scene3d);
    }

    downloadGLTF() {
        this.fixMaterials();
        const exporter = new GLTFExporter();
        exporter.parse(this.scene3d, function (gltfJson) {
            //console.log(gltfJson);
            const jsonString = JSON.stringify(gltfJson);
            //console.log(jsonString);
            const link = document.createElement('a');
            link.style.display = 'none';
            document.body.appendChild(link);
            const blob = new Blob([jsonString], { type: 'model/gltf-binary' });
            const blobUrl = URL.createObjectURL(blob);
            link.download = "scene.glb";
            //link.href = blobUrl;
            const intentUrl = `intent://arvr.google.com/scene-viewer/1.0?file=${encodeURIComponent(blobUrl)}#Intent;scheme=https;package=com.google.ar.core;action=android.intent.action.VIEW;S.browser_fallback_url=https://developers.google.com/ar;end`;
            link.href = intentUrl;
            const modelViewer = document.getElementById('my-model-viewer');
            modelViewer.src = blobUrl;
            link.click();
            
            
        }, { binary: true});
    }

    async downloadUSDZ() {
        this.fixMaterials();
        const exporter = new USDZExporter();
        const arraybuffer = await exporter.parseAsync( this.scene3d );
        const blob = new Blob( [ arraybuffer ], { type: 'application/octet-stream' } );
        const link = document.createElement('a');
        link.style.display = 'none';
        document.body.appendChild(link);
        link.href =  URL.createObjectURL( blob );
        console.log(`link: ${link.href}`);
        this.settings.href = link.href;
        const jsonString = JSON.stringify(blob);
        link.download = "scene.usdz";
        link.click();
        console.log("Download requested");
    }

    animate(){
        if(this.settings.pointerModel){
            this.settings.pointerModel.rotation.y -= 0.1;
        }
    }
}