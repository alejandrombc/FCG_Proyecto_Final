# Proyecto Final - [FCG]


## Contenido

* [Enunciado](#enunciado)
* [Mundo](#mundo)
* [Uso](#uso)
* [Herramienta](#herramienta)
* [Instalacion](#instalacion)
* [Autor](#autor)


# Enunciado

El enunciado de la tarea se encuentra en el pdf **_Enunciado.pdf_**. Se empleo la tecnica de Ray Tracing.

# Mundo

El mundo esta formado por la escena de Sponza y un Skybox nocturno.
Ademas se tienen los siguientes modelos renderizados con Ray Tracing:
  - 1 Esfera reflexiva en movimiento. (Rayo - Esfera)
  - 1 Esfera refractica estatica con el indice de refraccion en 0.9 (Rayo - Esfera)
  - 1 Esfera de color. (Rayo - Esfera)
  - 1 Rectangulo. (Rayo - Caja)
  - 1 Piramide (dependiendo del shader que se este usando). (Rayo - Triangulo)
  - 1 Cuadrado renderizado con alfa, hecho con 2 triangulos que corresponden al piso. (Rayo - Triangulo)

Tambien consta de una luz puntual con un tono naranja. 


A continuacion una imagen de dicho mundo:
![alt tag](https://image.ibb.co/ebipd5/mundo.png)

Y una imagen de uno de sus efectos:
![alt tag](https://image.ibb.co/ftZ6Qk/efecto.png)

# Uso

Al cargar el mundo usted podra moverse libremente por la escena usando las teclas de su teclado W (arriba), S (abajo), A(izquierda) y D (derecha) y usando el cursor para (**_mirar_**). Si desea desactivar la camara debe presionar la tecla "M" de su teclado, vera que el cursor aparecera en la pantalla, en este modo solo podra moverse con WASD. 

Debido a problemas de rendimiento se colocaron dos shaders extras en la carpeta "Shaders", "ray_tracing_med.frag" contiene el despliegue de una piramide con iluminacion basica. "ray_tracing_high.frag" contiende la misma piramide pero con la habilidad de ser mostrada en las esferas refractivas y reflexivas. Para su uso solo debe renombrar el que desee a "ray_tracing.frag".

Puede deshabilitar la animacion (De la pelota y de la luz) usando la tecla "T" de su teclado.

En la tarea se manejan los modelos difuso y especular Lambert y Blinn-Phong, respectivamente. 

# Herramienta 

La tarea previamente explicada fue desarrollada usando las siguientes herramientas:

| Herramienta                         	 | Versión   													   |                            
|----------------------------------------|-----------------------------------------------------------------|
| Microsoft Visual Studio        	 	 | 2015      													   |
| OpenGL				        	 	 | 4.0.0      													   |
| GLSL Version				             | 4.00      													   |

Y fue probada en la siguiente GPU:


| Fabricante                         	 | Nombre   													   |                            
|----------------------------------------|-----------------------------------------------------------------|
| Intel     	 					     | Intel HD Graphics 4000      									   |



# Instalacion

Para usar el proyecto se debe primero clonar el repositorio con el siguiente comando:

> git clone https://github.com/alejandrombc/FCG_Proyecto_Final.git

Con esto puede ejecutar el ejecutable en la carpeta _/bin_ o abrir el proyecto de VS ubicado en _/Proyecto/Proyecto Final - 24206267_ con extension **.sln**.


# Autor

**Alejandro Barone**
**CI: 24206267**
