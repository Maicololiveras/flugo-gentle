> Material complementario: esta página describe la animación anterior por diagramas. La simulación de terminal actual y su video de 5:57 se documentan en [README](../README.md). El MP4 anterior se puede regenerar, pero no se incluye.

# Gentle: del pedido a la evidencia

Animación de 4:34 minutos, 34 escenas y cuatro ejemplos. Contenido en español. El MP4 tiene explicaciones subtituladas integradas, sin pista de voz.

## Archivos

- `Gentle_ODD_TDD_RDD.mp4`: video H.264 de 1280 × 720, 24 fps.
- `Gentle_Flujo_Animado.html`: reproductor autónomo sin red, con pausa, velocidad, capítulos, avance por escenas y pantalla completa cuando el navegador la admite.
- `Gentle_Flujo_Animado.svg`: animación vectorial SMIL. Abrir directamente en un navegador compatible; algunos previsualizadores muestran SVG estático o bloquean animaciones.
- `fuentes/guion.json`: escenas, textos, relaciones y tiempos editables.
- `fuentes/fuentes.json`: enlaces fijados a los commits de referencia.

## Capítulos

- 00:00 — Qué ocurre detrás de una petición.
- 00:24 — Corregir un texto: ODD pequeño y contenido pasivo.
- 00:48 — Exportación CSV: delegación, documento, Engram, TDD y revisión media.
- 02:24 — Permisos: riesgo alto, cuatro perspectivas, refutación y corrección acotada.
- 03:28 — Reanudación: memoria no disponible, TDD apagado y revisión declinada.
- 04:16 — Integración final del flujo.

## Alcance

Es una simulación didáctica, no una ejecución de Pi ni un benchmark. Casos, comandos, cifras y resultados son ilustrativos. Los diagramas oficiales guían la semántica; esta animación usa su propio guion y composición SVG.

Se consultaron los diagramas oficiales ODD y RDD de Gentle AI y los de orquestación y revisión de Gentle Shell, además del protocolo ODD, el worker, la integración RDD y la verificación delegada. Referencias exactas en `fuentes/fuentes.json`.

Se describe la revisión previa de `gentle-ai` f0782af2803a8192477c18d2186795e9c9daa6c3 y `gentle-shell` 54548321be8c8d60891e89ea13bf2b0ed10e1ac5.

El modo RDD se consulta: no se presupone que todas las instalaciones tengan el mismo estado. Los ejemplos que lo ejecutan suponen habilitación efectiva y consentimiento aplicable. Se sigue el contrato ODD del worker para TDD observado; documentación antigua conserva contradicciones. SDD se menciona solo como elección explícita y no se integra automáticamente con RDD.

## Regeneración

Requisitos: Python 3 con Pillow, Node.js con sharp y FFmpeg en PATH.

Desde esta carpeta:

```bash
python3 fuentes/crear_animacion.py
node fuentes/render_svg.cjs
python3 fuentes/render_video.py
```

El generador crea escenas SVG y el reproductor; sharp rasteriza las escenas; el exportador produce el video con revelado de nodos, transiciones y partículas que recorren relaciones explícitas.

## Verificación

SVG parseado como XML, JavaScript comprobado sintácticamente, texto medido dentro del lienzo y fotogramas representativos inspeccionados visualmente. El reproductor no se probó en navegador: Chromium no estaba disponible y la descarga expiró. El video es la reproducción principal independiente de SMIL o JavaScript.
