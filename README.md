# CR // Portafolio interactivo

Portafolio web de Cristian Camilo Rojas Capera, desarrollado con HTML5, CSS3 y JavaScript moderno. La experiencia está inspirada en la estética de *Tron: Legacy*: un vacío digital oscuro, neón cian/naranja, superficies de cristal y una cuadrícula 3D que responde continuamente.

## Características principales

- Sistema visual “The Grid” con fondo `#02060D`, cian eléctrico `#00F0FF` y naranja `#FF5E00`.
- Preloader con disco de identidad y estado de acceso.
- Cuadrícula 3D y estelas de luz dibujadas en `<canvas>` con `requestAnimationFrame`.
- Cursor personalizado, hover neon y transición de borde cian a naranja en proyectos.
- Títulos con efecto de decodificación al entrar en pantalla.
- Secciones de hero, perfil, proyectos, stack tecnológico y formulario de transmisión.
- Diseño responsive con menú móvil y soporte para `prefers-reduced-motion`.
- Sin framework ni proceso de compilación: puede abrirse directamente en el navegador.

## Estructura

```text
portafolio/
├── index.html   # Estructura semántica y contenido editable
├── style.css    # Paleta, layout responsive, glow y animaciones CSS
├── script.js    # Canvas, preloader, navegación y eventos interactivos
└── README.md    # Documentación del proyecto
```

## Ejecución local

### Opción rápida

Abre `index.html` directamente en tu navegador.

### Live Server / Go Live

1. Abre la carpeta del proyecto en Visual Studio Code.
2. Instala la extensión **Live Server** si todavía no la tienes.
3. Abre [index.html](./index.html).
4. Pulsa **Go Live** en la barra inferior de VS Code.
5. Live Server abrirá una URL local, normalmente `http://127.0.0.1:5500`.

Live Server es recomendable durante el desarrollo porque sirve correctamente los recursos locales y recarga la página al guardar cambios.

## Guía de personalización

### Colores y tipografía

Edita las variables al inicio de [style.css](./style.css):

```css
:root {
  --void: #02060d;
  --cyan: #00f0ff;
  --orange: #ff5e00;
}
```

Las fuentes `Orbitron` y `JetBrains Mono` se cargan desde Google Fonts en [index.html](./index.html). Puedes sustituirlas por otra combinación técnica si tu marca lo requiere.

### Información personal

En [index.html](./index.html), reemplaza:

- Nombre, rol, ubicación y biografía dentro de `#sobre-mi`.
- Porcentajes de capacidad en las barras `.progress`.
- Textos del hero y títulos de las secciones.

### Proyectos

Cada proyecto está dentro de un `article.project-card`. Cambia el título, descripción, etiquetas y enlaces `LIVE DEMO` / `SOURCE`. Para una nueva imagen, modifica las variables `--image` de `.image-one`, `.image-two` o `.image-three` en [style.css](./style.css).

### Contacto

El formulario muestra actualmente una confirmación visual local. En [script.js](./script.js), reemplaza el listener de `#contact-form` por un `fetch` hacia tu API, Formspree, EmailJS u otro proveedor. Actualiza también los enlaces sociales si los agregas al footer.

## Solución de problemas

### Aparece `Script terminated by timeout at draw`

Revisa que el bucle de la cuadrícula tenga una condición de salida y un incremento siempre positivo. En este proyecto, `drawGrid()` usa un número fijo de iteraciones para evitar incrementos nulos cuando la coordenada inicia en el horizonte. No añadas un `requestAnimationFrame(draw)` dentro de otro bucle síncrono.

### El canvas no se ve o mide `0 × 0`

Comprueba que el elemento `#grid-canvas` exista y que [script.js](./script.js) se ejecute después de `DOMContentLoaded`. También verifica que la ventana tenga un tamaño válido y que no hayas aplicado `display: none` al canvas o a su contenedor.

### La página no actualiza cambios

Si usas Live Server, guarda los archivos y recarga la pestaña. Si abriste `index.html` directamente, prueba Live Server para obtener recarga automática y una ruta HTTP local.

### Las imágenes remotas no cargan

Las previews actuales usan imágenes de Unsplash. Sustituye las URLs por archivos locales o por imágenes alojadas en tu propio dominio si necesitas funcionamiento sin conexión.

### Las animaciones consumen demasiados recursos

El renderer limita el trabajo por frame, usa un único `requestAnimationFrame` y aplica debounce al resize. Para reducir aún más el movimiento, activa “reducir movimiento” en el sistema operativo o ajusta `prefers-reduced-motion` en el navegador.
