#version 400 core
#define EPSILON 0.000001

//Luz
struct DirLight {
    vec3 direction;
    vec3 position;
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
};


in vec2 TexCoords;
in vec3 normales;
in vec3 FragPos;


out vec4 color;

uniform DirLight dirLight;
uniform vec3 view_vec;
uniform sampler2D texture_diffuse1;
uniform int width;
uniform int height;


//Para la luz del sponza (puntual)
vec3 CalcPointLight(DirLight light, vec3 normal, vec3 fragPos, vec3 viewDir){    

    vec3 lightDir = normalize(light.direction - fragPos);
    // Calculo el difuso
    float diff = max(dot(normal, lightDir), 0.0);
    // Calculo el especular
    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
    // Atenuacion por ser luz puntual
    float distance = length(light.direction - fragPos);
    float attenuation = 1.0f / (1.0 + 0.007 * distance + 0.0002 * (distance * distance));    
    // Combino todo
    vec3 ambient = light.ambient * vec3(texture(texture_diffuse1, TexCoords));
    vec3 diffuse = light.diffuse * diff * vec3(texture(texture_diffuse1, TexCoords));
    vec3 specular = light.specular * spec * vec3(texture(texture_diffuse1, TexCoords));
    ambient *= attenuation * 1.0;
    diffuse *= attenuation * 1.0;
    specular *= attenuation * 1.0;

    return (ambient + diffuse + specular);
}

void main()
{    
    vec3 norm = normalize(normales);
    vec3 viewDir = normalize(view_vec - FragPos);

    vec3 result = CalcPointLight(dirLight, norm, FragPos, viewDir); //Primera luz

    color = vec4(result, 1.0);

}