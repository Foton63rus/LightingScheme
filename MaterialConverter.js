import * as THREE from "three";
export class MaterialConverter{

    constructor(){

    }

    Fix(scene){
        scene.children.forEach(element => {
            this.FixObject(element);
        });
    }

    FixObject(object){
        if(object.material){
            switch (object.material.type) {
                case "MeshStandardMaterial":
                    this.StandartFix(object);
                    break;
                case "MeshBasicMaterial":
                    this.Basic2Standart(object);
                    break;
                case "MeshPhysicalMaterial":
                    this.Physical2Standart(object);
                    break;
                default:
                    console.log(`def: ${object.material.type}`);
                    break;
            }
        }
        if(object.children){
            object.children.forEach(element => {
                this.FixObject(element);
            });
        }
    }

    Basic2Standart(object){
        var basicMaterial = object.material;
        var standartMaterial = new THREE.MeshStandardMaterial({
          color: basicMaterial.color ? basicMaterial.color : 0xFFFFFF,
          alphaMap: basicMaterial.alphaMap ? basicMaterial.alphaMap : null,
          envMap: basicMaterial.envMap ? basicMaterial.envMap : null,
          lightMap: basicMaterial.lightMap ? basicMaterial.lightMap : null,
          map: basicMaterial.map ? basicMaterial.map : null,
          name: basicMaterial.name ? basicMaterial.name : "",
          opacity: basicMaterial.opacity ? basicMaterial.opacity : 1,
          side: 1,
          wireframe: basicMaterial.wireframe ? basicMaterial.wireframe : null,
          //envMap: basicMaterial.envMap ? basicMaterial.envMap : null,
        });
        object.material = standartMaterial;
        object.material.needsUpdate = true;
    }

    Physical2Standart(object){
        var physicalMaterial = object.material;
        var standartMaterial = new THREE.MeshStandardMaterial({
            color: physicalMaterial.color ? physicalMaterial.color : 0xFFFFFF,
            alphaMap: physicalMaterial.alphaMap ? physicalMaterial.alphaMap : null,
            envMap: physicalMaterial.envMap ? physicalMaterial.envMap : null,
            lightMap: physicalMaterial.lightMap ? physicalMaterial.lightMap : null,
            map: physicalMaterial.map ? physicalMaterial.map : null,
            name: physicalMaterial.name ? physicalMaterial.name : "",
            opacity: physicalMaterial.opacity ? physicalMaterial.opacity : 1,
            side: 1,
            wireframe: physicalMaterial.wireframe ? physicalMaterial.wireframe : null,
        });
        object.material = standartMaterial;
        object.material.needsUpdate = true;
    }

    StandartFix(object){
        object.material.side = 1;
    }
}