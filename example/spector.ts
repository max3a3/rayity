import {Spector} from 'spectorjs';
import {Options, scene, options as optionsInit, OptionsOptions} from "../src";
import {renderer} from "../src/renderer";
import sceneOptions from "./simpleScene"

const optionsSetting: OptionsOptions = {
    width:800,
    height:600
}
function app()
{
    let spectorGlDebug = new Spector();
    spectorGlDebug.displayUI();
    const canvas:HTMLCanvasElement = <HTMLCanvasElement>document.getElementById('regl-canvas')!;
    const options = optionsInit(optionsSetting)
    canvas.width = options.width;
    canvas.height = options.height;

    const gl = canvas.getContext("webgl", {
        preserveDrawingBuffer: true
    });
    if (gl === null)
        throw "Could not create WebGL context";
    const variables = {
        time: 0,
        clicked: false,
        mouse: { x: 0.0, y: 0.0 }
    };

    const renderer_ = renderer(gl, scene(sceneOptions), options, variables);

    let start = 0;
    let running = true;

    function loop(time: number) {
        if (!start) start = time;
        variables.time = (time - start) / 1000.0;
        renderer_.render();

        if (running)
            requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);

}
document.addEventListener('DOMContentLoaded', app);
