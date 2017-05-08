// Libreria de Main
#include "Main.h"
#include "Interfaz.h"
#include <AntTweakBar.h>

// Propiedades globales
GLuint GLFW_WIDTH = 800, GLFW_HEIGHT = 600;

glm::mat4 project_mat; //Matriz de Proyeccion
glm::mat4 view_mat; //Matriz de View
glm::vec3 eye(0.0f, 0.0f, 2.0f); // Ojo

bool MENU_TRY = false; //Si le da al espacio

bool ANIMACION = true; //Parar la animacion

float ejeX = -180, ejeY = 80, ejeZ = -10.126;

glm::vec3 esfera1 = glm::vec3(0.5, 1.0, 6.0), esfera2 = glm::vec3(35.0, 1.0, 6.0), 
			esfera3 = glm::vec3(35.0, 1.0, 35.0), triangulo1 = glm::vec3(-34.94, 0.0, -43.26),
			triangulo2 = glm::vec3(-38.98, 0.0, 36.22), triangulo3 = glm::vec3(15.84, 0.0, -41.82);

// Camera
Camera camera(glm::vec3(0.0f, 0.0f, 0.0f));
bool keys[1024];
GLfloat lastX = 400, lastY = 300;
bool firstMouse = true;

GLfloat deltaTime = 0.0f;
GLfloat lastFrame = 0.0f;

CGLSLProgram shader; //Shader principal
CGLSLProgram shader_objects; //Shader objetos
CGLSLProgram programSkyBox;

GLuint skyboxVAO, skyboxVBO;
GLuint cubemapTexture;
vector<const GLchar*> faces;

Interfaz inter; //Interfaz 

//Animaciones
float time = 0.0;
int signo = 1;

//Funcion que mueve la camara con WASD
void moverme() {
	bool una_vez = true;
	if ((keys['w'] || keys['W']) && una_vez) {
		//Muevo hacia delante
		camera.ProcessKeyboard(FORWARD, deltaTime);
		una_vez = false;
	}
	if ((keys['s'] || keys['S']) && una_vez) {
		camera.ProcessKeyboard(BACKWARD, deltaTime);
		una_vez = false;
	}
	if ((keys['a'] || keys['A']) && una_vez) {
		camera.ProcessKeyboard(LEFT, deltaTime);
		una_vez = false;
	}
	if ((keys['d'] || keys['D']) && una_vez) {
		camera.ProcessKeyboard(RIGHT, deltaTime);
		una_vez = false;
	}
}

//Funcion del display
void display_model(Model sponza, Model cubo) {
	glEnable(GL_BLEND);
	glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
	//Dibujo sponza
	glm::mat4 model;
	shader.enable();

		// Transformation matrices
		project_mat = glm::perspective(camera.Zoom, (float)GLFW_WIDTH / (float)GLFW_HEIGHT, 0.1f, 1000.0f);
		view_mat = camera.GetViewMatrix();
		glUniformMatrix4fv(shader.getLocation("projection"), 1, GL_FALSE, glm::value_ptr(project_mat));
		glUniformMatrix4fv(shader.getLocation("view"), 1, GL_FALSE, glm::value_ptr(view_mat));

		// Draw the loaded model

		model = glm::translate(model, glm::vec3(0.0f, -1.75f, 0.0f)); // Translate it down a bit so it's at the center of the scene
		model = glm::scale(model, glm::vec3(0.2f, 0.2f, 0.2f));	// It's a bit too big for our scene, so scale it down


		glUniform1i(shader.getLocation("width"), GLFW_WIDTH);
		glUniform1i(shader.getLocation("height"), GLFW_HEIGHT);

		glUniform3f(shader.getLocation("dirLight.direction"), ejeX, ejeY, ejeZ);

		glUniform3f(shader.getLocation("dirLight.ambient"), 0.886, 0.345, 0.133);
		glUniform3f(shader.getLocation("dirLight.diffuse"), 0.886, 0.345, 0.133); //Color "fuego"
		glUniform3f(shader.getLocation("dirLight.specular"), 1.0, 1.0, 1.0);

		glUniform3f(shader.getLocation("view_vec"), camera.Position[0], camera.Position[1], camera.Position[2]);

		glUniformMatrix4fv(shader.getLocation("model"), 1, GL_FALSE, glm::value_ptr(model));
		sponza.Draw(0);

	shader.disable();

	//GPU RayTracer

	shader_objects.enable();
		glUniform3f(shader_objects.getLocation("dirLight.direction"), ejeX, ejeY, ejeZ);

		glUniform1i(shader_objects.getLocation("width"), GLFW_WIDTH);
		glUniform1i(shader_objects.getLocation("height"), GLFW_HEIGHT);
		glUniform1f(shader_objects.getLocation("time"), time);

		glUniform3f(shader_objects.getLocation("dirLight.ambient"), 0.886, 0.345, 0.133);
		glUniform3f(shader_objects.getLocation("dirLight.diffuse"), 0.886, 0.345, 0.133); //Color "fuego"
		glUniform3f(shader_objects.getLocation("dirLight.specular"), 1.0, 1.0, 1.0);

		glUniform3f(shader_objects.getLocation("view_vec"), camera.Position[0], camera.Position[1], camera.Position[2]);

		glUniform3f(shader_objects.getLocation("camera_direction"), camera.Front[0], camera.Front[1], camera.Front[2]);
		glUniform3f(shader_objects.getLocation("camera_right"), camera.Right[0], camera.Right[1], camera.Right[2]);
		glUniform3f(shader_objects.getLocation("camera_up"), camera.Up[0], camera.Up[1], camera.Up[2]);

		glUniform3f(shader_objects.getLocation("esfera1"), esfera1[0], esfera1[1], esfera1[2]);
		glUniform3f(shader_objects.getLocation("esfera2"), esfera2[0], esfera2[1], esfera2[2]);
		glUniform3f(shader_objects.getLocation("esfera3"), esfera3[0], esfera3[1], esfera3[2]);

		glUniform3f(shader_objects.getLocation("triangulo1"), triangulo1[0], triangulo1[1], triangulo1[2]);
		glUniform3f(shader_objects.getLocation("triangulo2"), triangulo2[0], triangulo2[1], triangulo2[2]);
		glUniform3f(shader_objects.getLocation("triangulo3"), triangulo3[0], triangulo3[1], triangulo3[2]);

		cubo.Draw(1);


	shader_objects.disable();
	glDisable(GL_BLEND);


	//Animacion
	if (ANIMACION) {
		time += 0.005;

		ejeX += 1.5*signo;

		if (ejeX >= 160) signo = -1;
		else if (ejeX <= -180) signo = 1;
	}

}

//Cargado del shader principal de sponza
void load_shader(const char* vertex, const char* fragment) {
	shader.loadShader(vertex, CGLSLProgram::VERTEX);
	shader.loadShader(fragment, CGLSLProgram::FRAGMENT);
	shader.create_link();

	shader.enable();

		shader.addAttribute("position");
		shader.addAttribute("normal");
		shader.addAttribute("texCoords");

		shader.addUniform("model");
		shader.addUniform("view");
		shader.addUniform("projection");

		shader.addUniform("dirLight.direction");
		shader.addUniform("dirLight.ambient");
		shader.addUniform("dirLight.diffuse");
		shader.addUniform("dirLight.specular");

		shader.addUniform("view_vec");
		shader.addUniform("texture_diffuse1");

	shader.disable();

}

//Cargado del shader de ray tracing
void load_shader_object(const char* vertex, const char* fragment) {
	shader_objects.loadShader(vertex, CGLSLProgram::VERTEX);
	shader_objects.loadShader(fragment, CGLSLProgram::FRAGMENT);

	//system("pause");
	shader_objects.create_link();

	shader_objects.enable();

		shader_objects.addAttribute("position");
		shader_objects.addAttribute("normal");
		shader_objects.addAttribute("texCoords");

		shader_objects.addUniform("dirLight.direction");
		shader_objects.addUniform("dirLight.ambient");
		shader_objects.addUniform("dirLight.diffuse");
		shader_objects.addUniform("dirLight.specular");
		

		shader_objects.addUniform("esfera1");
		shader_objects.addUniform("esfera2");
		shader_objects.addUniform("esfera3");

		shader_objects.addUniform("triangulo1");
		shader_objects.addUniform("triangulo2");
		shader_objects.addUniform("triangulo3");

		shader_objects.addUniform("view_vec");
		shader_objects.addUniform("camera_direction");
		shader_objects.addUniform("camera_up");
		shader_objects.addUniform("camera_right");
		shader_objects.addUniform("width");
		shader_objects.addUniform("height");
		shader_objects.addUniform("time");

	shader_objects.disable();
}


//FUNCIONES DEL SKYBOX

GLfloat skyboxVertices[] = {
	// Posiciones          
	-1.0f,  1.0f, -1.0f,
	-1.0f, -1.0f, -1.0f,
	1.0f, -1.0f, -1.0f,
	1.0f, -1.0f, -1.0f,
	1.0f,  1.0f, -1.0f,
	-1.0f,  1.0f, -1.0f,

	-1.0f, -1.0f,  1.0f,
	-1.0f, -1.0f, -1.0f,
	-1.0f,  1.0f, -1.0f,
	-1.0f,  1.0f, -1.0f,
	-1.0f,  1.0f,  1.0f,
	-1.0f, -1.0f,  1.0f,

	1.0f, -1.0f, -1.0f,
	1.0f, -1.0f,  1.0f,
	1.0f,  1.0f,  1.0f,
	1.0f,  1.0f,  1.0f,
	1.0f,  1.0f, -1.0f,
	1.0f, -1.0f, -1.0f,

	-1.0f, -1.0f,  1.0f,
	-1.0f,  1.0f,  1.0f,
	1.0f,  1.0f,  1.0f,
	1.0f,  1.0f,  1.0f,
	1.0f, -1.0f,  1.0f,
	-1.0f, -1.0f,  1.0f,

	-1.0f,  1.0f, -1.0f,
	1.0f,  1.0f, -1.0f,
	1.0f,  1.0f,  1.0f,
	1.0f,  1.0f,  1.0f,
	-1.0f,  1.0f,  1.0f,
	-1.0f,  1.0f, -1.0f,

	-1.0f, -1.0f, -1.0f,
	-1.0f, -1.0f,  1.0f,
	1.0f, -1.0f, -1.0f,
	1.0f, -1.0f, -1.0f,
	-1.0f, -1.0f,  1.0f,
	1.0f, -1.0f,  1.0f
};

GLuint loadCubemap(vector<const GLchar*> faces)
{
	ilInit();
	ILuint imageID;
	GLuint textureID;
	glGenTextures(1, &textureID);
	ILboolean success;
	ILenum error;
	ilGenImages(1, &imageID);
	ilBindImage(imageID);
	ilEnable(IL_ORIGIN_SET);
	ilOriginFunc(IL_ORIGIN_LOWER_LEFT);

	for (GLuint i = 0; i < faces.size(); i++) {
		success = ilLoadImage(faces[i]);
		if (success)
		{
			success = ilConvertImage(IL_RGB, IL_UNSIGNED_BYTE);
			if (!success) {
				error = ilGetError();
				cout << "Image conversion fails" << endl;
			}
			//glActiveTexture(GL_TEXTURE0);

			glBindTexture(GL_TEXTURE_CUBE_MAP, textureID);

			glTexImage2D(GL_TEXTURE_CUBE_MAP_POSITIVE_X + i,
				0,
				GL_RGB,
				ilGetInteger(IL_IMAGE_WIDTH),
				ilGetInteger(IL_IMAGE_HEIGHT),
				0,
				ilGetInteger(IL_IMAGE_FORMAT),
				GL_UNSIGNED_BYTE,
				ilGetData()
			);
		}
	}

	glTexParameteri(GL_TEXTURE_CUBE_MAP, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
	glTexParameteri(GL_TEXTURE_CUBE_MAP, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
	glTexParameteri(GL_TEXTURE_CUBE_MAP, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
	glTexParameteri(GL_TEXTURE_CUBE_MAP, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
	glTexParameteri(GL_TEXTURE_CUBE_MAP, GL_TEXTURE_WRAP_R, GL_CLAMP_TO_EDGE);
	glBindTexture(GL_TEXTURE_CUBE_MAP, 0);

	ilDeleteImages(1, &imageID);
	return textureID;

}

//Iniciar shader de Skybox
void loadShaderSkyBox() {
	programSkyBox.loadShader("Shaders/nomansky.vert", CGLSLProgram::VERTEX);
	programSkyBox.loadShader("Shaders/nomansky.frag", CGLSLProgram::FRAGMENT);

	programSkyBox.create_link();

	programSkyBox.enable();

	programSkyBox.addAttribute("position");

	programSkyBox.addUniform("projection");
	programSkyBox.addUniform("view");
	programSkyBox.addUniform("skybox");


	programSkyBox.disable();
}

void initSkybox() {
	//Inicializar VAO y VBO del skybox
	glGenVertexArrays(1, &skyboxVAO);
	glGenBuffers(1, &skyboxVBO);
	glBindVertexArray(skyboxVAO);
	glBindBuffer(GL_ARRAY_BUFFER, skyboxVBO);
	glBufferData(GL_ARRAY_BUFFER, sizeof(skyboxVertices), &skyboxVertices, GL_STATIC_DRAW);
	glEnableVertexAttribArray(0);
	glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 3 * sizeof(GLfloat), (GLvoid*)0);
	glBindVertexArray(0);

	//Guardo texturas en el vector de texturas del cubmap
	faces.push_back("Texturas/left.png");
	faces.push_back("Texturas/right.png");
	faces.push_back("Texturas/top.png");
	faces.push_back("Texturas/bottom.png");
	faces.push_back("Texturas/back.png");
	faces.push_back("Texturas/front.png");
	cubemapTexture = loadCubemap(faces);

	// Creo un nuevo identificador de los shaders del skybox
	programSkyBox.link();
}


void draw_skybox() {
	glDepthMask(GL_FALSE);
	programSkyBox.enable();

	glm::mat4 view = glm::mat4(glm::mat3(camera.GetViewMatrix()));
	glm::mat4 projection = glm::perspective(45.0f, (float)GLFW_WIDTH / (float)GLFW_HEIGHT, 0.1f, 100.0f);
	glUniformMatrix4fv(programSkyBox.getLocation("view"), 1, GL_FALSE, glm::value_ptr(view));
	glUniformMatrix4fv((programSkyBox.getLocation("projection")), 1, GL_FALSE, glm::value_ptr(project_mat));
	// Cubo del Skybox
	glBindVertexArray(skyboxVAO);
	glActiveTexture(GL_TEXTURE0);
	glUniform1i(programSkyBox.getLocation("skybox"), 0);
	glBindTexture(GL_TEXTURE_CUBE_MAP, cubemapTexture);
	glDrawArrays(GL_TRIANGLES, 0, 36);
	glBindVertexArray(0);
	glDepthMask(GL_TRUE);

	programSkyBox.disable();
}



// Funcion del main
int main()
{
	// Init GLFW
	glfwInit();

	GLFWwindow* window = glfwCreateWindow(GLFW_WIDTH, GLFW_HEIGHT, "Proyecto Final - 24206267 Alejandro Barone", nullptr, nullptr); // Windowed
	glfwMakeContextCurrent(window);

	// Set the required callback functions
	glfwSetWindowSizeCallback(window, inter.reshape);
	glfwSetKeyCallback(window, inter.keyFunc);
	glfwSetMouseButtonCallback(window, inter.motionFunc);
	glfwSetCursorPosCallback(window, inter.passiveMotionFunc);
	glfwSetInputMode(window, GLFW_CURSOR, GLFW_CURSOR_HIDDEN);

	// Options
	glfwSetInputMode(window, GLFW_CURSOR, GLFW_CURSOR_DISABLED);
	
	// Initialize GLEW to setup the OpenGL Function pointers
	glewExperimental = GL_TRUE;
	glewInit();

	// Define the viewport dimensions
	glViewport(0, 0, GLFW_WIDTH, GLFW_HEIGHT);

	// Setup some OpenGL options
	glEnable(GL_DEPTH_TEST);

	loadShaderSkyBox(); //cargo shader skybox
	initSkybox(); //inicializado el skybox

	// Setup and compile our shaders
	load_shader("Shaders/sponza.vert", "Shaders/sponza.frag");
	
	//shader de modelos
	load_shader_object("Shaders/ray_tracing.vert", "Shaders/ray_tracing.frag");

	// Load models
	Model sponza("Modelos/obj/sponza/sponza.obj");
	Model cubo("Modelos/obj/cubo/cubo.obj");

	// Draw in wireframe
	//glPolygonMode(GL_FRONT_AND_BACK, GL_LINE);
	
	// Game loop
	while (!glfwWindowShouldClose(window))
	{
		// Set frame time
		GLfloat currentFrame = glfwGetTime();
		deltaTime = currentFrame - lastFrame;
		lastFrame = currentFrame;

		// Check and call events
		glfwPollEvents();
		moverme();

		// Clear the colorbuffer
		glClearColor(0.05f, 0.05f, 0.05f, 1.0f);
		glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

		//Dibujo skybox de primero
		draw_skybox();

		//Funcion de despliegue
		display_model(sponza, cubo);
		// Swap the buffers
		glfwSwapBuffers(window);
		
	}

	glfwTerminate();
	return 0;
}
