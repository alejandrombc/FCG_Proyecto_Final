#pragma once
// GLEW
#include <GL/glew.h>

// GLFW
#include <GLFW/glfw3.h>
#include "Camera.h"
#include <algorithm> 

class Interfaz {
public:
	static void reshape(GLFWwindow *window, int width, int height);
	static void motionFunc(GLFWwindow* window, int button, int action, int mods);
	static void passiveMotionFunc(GLFWwindow* window, double x, double y);
	static void keyFunc(GLFWwindow* window, int Key, int iScancode, int iAction, int iMods);
};
