#version 330 core
layout (location = 0) in vec3 position;
layout (location = 1) in vec3 normal;
layout (location = 2) in vec2 texCoords;


void main()
{
	vec3 vertex = position*2.0 - vec3(1.0);
  	gl_Position = vec4(vertex, 1.0f);
}