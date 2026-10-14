# CV Studio

Aplicación frontend para crear y personalizar currículums con vista previa, guardado automático y exportación a PDF.

Desarrollada con Angular, TypeScript y Tailwind CSS.

## Funcionalidades

- Crear y gestionar varios currículums.
- Editar, duplicar, renombrar y eliminar documentos.
- Elegir entre las plantillas Clásica y Moderna.
- Completar datos personales, perfil profesional, experiencia, educación, habilidades, idiomas, certificaciones, proyectos y enlaces.
- Personalizar el color y la tipografía.
- Mostrar u ocultar secciones del currículum.
- Editar mediante secciones desplegables.
- Consultar la vista previa mientras se completa el formulario.
- Alternar entre edición y vista previa en dispositivos móviles.
- Guardar automáticamente los cambios en el navegador.
- Exportar e importar respaldos en formato JSON.
- Exportar a PDF mediante el diálogo de impresión del navegador.

## Tecnologías

- Angular 21
- TypeScript
- Tailwind CSS 4
- Angular Forms
- Angular Router
- Material Symbols
- localStorage

## Plantillas

### Clásica

Diseño de una columna con encabezado centrado y secciones organizadas verticalmente.

### Moderna

Diseño de dos columnas con barra lateral para información de contacto y habilidades.

Ambas permiten personalizar el color, la tipografía y la visibilidad de las secciones.

## Instalación y ejecución

Necesitas Node.js y npm compatibles con Angular 21.

Clona el repositorio:

```bash
git clone https://github.com/RodrigoLE19/cv-studio.git
cd cv-studio
```

Instala las dependencias:

```bash
npm install
```

Inicia el servidor de desarrollo:

```bash
npm start
```

Abre http://localhost:4200/ en el navegador.

## Compilación

```bash
npm run build
```

Los archivos compilados se generan en `dist/cv-studio`.

## Almacenamiento y respaldos

Los currículums se guardan en el almacenamiento local del navegador. La aplicación no utiliza un backend ni requiere una cuenta.

Los datos pertenecen al navegador y al sitio desde el que se utiliza la aplicación. No se sincronizan automáticamente entre dispositivos.

Puedes descargar un respaldo JSON desde **Mis CV** e importarlo en otro navegador. La importación añade copias de los documentos y conserva los existentes.

Si borras los datos del sitio, puedes perder los currículums guardados. Descarga un respaldo para conservar una copia.

## Exportación a PDF

1. Abre un currículum en el editor.
2. Pulsa **Exportar PDF**.
3. Selecciona **Guardar como PDF** en el diálogo de impresión.
4. Utiliza tamaño A4 y desactiva los encabezados y pies de página del navegador.
5. Si el color no aparece, activa la impresión de gráficos de fondo.

El número de páginas depende de la cantidad de contenido.

## Autor

Rodrigo Estrada Leon

- GitHub: https://github.com/RodrigoLE19
- Portafolio: https://rodrigo-leon.netlify.app