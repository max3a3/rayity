import {cube, material, model, orbit, plane, SceneOptions, sphere, translate, value} from "../src";

const sceneOptions:SceneOptions= {
    camera: orbit({
        radius: value(4),
        offset: value(0.25, -0.5)
    }),
    models: [

        model({
            shape: translate(value(-0.5, 0, 0),
                sphere()),
            material: material({
                color: value(0.8, 0.4, 0.8)
            })
        }),
        model({
            shape: translate(value(0.5, 0, 0),
                cube()),
            material: material({
                color: value(0.8, 0.9, 0.1)
            })
        })
    ]
}

export default sceneOptions