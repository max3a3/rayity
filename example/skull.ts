
import {
    rotateZ,
    skull,
    material,
    model,
    intersection,
    modulate,
    smoothBox,
    expression,
    repeat,
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
        radius: value(3),
        offset: value(-0.3, -0.4),
        aperture: value(0.1)
    }),
    models: [
        model({
            shape: scale(value(1000), sphere()),
            material: spotlight({
                direction: value(1, 1, 0),
                spread: value(0.1),
                color: value(0.5),
                ambient: value(1)
            })
        }),
        model({
            shape: plane(value(0, 1, 0), value(0.3)),
            material: material({
                color: value(0.5)
            })
        }),
        model({
            shape: repeat(value(1.3, 0, 1),
                rotateZ(value(-Math.PI / 4), skull())),
            material: material({
                smoothness: value(0.99),
                color: value(0.4, 0.6, 0.8)
            })
        })
    ]
})

, options({
    width: 512,
    height: 512,
}));

