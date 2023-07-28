import { Options } from './options';
import {Texture, PicoGL} from "picogl";
import { Scene } from './scene';
import RenderFragShader from "./RenderFragShader.glsl?raw"
import VertShader from "./VertShader.glsl?raw"
import {build} from "./build";

const ENV_FLAG = {
    testTexture:false
}
export interface Renderer2 {
    /** Render function */
    readonly render: () => void;
    renderTestTexture:()=>void;
}
/** A 2D point */
export interface Point {
    /** X coordinate */
    x: number;
    /** Y coordinate */
    y: number;
}

/** Interface to store scene variables */
export interface Variables {
    /* Scene time in seconds */
    time: number;
    /** If mouse is clicked */
    clicked: boolean;
    /** Mouse position */
    mouse: Point;
}

export function renderer2(
    canvas: any,
    scene: Scene,
    options: Options,
    variables?: Variables): Renderer2 {

    let picoglRef = PicoGL.createApp(canvas)
        .clearColor(0.0, 0.0, 0.0, 1.0)
    let app = picoglRef

    const textures = [0, 1].map(_ => {

        const texture =  app.createTexture2D(options.width, options.height,
            {
           magFilter: PicoGL.NEAREST, minFilter: PicoGL.NEAREST,
            internalFormat: PicoGL.RGBA32F,  // want float in the rgb instead default int
        }
        )
        return texture;
    });


    const framebuffer = app.createFramebuffer();



    const screenSrc = build(scene, options);
    console.log("screenshader",screenSrc)

    let program = app.createProgram(VertShader, screenSrc); // the build shader passed in



    let renderProgram = app.createProgram(VertShader, RenderFragShader); // render to screen


    let positions = app.createVertexBuffer(
        PicoGL.FLOAT,
        2,
        new Float32Array([
            -1.0, 1.0,
            -1.0, -1.0,
            1.0, -1.0,
            -1.0, 1.0,
            1.0, -1.0,
            1.0, 1.0,
        ])
    );
    let triangleArray = app
        .createVertexArray()
        .vertexAttributeBuffer(0, positions)

    let programDrawCall = app.createDrawCall(program, triangleArray); // accumBuffer
    let renderDrawCall = app.createDrawCall(renderProgram, triangleArray); // renderToScreen

    // gl.viewport(0, 0, options.width, options.height);
    app.viewport(0, 0, options.width, options.height);

    let odd = false;

    let testJpg:Texture
    let image:any
    return {
        renderTestTexture:function() {
            if (!image) {
                image = new Image();

                image.onload = function () {
                    testJpg = app.createTexture2D(image, {flipY: true});

                }
                image.src = 'husky.jpg'; // 'webgl-logo.png';
            }
            if (testJpg) {
                renderDrawCall.texture("iTexture", testJpg)
                renderDrawCall.draw()
            }
        },
        render: function () {

            if (ENV_FLAG.testTexture)
                return this.renderTestTexture()
            const read = textures[odd ? 0 : 1];
            const write = textures[odd ? 1 : 0];

            const variables_ = Object.assign({
                time: 0,
                clicked: false,
                mouse: { x: 0, y: 0 }
            }, variables || {});

            framebuffer.colorTarget(0,write)

            // todo sanity test, remove later
             if (app.gl.checkFramebufferStatus(app.gl.FRAMEBUFFER) != app.gl.FRAMEBUFFER_COMPLETE)
                 throw "Framebuffer not ready";

            programDrawCall.uniform("iTime", variables_.time);
            // todo originally outside the frame loop as it stay the same
            programDrawCall.uniform("iResolution", [options.width, options.height])

            programDrawCall.uniform("iMouse", [variables_.mouse.x, variables_.mouse.y])
            programDrawCall.uniform("iClicked" ,variables_.clicked ? 1 : 0);


            app.drawFramebuffer(framebuffer);
            programDrawCall.texture("iTexture",read)
            programDrawCall.draw()


            app.defaultDrawFramebuffer();
            renderDrawCall.texture("iTexture",write)
            renderDrawCall.draw()

            odd = !odd;
        }
    };

}