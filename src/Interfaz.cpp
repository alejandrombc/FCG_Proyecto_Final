#include "Interfaz.h"
#include <AntTweakBar.h>

extern Camera camera;
extern GLuint GLFW_WIDTH, GLFW_HEIGHT;

extern glm::mat4 project_mat; //Matriz de Proyeccion
extern glm::mat4 view_mat; //Matriz de View
extern glm::vec3 eye; // Ojo

extern bool MENU_TRY;
extern bool ANIMACION;
extern bool keys[1024]; //Todas las teclas

extern GLfloat lastX, lastY;
extern GLfloat deltaTime;
extern bool firstMouse;
extern GLfloat lastFrame;

//Funcion de reshape
void Interfaz::reshape(GLFWwindow *window, int width, int height) {
	width = max(width, 1); height = max(height, 1);
	glViewport(0, 0, width, height);
	glEnable(GL_DEPTH_TEST);
	glMatrixMode(GL_PROJECTION);
	glLoadIdentity();

	GLFW_HEIGHT = height;
	GLFW_WIDTH = width;

	project_mat = glm::perspective(45.0f, (float)width / (float)height, 0.1f, 1000.0f);
	gluPerspective(45.0f, (float)width / (float)height, 0.1f, 1000.0f);

	glm::mat4 model_mat;
	glm::vec3 norm(0.0f, 0.0f, 0.0f);
	glm::vec3 up(0.0f, 1.0f, 0.0f);
	gluLookAt(eye[0], eye[1], eye[2], norm[0], norm[1], norm[2], up[0], up[1], up[2]);

	glMatrixMode(GL_MODELVIEW);
	glClearColor(0.5, 0.5, 0.5, 0);
	glColor3f(1.0, 1.0, 1.0);
}

//Funcion de motionfunc (mueve la camara con el mouse)
void Interfaz::motionFunc(GLFWwindow* window, int button, int action, int mods) {
	if (!MENU_TRY){
		double x, y;
		glfwGetCursorPos(window, &x, &y);
		if (firstMouse)
		{
			lastX = x;
			lastY = y;
			firstMouse = false;
		}

		GLfloat xoffset = x - lastX;
		GLfloat yoffset = lastY - y;  // Reversed since y-coordinates go from bottom to left

		lastX = x;
		lastY = y;

		camera.ProcessMouseMovement(xoffset, yoffset);
	}
	else {
		if (TwEventMouseButtonGLFW(button, action)) {
			return;
		}
	}

}

//Funcion de MotionPassive del mouse
void Interfaz::passiveMotionFunc(GLFWwindow* window, double x, double y) {
	if (!MENU_TRY){
		if (firstMouse) {
			lastX = x;
			lastY = y;
			firstMouse = false;
		}

		if (x < 100) {
			glfwSetCursorPos(window, GLFW_WIDTH - 100, y);
			lastX = GLFW_WIDTH - 100;
		}
		else if (x > GLFW_WIDTH - 100) {
			glfwSetCursorPos(window, 100, y);
			lastX = 100;
		}

		if (y < 100) {
			glfwSetCursorPos(window, x, GLFW_HEIGHT - 100);
			lastY = GLFW_HEIGHT - 100;
		}
		else if (y > GLFW_HEIGHT - 100) {
			glfwSetCursorPos(window, x, 100);
			lastY = 100;
		}

		GLfloat xoffset = x - lastX;
		GLfloat yoffset = lastY - y;  // Reversed since y-coordinates go from bottom to left

		yoffset = (yoffset < 100 && yoffset > -100) ? yoffset : 0;
		xoffset = (xoffset < 100 && xoffset > -100) ? xoffset : 0;

		lastX = x;
		lastY = y;
		camera.ProcessMouseMovement(xoffset, yoffset, true);
	}
	else {
		if (TwEventMousePosGLFW(x, y)) return;
	}
}

//Teclado (escape para cerrar el juego)
void Interfaz::keyFunc(GLFWwindow* window, int Key, int iScancode, int iAction, int iMods) {
	if ((iAction == GLFW_PRESS && Key == GLFW_KEY_M)) {
		MENU_TRY = !MENU_TRY;
		
		keys['W'] = false; keys['w'] = false;
		keys['S'] = false; keys['a'] = false;
		keys['A'] = false; keys['s'] = false;
		keys['D'] = false; keys['d'] = false;

		glfwSetInputMode(window, GLFW_CURSOR, GLFW_CURSOR_NORMAL);
	}
	else if (!MENU_TRY) {
		MENU_TRY = false;
		glfwSetInputMode(window, GLFW_CURSOR, GLFW_CURSOR_HIDDEN);
	}
	if ((iAction == GLFW_PRESS && Key == GLFW_KEY_T)) {
		ANIMACION = !ANIMACION;
	}
	if (iAction == GLFW_PRESS) keys[Key] = true;
	if (iAction == GLFW_RELEASE) keys[Key] = false;
}





