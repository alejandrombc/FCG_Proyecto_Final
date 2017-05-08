#version 330 core
#define EPSILON 0.000001

//Luz
struct DirLight {
    vec3 direction;
    vec3 position;
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
};


out vec4 color;

uniform DirLight dirLight;
uniform vec3 view_vec;
uniform int width;
uniform int height;
uniform float time;
uniform vec3 camera_direction;
uniform vec3 camera_right;
uniform vec3 camera_up;



uniform vec3 esfera1;
uniform vec3 esfera2;
uniform vec3 esfera3;

uniform vec3 triangulo1;
uniform vec3 triangulo2;
uniform vec3 triangulo3;

//Esfera de raytracing
struct Sphere {
    vec3 origin;
    float radius;
    vec4 color;
};

//Cubo de raytracing
struct Cubo {
    vec3 min;
    vec3 max;
    vec4 color;
};


//Triangulos de raytracing
struct Triangle {
    vec3 v1;
    vec3 v2;  
    vec3 v3;
    vec4 color;
};

//Rayo a ser lanzado
struct Ray {
    vec3 origin;
    vec3 direction;
};

Sphere spheres[3]; //Cantidad de esferas en la pantalla
Triangle triangles[8]; //Cantidad de triangulo en pantalla (piso)
Cubo cubos; //Cantidad de cubos en pantalla
 

//Chequear interseccion rayo-esfera
float interesect_ray_sphere(Ray R, Sphere S, out vec3 hitpos, out vec3 normal) {
    vec3 v = R.origin - S.origin;
    float B = dot(R.direction, v);
    float C = dot(v,v) - S.radius * S.radius;
    float B2 = B * B;
    float f = B2 - C;
    if(f < 0.0) {
        return 0.0;
    }
    float s = sqrt(f);
    float t0 = -B + s;
    float t1 = -B - s;
    float t = min(max(t0, 0.0), max(t1, 0.0));
    if(t == 0.0) {
        return 0.0;
    }
    hitpos = R.origin + t * R.direction;
    normal = normalize(hitpos - S.origin);
    return t;
}

//Chequear interseccion rayo-triangulo con el algoritmo de Moller–Trumbore
float triangle_intersection(Triangle tri, Ray ray, out vec3 hitpos ) {
    vec3 e1, e2;  
    vec3 P, Q, T;
    float det, inv_det, u, v;
    float t;

    //Ver vectores que contienen de V1
    e1 = tri.v2 - tri.v1;
    e2 = tri.v3 - tri.v1;
    //Calculando el determinante
    P = cross(ray.direction, e2);
    det = dot(e1, P);

    if(det > -EPSILON && det < EPSILON) return 0.0;
    inv_det = 1.f / det;

    //Calcular distancia de v1 al rayo
    T = ray.origin - tri.v1;

    u = dot(T, P) * inv_det;

    //Interseccion fuera del triangulo
    if(u < 0.f || u > 1.f) return -1.0;

    Q = cross(T, e1);

    v = dot(ray.direction, Q) * inv_det;

    //Interseccion fuera del triangulo
    if(v < 0.f || u + v  > 1.f) return -1.0;

    t = dot(e2, Q) * inv_det;

    if(t > EPSILON) { //Interseccion de Rayo
    hitpos = ray.origin + t * ray.direction;
    return t;
    }

    //No hubo hit alguno
    return -1.0;
}

//Chequear interseccion rayo-caja
float interesect_ray_caja(Cubo cube, Ray ray, out vec3 hitpos) {

    float t = -1.0;

    vec3 dirfrac;
    dirfrac.x = 1.0f / ray.direction.x;
    dirfrac.y = 1.0f / ray.direction.y;
    dirfrac.z = 1.0f / ray.direction.z;
    // lb is the corner of AABB with minimal coordinates - left bottom, rt is maximal corner
    // r.org is origin of ray
    vec3 lb = cube.min;
    vec3 rt = cube.max; 
    float t1 = (lb.x - ray.origin.x)*dirfrac.x;
    float t2 = (rt.x - ray.origin.x)*dirfrac.x;
    float t3 = (lb.y - ray.origin.y)*dirfrac.y;
    float t4 = (rt.y - ray.origin.y)*dirfrac.y;
    float t5 = (lb.z - ray.origin.z)*dirfrac.z;
    float t6 = (rt.z - ray.origin.z)*dirfrac.z;

    float tmin = max(max(min(t1, t2), min(t3, t4)), min(t5, t6));
    float tmax = min(min(max(t1, t2), max(t3, t4)), max(t5, t6));

    // if tmax < 0, ray (line) is intersecting AABB, but the whole AABB is behind us
    if (tmax < 0) {
        t = tmax;
        return -1.0;
    }

    // if tmin > tmax, ray doesn't intersect AABB
    if (tmin > tmax) {
        t = tmax;
        return -1.0;
    }

    t = tmin;

    hitpos = ray.origin + t * ray.direction;
    return t;
}


vec3 refract_real(vec3 origin, vec3 norm, DirLight dirLight, vec3 dir, bool rebote); //Declaraciones de funcion global
vec3 refract_rebote(vec3 origin, vec3 norm, DirLight dirLight, vec3 dir); //Declaraciones de funcion globales

//Trazado de rayos sombra hacia la luz
vec3 shadowRay(Ray r, int figura){

    //VER SI SE MEJORA ESTA FUNCION
    vec3 color = vec3(0.07, 0.07, 0.07);
    vec3 hitpos, normal;
    bool found = false;
    float min_t = 100000.f;
    float t;

    if( figura != 1){
        t = triangle_intersection(triangles[0], r, hitpos);
        if(t >= 0.0){
            found = true;
            color *= 0.2;
        }
    }
    if(figura != 2){
        t = triangle_intersection(triangles[1], r, hitpos);
        if(t >= 0.0){
            found = true;
            color *= 0.2;
        }
    }

    if(figura != 3){ 
        t = interesect_ray_caja(cubos, r, hitpos); //Reviso si hay chooque
        if(t >= 0.0) {
            color *= 0.2;
            found = true;
            min_t = t;
        }
    }

    if(figura != 4){ 
        t = interesect_ray_sphere(r,spheres[0],hitpos,normal); //Reviso si hay chooque

        if(t != 0.0) {
            color *= 0.2;
            found = true;
            min_t = t;
        }
    }
    if(figura != 5){ 
        t = interesect_ray_sphere(r,spheres[1],hitpos,normal); //Reviso si hay chooque

        if(t != 0.0) {
            color *= 0.2;
            found = true;
            min_t = t;
        }
    }
    if(figura != 6){ 
        t = interesect_ray_sphere(r,spheres[2],hitpos,normal); //Reviso si hay chooque

        if(t != 0.0) {
                color *= 0.2;
                found = true;
                min_t = t;
        }
    }

    if(found) return color;
    else return vec3(0.0, 0.0, 0.0);
}

//Calcular iluminacion por phong
vec3 phong(DirLight light, vec3 normales, vec3 hitpos, vec4 color, Ray r, bool es_reflexion){

    //Parte difusa del Blinn-Phong
    vec3 norm = normalize(normales);
    vec3 lightDir = normalize(light.direction - hitpos);
    float diff = max(dot(norm, lightDir), 0.0);
    vec3 diffuse = vec3(0.886, 0.345, 0.133) * (diff * color.xyz );
    vec3 specular = vec3(0.0, 0.0, 0.0);

    if(!es_reflexion){
        //Parte especular del Blinn-Phong
        vec3 viewDir = normalize(r.origin - hitpos);
        vec3 halfwayDir = normalize(lightDir + viewDir);
        float spec = pow(max(dot(norm, halfwayDir), 0.0), 200.0);
        specular = vec3(1.0, 1.0, 1.0) * (spec * vec3(1.0, 1.0, 1.0));
    }

    //Atenuacion (Luz Puntual)
    float distance = length(light.direction - hitpos);
    float attenuation = 1.0f / (1.0 + 0.007 * distance + 0.0002 * (distance * distance)); 

    diffuse *= attenuation * 1.0;
    specular *= attenuation * 1.0;

    return diffuse + specular;
}

//Calculo las normales del piso (formado por dos triangulos)
vec3 calcularNormal(Triangle t1, Triangle t2 , bool primer){

    vec3 U = t1.v2 - t1.v1;
    vec3 V = t1.v3 - t1.v1;

    vec3 normal = vec3(1.0);
    normal.x = (U.y * V.z) - (U.z - V.y);
    normal.y = (U.z * V.x) - (U.x - V.z);
    normal.z = (U.x * V.y) - (U.y - V.x);

    U = t2.v2 - t2.v1;
    V = t2.v3 - t2.v1;

    vec3 normal2 = vec3(1.0);
    normal2.x = (U.y * V.z) - (U.z - V.y);
    normal2.y = (U.z * V.x) - (U.x - V.z);
    normal2.z = (U.x * V.y) - (U.y - V.x);

    //Como comparten vertices tengo que ponderar
    if(primer){
        vec3 normal_final = vec3(normal.x, (normal.y + normal2.y)/2.0, (normal.z + normal2.z)/2.0 );
        return normal_final;
    }else{
        vec3 normal_final = vec3(normal2.x, (normal.y + normal2.y)/2.0, (normal.z + normal2.z)/2.0 );
        return normal_final;
    }
}

//Calculo la normal de una cubo/caja
vec3 calcularNormalCubo(Cubo cube, vec3 hitpos){

    vec3 c = (cube.min + cube.max) * 0.5;
    vec3 p = hitpos - c;
    vec3 d = (cube.min - cube.max) * 0.5;
    float bias = 1.000001;

    vec3 result = normalize(vec3(((p.x / abs(d.x) * bias)),
               ((p.y / abs(d.y) * bias)),
               ((p.z / abs(d.z) * bias))));

    return result;
}

//Calculo la normal de cualquier triangulo
vec3 calcularNormal(Triangle t1){
    vec3 U = t1.v2 - t1.v1;
    vec3 V = t1.v3 - t1.v1;

    vec3 normal = vec3(1.0);
    normal.x = (U.y * V.z) - (U.z - V.y);
    normal.y = (U.z * V.x) - (U.x - V.z);
    normal.z = (U.x * V.y) - (U.y - V.x);

    return normal;
}

//Calculo la normal de la piramide
vec3 calculoNormalPiramide(int triangulo_mandado){

    vec3 normal_t2 = calcularNormal(triangles[2]);
    vec3 normal_t3 = calcularNormal(triangles[3]);
    vec3 normal_t4 = calcularNormal(triangles[4]);
    vec3 normal_t5 = calcularNormal(triangles[5]);
    vec3 normal_t6 = calcularNormal(triangles[6]);
    vec3 normal_t7 = calcularNormal(triangles[7]);

    vec3 v1_ponderado, v2_ponderado, v3_ponderado;

    if( triangulo_mandado == 1){
        v1_ponderado = (normal_t2 + normal_t5 + normal_t6 + normal_t7)/4.0;
        v2_ponderado = (normal_t2 + normal_t3 + normal_t6)/3.0;
        v3_ponderado = (normal_t2 + normal_t3 + normal_t4 + normal_t5)/4.0;
    }
    else if ( triangulo_mandado == 2){
        v1_ponderado = (normal_t2 + normal_t3 + normal_t6)/3.0;
        v2_ponderado = (normal_t3 + normal_t4 + normal_t6 + normal_t7)/4.0;
        v3_ponderado = (normal_t2 + normal_t3 + normal_t4 + normal_t5)/4.0;
    }
    else if ( triangulo_mandado == 3){
        v1_ponderado = (normal_t3 + normal_t4 + normal_t6 + normal_t7)/4.0;
        v2_ponderado = (normal_t4 + normal_t5 + normal_t7)/3.0;
        v3_ponderado = (normal_t2 + normal_t3 + normal_t4 + normal_t5)/4.0;
    }
    else if ( triangulo_mandado == 4){
        v1_ponderado = (normal_t4 + normal_t5 + normal_t7)/3.0;
        v2_ponderado = (normal_t2 + normal_t5 + normal_t7)/3.0;
        v3_ponderado = (normal_t2 + normal_t3 + normal_t4 + normal_t5)/4.0;
    }
    else if ( triangulo_mandado == 5){
        v1_ponderado = (normal_t2 + normal_t5 + normal_t6 + normal_t7)/4.0;
        v2_ponderado = (normal_t3 + normal_t4 + normal_t6 + normal_t7)/4.0;
        v3_ponderado = (normal_t2 + normal_t3  + normal_t6)/3.0;
    }
    else if ( triangulo_mandado == 6){
        v1_ponderado = (normal_t2 + normal_t5 + normal_t6 + normal_t7)/4.0;
        v2_ponderado = (normal_t4 + normal_t5 + normal_t7)/3.0;
        v3_ponderado = (normal_t3 + normal_t4 + normal_t6 + normal_t7)/4.0;
    }

    vec3 U = v2_ponderado - v1_ponderado;
    vec3 V = v3_ponderado - v1_ponderado;

    vec3 normal = vec3(1.0);
    normal.x = (U.y * V.z) - (U.z - V.y);
    normal.y = (U.z * V.x) - (U.x - V.z);
    normal.z = (U.x * V.y) - (U.y - V.x);

    return normal;

}


//Calculo la reflexion de un rayo hacia todos los objetos de la pantalla
vec4 reflection(vec3 origin, vec3 norm, DirLight dirLight, vec3 dir){
    vec3 R = reflect(dir, norm);
    Ray r;
    r.origin = origin;
    r.direction = R;
    vec4 color = vec4(0.0, 0.0, 0.0, 1.0);
    vec3 hitpos, normal;
    float t;
    float min_t = 1000000.0;
    for(int rebotes = 0; rebotes < 1; rebotes++){

        for(int i=1; i<3; i++) {
            t = interesect_ray_sphere(r,spheres[i],hitpos,normal); //Reviso si hay chooque
            if(t != 0.0) {
                if(t < min_t) {
                    min_t = t;
                    vec3 valid_hitpos = hitpos;
                    vec3 valid_normal = normal;
                    color += vec4(phong(dirLight, valid_normal,valid_hitpos, spheres[i].color, r, false ), 1.0);
                    
                    if(i == 1) color = vec4(refract_real(valid_hitpos, valid_normal, dirLight, r.direction, true), 1.0);
                    
                    vec3 shadow_dir = normalize(dirLight.direction - hitpos); 
                    Ray shadow; shadow.origin = hitpos; shadow.direction = shadow_dir;
                    vec3 sha_color = shadowRay(shadow, i+4);
                    if(sha_color.x > 0.0){
                        color = vec4(sha_color,1.0);
                    }

                    }
                }
            }

         //Rayo-caja
        t = interesect_ray_caja(cubos, r, hitpos);

        if(t >= 0.0 && t < min_t) {
            min_t = t;
            vec3 normal_cubo = calcularNormalCubo(cubos, hitpos);
            color = vec4(phong(dirLight, normal_cubo, hitpos, cubos.color, r, false), 1.0);
            //Lanzo los rayos de sombra desde el punto de choque a los objetos de la escena
            vec3 shadow_dir = normalize(dirLight.direction - hitpos); 
            Ray shadow; shadow.origin = hitpos; shadow.direction = shadow_dir;
            vec3 sha_color = shadowRay(shadow, 3);
            if(sha_color.x > 0.0){
                color = vec4(sha_color, 1.0);
            }
        }

        //For de todos los triangulos (piso)
        for(int i = 0; i < 2; i++){
            t = triangle_intersection(triangles[i], r, hitpos);
            if(t >= 0.0 && t < min_t){
                min_t = t;
                vec3 normal_triangulo;
                if (i == 0) normal_triangulo = calcularNormal(triangles[0], triangles[1], true);
                else normal_triangulo = calcularNormal(triangles[0], triangles[1], false);
                color = vec4(phong(dirLight, normal_triangulo, hitpos, triangles[0].color, r, false), 1.0);

                //Lanzo los rayos de sombra desde el punto de choque a los objetos de la escena
                vec3 shadow_dir = normalize(dirLight.direction - hitpos); 
                Ray shadow; shadow.origin = hitpos; shadow.direction = shadow_dir;
                vec3 sha_color = shadowRay(shadow, i+1);
                if(sha_color.x > 0.0){
                    color = vec4(sha_color, 1.0);
                }

            }
        }
        }

    return color;
}

//Calculo la reflexion de un rayo hacia todos los objetos de la pantalla despues de un rebote de refraccion
vec4 reflection_rebote(vec3 origin, vec3 norm, DirLight dirLight, vec3 dir){
    vec3 R = reflect(dir, norm);
    Ray r;
    r.origin = origin;
    r.direction = R;
    vec4 color = vec4(0.0, 0.0, 0.0, 1.0);
    vec3 hitpos, normal;
    float t;
    float min_t = 1000000.0;
    for(int rebotes = 0; rebotes < 1; rebotes++){
        
        for(int i=1; i<3; i++) {
            t = interesect_ray_sphere(r,spheres[i],hitpos,normal); //Reviso si hay chooque
            if(t != 0.0) {
                if(t < min_t) {
                    min_t = t;
                    vec3 valid_hitpos = hitpos;
                    vec3 valid_normal = normal;
                    color = vec4(phong(dirLight, valid_normal,valid_hitpos, spheres[i].color, r, false ), 1.0);

                    if(i == 1) color = vec4(refract_rebote(valid_hitpos, valid_normal, dirLight, r.direction), 1.0);
                    
                    vec3 shadow_dir = normalize(dirLight.direction - hitpos); 
                    Ray shadow; shadow.origin = hitpos; shadow.direction = shadow_dir;
                    vec3 sha_color = shadowRay(shadow, i+4);
                    if(sha_color.x > 0.0){
                        color = vec4(sha_color,1.0);
                    }
                }
            }
        }

        //Rayo-caja
        t = interesect_ray_caja(cubos, r, hitpos);

        if(t >= 0.0 && t < min_t) {
            min_t = t;
            vec3 normal_cubo = calcularNormalCubo(cubos, hitpos);
            color = vec4(phong(dirLight, normal_cubo, hitpos, cubos.color, r, false), 1.0);
            //Lanzo los rayos de sombra desde el punto de choque a los objetos de la escena
            vec3 shadow_dir = normalize(dirLight.direction - hitpos); 
            Ray shadow; shadow.origin = hitpos; shadow.direction = shadow_dir;
            vec3 sha_color = shadowRay(shadow, 3);
            if(sha_color.x > 0.0){
                color = vec4(sha_color, 1.0);
            }
        }

        //For de todos los triangulos (piso)
        for(int i = 0; i < 2; i++){
            t = triangle_intersection(triangles[i], r, hitpos);
            if(t >= 0.0 && t < min_t){
                min_t = t;
                vec3 normal_triangulo;
                if (i == 0) normal_triangulo = calcularNormal(triangles[0], triangles[1], true);
                else normal_triangulo = calcularNormal(triangles[0], triangles[1], false);
                color = vec4(phong(dirLight, normal_triangulo, hitpos, triangles[0].color, r, false), 1.0);

                //Lanzo los rayos de sombra desde el punto de choque a los objetos de la escena
                vec3 shadow_dir = normalize(dirLight.direction - hitpos); 
                Ray shadow; shadow.origin = hitpos; shadow.direction = shadow_dir;
                vec3 sha_color = shadowRay(shadow, i+1);
                if(sha_color.x > 0.0){
                    color = vec4(sha_color, 1.0);
                }

            }
        }
    }

    return color;
}

//Calculo la refraccion de un rayo hacia todos los objetos de la pantalla luego de un rebote de reflexion
vec3 refract_rebote(vec3 origin, vec3 norm, DirLight dirLight, vec3 dir){
    vec3 R = refract(dir, normalize(norm), 0.90);
    Ray r;
    r.origin = origin;
    r.direction = R;
    vec4 color = vec4(0.0, 0.0, 0.0, 1.0);
    vec3 hitpos, normal;
    float t;
    float min_t = 1000000.0;


    //Rayo-caja
    t = interesect_ray_caja(cubos, r, hitpos);

    if(t >= 0.0 && t < min_t) {
        min_t = t;
        vec3 normal_cubo = calcularNormalCubo(cubos, hitpos);
        color = vec4(phong(dirLight, normal_cubo, hitpos, cubos.color, r, false), 1.0);
        //Lanzo los rayos de sombra desde el punto de choque a los objetos de la escena
        vec3 shadow_dir = normalize(dirLight.direction - hitpos); 
        Ray shadow; shadow.origin = hitpos; shadow.direction = shadow_dir;
        vec3 sha_color = shadowRay(shadow, 3);
        if(sha_color.x > 0.0){
            color = vec4(sha_color, 1.0);
        }
    }

    //For de todos los triangulos (piso)
    for(int i = 0; i < 2; i++){
        t = triangle_intersection(triangles[i], r, hitpos);
        if(t >= 0.0 && t < min_t){
            min_t = t;
            vec3 normal_triangulo;
            if (i == 0) normal_triangulo = calcularNormal(triangles[0], triangles[1], true);
            else normal_triangulo = calcularNormal(triangles[0], triangles[1], false);
            color = vec4(phong(dirLight, normal_triangulo, hitpos, triangles[0].color, r, false), 1.0);

            //Lanzo los rayos de sombra desde el punto de choque a los objetos de la escena
            vec3 shadow_dir = normalize(dirLight.direction - hitpos); 
            Ray shadow; shadow.origin = hitpos; shadow.direction = shadow_dir;
            vec3 sha_color = shadowRay(shadow, i+1);
            if(sha_color.x > 0.0){
                color = vec4(sha_color, 1.0);
            }
        }
    }


    for(int i=0; i<3; i++) {
        if(i != 1){
        t = interesect_ray_sphere(r,spheres[i],hitpos,normal); //Reviso si hay chooque
            if(t != 0.0) {
                if(t < min_t) {
                    min_t = t;
                    vec3 view_dir = r.origin - spheres[i].origin;
                    vec3 valid_hitpos = hitpos;
                    vec3 valid_normal = normal;

                    if(i == 0) color = vec4(phong(dirLight, valid_normal,valid_hitpos, spheres[i].color, r, true), 1.0);
                    else color = vec4(phong(dirLight, valid_normal,valid_hitpos, spheres[i].color, r, false), 1.0);

                    vec3 shadow_dir = normalize(dirLight.direction - hitpos); 
                    Ray shadow; shadow.origin = hitpos; shadow.direction = shadow_dir;
                    vec3 sha_color = shadowRay(shadow, i+4);
                    if(sha_color.x > 0.0){
                        color = vec4(sha_color,1.0);
                    }

                    }
            }
        }
    }


    return color.rgb;
}

//Calculo la refraccion de un rayo hacia todos los objetos de la pantalla
vec3 refract_real(vec3 origin, vec3 norm, DirLight dirLight, vec3 dir, bool rebote){
    vec3 R = refract(dir, normalize(norm), 0.90);
    Ray r;
    r.origin = origin;
    r.direction = R;
    vec4 color = vec4(0.0, 0.0, 0.0, 1.0);
    vec3 hitpos, normal;
    float t;
    float min_t = 1000000.0;


    //Rayo-caja
    t = interesect_ray_caja(cubos, r, hitpos);

    if(t >= 0.0 && t < min_t) {
        min_t = t;
        vec3 normal_cubo = calcularNormalCubo(cubos, hitpos);
        color = vec4(phong(dirLight, normal_cubo, hitpos, cubos.color, r, false), 1.0);
        //Lanzo los rayos de sombra desde el punto de choque a los objetos de la escena
        vec3 shadow_dir = normalize(dirLight.direction - hitpos); 
        Ray shadow; shadow.origin = hitpos; shadow.direction = shadow_dir;
        vec3 sha_color = shadowRay(shadow, 3);
        if(sha_color.x > 0.0){
            color = vec4(sha_color, 1.0);
        }
    }


    //For de todos los triangulos (piso)
    for(int i = 0; i < 2; i++){
        t = triangle_intersection(triangles[i], r, hitpos);
        if(t >= 0.0 && t < min_t){
            min_t = t;
            vec3 normal_triangulo;
            if (i == 0) normal_triangulo = calcularNormal(triangles[0], triangles[1], true);
            else normal_triangulo = calcularNormal(triangles[0], triangles[1], false);
            color = vec4(phong(dirLight, normal_triangulo, hitpos, triangles[0].color, r, false), 1.0);

            //Lanzo los rayos de sombra desde el punto de choque a los objetos de la escena
            vec3 shadow_dir = normalize(dirLight.direction - hitpos); 
            Ray shadow; shadow.origin = hitpos; shadow.direction = shadow_dir;
            vec3 sha_color = shadowRay(shadow, i+1);
            if(sha_color.x > 0.0){
                color = vec4(sha_color, 1.0);
            }

        }
    }

    //For de todos las esferas
    for(int i=0; i<3; i++) {
        if(i != 1){
        t = interesect_ray_sphere(r,spheres[i],hitpos,normal); //Reviso si hay chooque
            if(t != 0.0) {
                if(t < min_t) {
                    min_t = t;
                    vec3 view_dir = r.origin - spheres[i].origin;
                    vec3 valid_hitpos = hitpos;
                    vec3 valid_normal = normal;
                    if(i == 0) color = vec4(phong(dirLight, valid_normal,valid_hitpos, spheres[i].color, r, true), 1.0);
                    else color = vec4(phong(dirLight, valid_normal,valid_hitpos, spheres[i].color, r, false), 1.0);


                    if(i == 0 && !rebote) color += reflection_rebote(valid_hitpos, valid_normal, dirLight, r.direction);
                    
                    vec3 shadow_dir = normalize(dirLight.direction - hitpos); 
                    Ray shadow; shadow.origin = hitpos; shadow.direction = shadow_dir;
                    vec3 sha_color = shadowRay(shadow, i+4);
                    if(sha_color.x > 0.0){
                        color = vec4(sha_color,1.0);
                    }

                    }
            }
        }
    }

    return color.rgb;
}

void main()
{    

        //Saco la direccion del rayo
        float normalized_i = (gl_FragCoord.x / width) - 0.5;
        float normalized_j = (gl_FragCoord.y / height) - 0.5;
        vec3 image_point = normalized_i * camera_right + normalized_j * camera_up + view_vec + camera_direction;
        vec3 ray_direction = image_point - view_vec;

        vec3 rayOrigin = view_vec;
        vec3 rayDirection = ray_direction;
        rayDirection = normalize(rayDirection);

        //Creo rayo y esfera
        Ray r;
        r.origin = view_vec;
        r.direction = rayDirection;

        //Inicializo triangulos (piso)
        triangles[0].v1 = vec3(-118.89-180.0, 0.0, -52.25);
        triangles[0].v2 = vec3(-117.34-180.0, 0.0, 37.82);
        triangles[0].v3 = vec3(15.72+180.0, 0.0, -47.43);

        triangles[0].color = vec4(0.556, 0.007, 0.007, 1.0);

        triangles[1].v1 = vec3(16.89+180.0, 0.0, 40.70);
        triangles[1].v2 = vec3(-117.34-180.0, 0.0, 37.82);
        triangles[1].v3 = vec3(15.72+180.0, 0.0, -47.43);
        triangles[1].color = vec4(0.0, 1.0, 0.0, 1.0);

        //Inicializo esferas 
        spheres[0].origin = vec3( 57.92 * cos(time*5.0) + -46.45, 17.07, 32.69 * sin(time * 5.0) + -1.34);
        spheres[0].radius = 10.55;
        spheres[0].color = vec4( 1.0, 1.0, 1.0, 1.0);


        spheres[1].origin = vec3( -46.57 , 17.16, -16.65);
        spheres[1].radius = 8.55;
        spheres[1].color = vec4( 1.0, 1.0, 0.0, 1.0);

        spheres[2].origin = vec3(-74.44, 12.47, -9.78);//vec3( 4.31 , 17.16, 10.13);
        spheres[2].radius = 8.55;
        spheres[2].color = vec4( 1.0, 1.0, 0.0, 1.0);

        //Inicializo cubo
        cubos.min = vec3(-19.20, 27.91, -10.34); //vec3(0, 0, 0);
        cubos.max = vec3(-4.0, 5.03, 4.32); //vec3(20.25, 20.25, 20.25);
        cubos.color = vec4(0.898, 0.576, 0.062, 1.0);

        float min_t = 1000000.0; //Minimo t para declarar invalido el rayo
        vec3 normal; //Normales a usar
        vec3 hitpos; //Posicion en la que choca el rayo
        bool found = false; //Si hubo choque o no
        float t;
        color = vec4(0.0, 0.0, 0.0, 1.0);

        //For de los triangulos del piso
        for(int i = 0; i < 2; i++){
            t = triangle_intersection(triangles[i], r, hitpos);
            if(t >= 0.0){
                min_t = t;
                found = true;
                color = vec4(0.0);
                //Lanzo los rayos de sombra desde el punto de choque a los objetos de la escena
                vec3 shadow_dir = normalize(dirLight.direction - hitpos); 
                Ray shadow; shadow.origin = hitpos; shadow.direction = shadow_dir;
                vec3 sha_color = shadowRay(shadow, i+1);
                if(sha_color.x > 0.0){
                    color = vec4(sha_color, 1.0);
                }
            }
        }

        //Rayo-caja
        t = interesect_ray_caja(cubos, r, hitpos);

        if(t >= 0.0 && t < min_t) {
            found = true;
            min_t = t;
            vec3 normal_cubo = calcularNormalCubo(cubos, hitpos);
            color = vec4(phong(dirLight, normal_cubo, hitpos, cubos.color, r, true), 1.0);
            //Lanzo los rayos de sombra desde el punto de choque a los objetos de la escena
            vec3 shadow_dir = normalize(dirLight.direction - hitpos); 
            Ray shadow; shadow.origin = hitpos; shadow.direction = shadow_dir;
            vec3 sha_color = shadowRay(shadow, 3);
            if(sha_color.x > 0.0){
                color = vec4(sha_color, 1.0);
            }
        }


        //For de todas las esferas
            for(int i=0; i<3; i++) {
                t = interesect_ray_sphere(r,spheres[i],hitpos,normal); //Reviso si hay choque
                if(t != 0.0) {
                    if(t < min_t) {
                        found = true;
                        min_t = t;
                        vec4 inten = vec4(0.0);
                        
                        // inten = vec4(phong(dirLight, valid_normal,valid_hitpos, spheres[i].color, r, false), 1.0);
                        // else inten = vec4(phong(dirLight, valid_normal,valid_hitpos, spheres[i].color, r, true), 1.0);
                        //La esfera 1 es la esfera refrectiva, sino es esta calculo la iluminacion phong normal
                        
                         if(i != 1) {
                            if(i == 0) {
                                inten = vec4(phong(dirLight, normal,hitpos, spheres[i].color, r, true), 1.0);
                                inten += reflection(hitpos, normal, dirLight, rayDirection);
                            }
                             else inten = vec4(phong(dirLight, normal,hitpos, spheres[i].color, r, false), 1.0);
                        
                        } else inten = vec4(refract_real(hitpos, normal, dirLight, rayDirection, false), 1.0);


                        color = inten;

                        //Lanzo los rayos de sombra desde el punto de choque a los objetos de la escena
                        vec3 shadow_dir = normalize(dirLight.direction - hitpos); 
                        Ray shadow; shadow.origin = hitpos; shadow.direction = shadow_dir;
                        vec3 sha_color = shadowRay(shadow, i+4);
                        if(sha_color.x > 0.0) { //Si el color es mayor a negro, uso el color de la sombra, sino dejo el anterior 
                            color = vec4(sha_color,1.0);
                        }
                    } 

                }
            }


    //Si no hubo choque con nada, pinto negro con alfa
    if(!found) {
        color = vec4(0.0);
    }

}