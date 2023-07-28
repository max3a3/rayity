#version 300 es
precision highp float;

in vec2 uv;
uniform highp sampler2D iTexture;
out vec4 fragColor;

void main() {
    //    fragColor = texture(iTexture,  uv * 0.5 + 0.5);  // no gamma correction

    vec4 result = texture(iTexture, uv * 0.5 + 0.5);
    //    fragColor = vec4(pow(result.xyz / result.w, vec3(1.0 / ${options.gamma.toFixed(10)})), 1.0);
        fragColor = vec4(pow(result.xyz / result.w, vec3(1.0 / 2.2)), 1.0);
}