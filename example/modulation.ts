import {
    camera,
    cube,
    material,
    model,
    intersection,
    modulate,
    smoothBox,
    expression,
    random,
    options,
    orbit,
    plane,
    scene,
    sphere,
    spotlight,
    scale,
    translate,
    value,
    viewer
} from '../src';

viewer(
    document.body,

    scene({
        air: material({
            scatter: value(1000),
        }),
        camera: orbit({
            fieldOfView: value(60 / 180 * Math.PI),
            radius: value(10),
            aperture: value(0.1),
            target: value(0, 0, 0),
            offset: value(0.25, -0.5)
        }),
        models: [
            model({
                shape: scale(value(1000),
                    sphere()),
                material: spotlight({
                    color: value(1),
                    direction: value(1, 1, 1),
                    spread: value(0.1),
                    ambient: value(0)
                })
            }),
            model({
                shape: intersection(
                    modulate(value(1, 100, 1), index =>
                        smoothBox(
                            expression(`0.9, 1.0 + 5.0 * ${random(index)}.x, 0.9`),
                            value(0.5))),
                    plane(value(0, 1, 0), value(-6))),
                material: material({
                    color: value(0.7, 0.6, 0.5),
                    smoothness: value(0.99)
                })
            })
        ]
    }), options({
        width: 512,
        height: 512,
    }));

