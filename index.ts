const width = 256;
const height = 256;

const canvas = document.createElement("canvas");
canvas.width = width;
canvas.height = height;
document.body.appendChild(canvas);

const gl = canvas.getContext("webgl");

gl.getExtension("OES_texture_float");

const textures = [0, 1].map(_ => {
	const texture = gl.createTexture();
	gl.bindTexture(WebGLRenderingContext.TEXTURE_2D, texture);
	gl.texParameteri(WebGLRenderingContext.TEXTURE_2D, WebGLRenderingContext.TEXTURE_MAG_FILTER, WebGLRenderingContext.NEAREST);
	gl.texParameteri(WebGLRenderingContext.TEXTURE_2D, WebGLRenderingContext.TEXTURE_MIN_FILTER, WebGLRenderingContext.NEAREST);
	gl.texImage2D(WebGLRenderingContext.TEXTURE_2D, 0, WebGLRenderingContext.RGBA, width, height, 0, WebGLRenderingContext.RGBA, WebGLRenderingContext.FLOAT, null);
	return texture;
});

const framebuffer = gl.createFramebuffer();

const renderFragmentShader = gl.createShader(WebGLRenderingContext.FRAGMENT_SHADER);
gl.shaderSource(renderFragmentShader, `

precision highp float;
varying vec2 uv;
uniform sampler2D texture;

void main() {
	gl_FragColor = texture2D(texture, uv * 0.5 - 0.5);
}

`);
gl.compileShader(renderFragmentShader);

const vertexShader = gl.createShader(WebGLRenderingContext.VERTEX_SHADER);
gl.shaderSource(vertexShader, `

attribute vec2 position;
varying vec2 uv;

void main() {
	gl_Position = vec4(position, 0, 1);
	uv = position.xy;
}

`);
gl.compileShader(vertexShader);

const fragmentShader = gl.createShader(WebGLRenderingContext.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, `

precision highp float;
uniform sampler2D texture;

uniform vec2 resolution;
uniform float time;

varying vec2 uv;

const float epsilon = 0.0001;
const int maxSteps = 256;
const int bounces = 4;
const int samples = 4;

const vec3 target = vec3(0, 0, 0);
const vec3 eye = vec3(0, 0, 5);
const vec3 up = vec3(0, 1, 0);

vec2 rand2n(int seed) {
	vec2 s = uv * (1.0 + time + float(seed));
	// implementation based on: lumina.sourceforge.net/Tutorials/Noise.html
	return vec2(
		fract(sin(dot(s.xy ,vec2(12.9898,78.233))) * 43758.5453),
		fract(cos(dot(s.xy ,vec2(4.898,7.23))) * 23421.631));
}

vec3 ortho(vec3 v) {
	//  See : http://lolengine.net/blog/2013/09/21/picking-orthogonal-vector-combing-coconuts
	return abs(v.x) > abs(v.z) ? vec3(-v.y, v.x, 0.0)  : vec3(0.0, -v.z, v.y);
}

vec3 sample(vec3 normal, int bounce) {
	vec3 o1 = normalize(ortho(normal));
	vec3 o2 = normalize(cross(normal, o1));
	vec2 random = rand2n(bounce);
	random.x *= 2.0 * 3.14159;
	random.y = sqrt(random.y);
	float q = sqrt(1.0 - random.y * random.y);
	return q*(cos(random.x) * o1  + sin(random.x) * o2) + random.y * normal;
}

float sphereDistance(vec3 position) {
	return length(position) - 0.5;
}

vec3 sphereNormal(vec3 position) {
	return normalize(vec3(
		sphereDistance(position + vec3(epsilon, 0, 0)) -
		sphereDistance(position - vec3(epsilon, 0, 0)),
		sphereDistance(position + vec3(0, epsilon, 0)) -
		sphereDistance(position - vec3(0, epsilon, 0)),
		sphereDistance(position + vec3(0, 0, epsilon)) -
		sphereDistance(position - vec3(0, 0, epsilon))));
}

void main() {
	float aspectRatio = resolution.x / resolution.y;
	vec3 look = normalize(target - eye);
	vec3 right = cross(look, up);
	
	for (int l = 0; l < samples; l++) {
		vec2 px = (uv + rand2n(1) / resolution.x) / 4.0;
		
		vec3 direction = normalize(look + right * px.x * aspectRatio + up * px.y);
		vec3 from = eye;
		bool done = false;
		
		vec3 luminance = vec3(1.0, 1.0, 1.0);
		vec3 total = vec3(0, 0, 0);
		
		for (int k = 0; k < bounces; k++) {
			float t = 0.0;
			
			for (int j = 0; j < maxSteps; j++) {
				vec3 position = from + direction * t;
				float minimum = 1e9;
				float distance = 0.0;
				vec3 original = texture2D(texture, uv * 0.5 - 0.5).xyz;
				
				distance = sphereDistance(position);
				if (distance < minimum)
					minimum = distance;
				if (minimum < epsilon) {
					vec3 normal = sphereNormal(position);
					from = position + normal * epsilon;
					vec3 emissive = vec3(0, 0, 0);
					float reflectivity = 0.4;
					float albedo = 0.5;
					vec3 color = vec3(1, 0.5, 0.5);
					
					total += luminance * emissive;
					if (rand2n(3 + k * j).y < reflectivity)
						direction = direction - 2.0 * dot(direction, normal) * normal;
					else
						direction = sample(normal, k * j);
					luminance = luminance * albedo * dot(direction, normal) * color;
					
					break;
				} else {
					t += minimum;
					if (j == maxSteps - 1)
						done = true;
				}
			}
		
			total += luminance * clamp(dot(direction, normalize(vec3(3, 2, 1))), 0.0, 1.0);
			
			if (done)
				break;
		}
		
		vec3 original = texture2D(texture, uv * 0.5 - 0.5).xyz;
		gl_FragColor = vec4(original + (total - original) * 0.1, 1.0);	
	}
}

`);
gl.compileShader(fragmentShader);
if (gl.getShaderInfoLog(fragmentShader))
	throw gl.getShaderInfoLog(fragmentShader);

const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);

const renderProgram = gl.createProgram();
gl.attachShader(renderProgram, vertexShader);
gl.attachShader(renderProgram, renderFragmentShader);
gl.linkProgram(renderProgram);

const vertices = Array(
	-1, -1,
	-1, 1,
	1, 1,
	1, -1);
const indices = Array(0, 1, 2, 0, 2, 3);

const vertexBuffer = gl.createBuffer();
gl.bindBuffer(WebGLRenderingContext.ARRAY_BUFFER, vertexBuffer);
gl.bufferData(WebGLRenderingContext.ARRAY_BUFFER, new Float32Array(vertices), WebGLRenderingContext.STATIC_DRAW);

const indexBuffer = gl.createBuffer()
gl.bindBuffer(WebGLRenderingContext.ELEMENT_ARRAY_BUFFER, indexBuffer);
gl.bufferData(WebGLRenderingContext.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), WebGLRenderingContext.STATIC_DRAW);

gl.useProgram(program);

const resolution = gl.getUniformLocation(program, "resolution");
gl.uniform2f(resolution, width, height);

const time = gl.getUniformLocation(program, "time");
gl.uniform1f(time, 0);

const position = gl.getAttribLocation(program, "position");
gl.enableVertexAttribArray(position);
gl.vertexAttribPointer(position, 2, WebGLRenderingContext.FLOAT, false, 0, 0);

gl.viewport(0, 0, width, height);

function step(t: number, odd: Boolean = false) {
	const read = textures[odd ? 0 : 1];
	const write = textures[odd ? 1 : 0];

	gl.useProgram(program);
	gl.bindTexture(WebGLRenderingContext.TEXTURE_2D, read);
	gl.bindFramebuffer(WebGLRenderingContext.FRAMEBUFFER, framebuffer);
	gl.framebufferTexture2D(WebGLRenderingContext.FRAMEBUFFER, WebGLRenderingContext.COLOR_ATTACHMENT0, WebGLRenderingContext.TEXTURE_2D, write, 0);
	gl.uniform1f(time, t / 1000.0);
	gl.drawElements(WebGLRenderingContext.TRIANGLES, indices.length, WebGLRenderingContext.UNSIGNED_SHORT, 0);

	gl.useProgram(renderProgram);
	gl.bindFramebuffer(WebGLRenderingContext.FRAMEBUFFER, null);
	gl.bindTexture(WebGLRenderingContext.TEXTURE_2D, write);
	gl.drawElements(WebGLRenderingContext.TRIANGLES, indices.length, WebGLRenderingContext.UNSIGNED_SHORT, 0);

	window.requestAnimationFrame(t => step(t, !odd));
}

step(0);