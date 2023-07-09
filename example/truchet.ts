import {
    camera,
    cube,
    material,
    model,
    intersection,
    truchet,
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
        camera: orbit({
            radius: value(1.54),
            offset: value(-0.2, -0.5),
        }),
        models: [
            model({
                shape: scale(value(1000), sphere()),
                material: spotlight({
                    direction: value(1, 1, 0),
                    spread: value(0.1),
                    color: value(0.5)
                })
            }),
            model({
                shape: plane(value(0, 1, 0), value(0)),
            }),
            model({
                shape: intersection(
                    sphere(),
                    scale(value(0.1),
                        truchet())),
                material: material({
                    color: value(0.9, 0.8, 0.4),
                    smoothness: value(0.999)
                })
            })
        ]
    })
, options({
    width: 512,
    height: 512,
}));

