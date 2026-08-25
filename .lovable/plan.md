# Importar PDF en el editor del blog

Añadir un botón **Import PDF** junto al de **Import .docx** en la barra del editor, con el mismo flujo: eliges el archivo y el contenido entra en el editor.

## Diferencia importante con .docx

Un `.docx` guarda la estructura real (títulos, párrafos, listas, imágenes). Un PDF no: solo guarda texto colocado en coordenadas. Por eso el resultado del import de PDF será:

- Texto extraído en párrafos, respetando saltos de página y líneas en blanco.
- Detección heurística de títulos: líneas cortas con letra notablemente más grande se convierten en `H2`.
- Sin recuperación fiel de negritas/cursivas ni de listas numeradas originales.
- Las imágenes embebidas del PDF se extraen y se suben al bucket `blog-images` cuando el PDF las tiene como imágenes reales; si el PDF es un escaneo (una imagen por página) no hay texto que extraer y avisamos al usuario con un mensaje.

El texto siempre queda editable, así que se puede ajustar después en el editor.

## Alcance

- Nuevo botón con icono de PDF y spinner mientras procesa, mismo estilo (`variant="outline"`, `shadow-sm`) que el resto del toolbar.
- Validación: solo `.pdf`, tamaño máximo 20MB.
- Toasts en español: éxito con conteo de páginas/imágenes, error si falla, aviso si el PDF no tiene texto seleccionable.

## Detalles técnicos

- Archivo a modificar: `src/components/blog/TipTapEditor.tsx`.
- Dependencia nueva: `pdfjs-dist` (import dinámico, igual que `mammoth`, para no cargarla en el bundle inicial); worker configurado vía `?url` de Vite.
- Extracción: `getDocument().getPage(n).getTextContent()` para el texto; agrupación de items por posición vertical para reconstruir líneas y párrafos; `page.getOperatorList()` / `page.objs` para las imágenes embebidas, subidas con la función `uploadDocxImage` existente (se renombra a `uploadEditorImage` y se reutiliza).
- El HTML resultante se inserta con `editor.commands.setContent(html, { emitUpdate: true })` y se propaga con `onChange`, idéntico al flujo de `.docx`.
