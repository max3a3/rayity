import { camera, cube, material, model, options, orbit, plane, scene, sphere, translate, value, viewer } from '../src';
import sceneOptions from "./simpleScene";

viewer(
    document.body,
    scene(sceneOptions), options({
        width: 512,
        height: 512,
    }));
