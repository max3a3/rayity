import { camera, cube, material, model, options, orbit, plane, scene, sphere, translate, value, viewer } from '../src';

viewer(
    document.body,
    scene({
        camera: orbit({
            radius: value(4),
            offset: value(0.25, -0.5)
        }),
        models: [
            model({
                shape: plane(value(0, 1, 0), value(0.5)),
                material: material({
                    color: value(0.6)
                })
            }),
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
    }), options({
        width: 512,
        height: 512,
    }));
