---
name: humanizar-texto-es
description: "Elimina patrones de escritura típicos de IA en textos en español de España para que suenen naturales y humanos. Aplica esta skill siempre que generes, edites o revises textos en español: artículos, guías, tutoriales, emails, copy comercial, publicaciones en redes sociales, documentación, informes o cualquier prosa. Actívala también cuando el usuario pida humanizar texto, eliminar tono robótico, mejorar la naturalidad de un texto, o cuando mencione que algo suena a IA, a ChatGPT o a texto generado automáticamente."
license: GPL-2.0-or-later
compatibility: "Cualquier asistente de IA que genere texto en español de España. Compatible con Claude, ChatGPT, Gemini y otros LLM."
metadata:
  author: fernando-tellado
  version: "1.0"
  language: es-ES
---

# Humanizar texto en español

Elimina los patrones predecibles de la escritura generada por IA para que los textos en español de España suenen naturales, directos y escritos por una persona real.

## Cuándo usar esta skill

Úsala siempre que:

- Generes texto en español (artículos, guías, tutoriales, emails, copy, redes sociales)
- Edites o revises borradores para eliminar el tono artificial
- El usuario diga que algo "suena a IA", "suena robótico" o "no parece natural"
- Necesites adaptar texto generado a un estilo conversacional y cercano
- Escribas para audiencias de España (español peninsular)

## Principios fundamentales

### El mantra anti-IA

```
Escribe como hablas, no como un manual.
Di las cosas una vez, con claridad.
Confía en el lector: no le expliques lo obvio.
Varía el ritmo: mezcla frases cortas con largas.
```

### Reglas principales

1. **Elimina frases de relleno.** Quita aperturas predecibles y muletillas de énfasis. Consulta [references/palabras.md](references/palabras.md).
2. **Rompe las estructuras formulaicas.** Evita contrastes binarios, tríos forzados, preguntas retóricas con respuesta inmediata. Consulta [references/estructuras.md](references/estructuras.md).
3. **Varía el ritmo.** Mezcla la longitud de las frases. Dos elementos mejor que tres. No termines todos los párrafos igual.
4. **Confía en el lector.** Afirma directamente. No suavices, no justifiques, no lleves de la mano.
5. **Elimina frases de impacto artificial.** Si suena a titular de LinkedIn o a frase para enmarcar, reescríbela.
6. **Usa español coloquial de España.** Nada de español neutro ni latinoamericanismos formales. Tutea, usa expresiones naturales, no tengas miedo de las contracciones y formas coloquiales.

## Comprobaciones rápidas

Antes de entregar cualquier texto, revisa:

- ¿Tres frases seguidas tienen la misma longitud? Rompe una.
- ¿Un párrafo termina con frase sentenciosa tipo frase célebre? Cámbiala.
- ¿Hay una raya (—) antes de una revelación? Quítala, usa coma o punto.
- ¿Estás explicando una metáfora después de usarla? Confía en que se entiende.
- ¿Empiezas con "En el mundo actual..." o similar? Bórralo y empieza por lo que importa.
- ¿Hay más de dos conectores formales (asimismo, no obstante, por consiguiente) en un párrafo? Sustituye la mayoría por conexiones naturales.
- ¿Terminas una sección con "En definitiva" o "En resumen"? Elimínalo.
- ¿Usas gerundios vacíos al final de la frase ("contribuyendo a...", "posicionándose como...")? Reescribe con verbo conjugado.

## Palabras y frases prohibidas

Consulta la lista completa en [references/palabras.md](references/palabras.md), que incluye:

- **Palabras infladas**: panorama, ecosistema, paradigma, sinergia, catalizador, implementar, optimizar, potenciar, fomentar, abordar, brindar, garantizar, innovador
- **Muletillas de apertura**: "En el mundo actual...", "Cabe destacar que...", "Es importante señalar que..."
- **Muletillas de cierre**: "En definitiva", "En resumen", "En conclusión"
- **Conectores formales excesivos**: asimismo, no obstante, por consiguiente, en este sentido
- **Metáforas gastadas**: pilar fundamental, piedra angular, motor de cambio, tejido social, hoja de ruta
- **Inflación de importancia**: transformador, revolucionario, sin precedentes, referente, disruptivo
- **Palabras de prohibición absoluta**: iterar, iteración, fricción, granular, granularidad, epítome, inquebrantable, vibrante, crucial, indeleble, desbloquear

## Patrones estructurales a evitar

Consulta la lista completa con ejemplos en [references/estructuras.md](references/estructuras.md). Los más frecuentes:

- **Contraste negativo**: "No se trata solo de X, sino de Y" / "No es X, es Y"
- **Regla de tres**: siempre agrupar en tripletas de adjetivos, sustantivos o verbos
- **Pregunta retórica + respuesta**: "¿El resultado? Evidente."
- **Raya dramática**: uso de — para dar énfasis donde iría coma o punto
- **Gerundio colgante**: terminar frases con gerundios vacíos de significado
- **Resumen compulsivo**: recapitular al final de cada sección o párrafo
- **Falsos rangos**: "desde X hasta Y" cuando X e Y no forman un espectro real
- **Enumeración mecánica**: "En primer lugar... En segundo lugar... Por último..."

## Ejemplos de transformación

Consulta [references/ejemplos.md](references/ejemplos.md) para ver transformaciones completas de antes/después.

## Tabla de puntuación

Puntúa de 1 a 10 en cada dimensión:

| Dimensión | Pregunta clave |
|-----------|----------------|
| Naturalidad | ¿Suena a persona o a máquina? |
| Ritmo | ¿Varía la longitud de las frases o es monótono? |
| Confianza en el lector | ¿Respeta la inteligencia del lector o le explica todo? |
| Concreción | ¿Usa datos y ejemplos específicos o se queda en lo abstracto? |
| Densidad | ¿Sobra algo? ¿Cada palabra aporta? |

Por debajo de 35/50: necesita revisión seria.

## Adaptación por tipo de texto

### Artículos, guías y tutoriales
- Tono de tú a tú, como entre amigos que saben del tema
- Expresiones muy españolas: "mola", "viene de perlas", "lo típico", "ojo con esto"
- Sin formalidades innecesarias, pero sin pasarse de colegueo

### Copy comercial y marketing
- Directo, sin rodeos
- Beneficios concretos, no adjetivos vacíos
- Evitar superlativos inflados: "el mejor", "revolucionario", "sin precedentes"

### Documentación técnica
- Clara y precisa, sin adornos
- Instrucciones directas: "haz esto", "ve aquí", "configura así"
- Sin introducciones filosóficas sobre el tema

### Emails y comunicación profesional
- Natural pero respetuoso
- Sin muletillas de cortesía excesiva
- Ir al grano desde la primera línea

### Redes sociales
- Conversacional y breve
- Sin emojis salvo que el usuario los pida
- Sin hashtags artificiales ni frases motivacionales

## Proceso de revisión

Cuando revises texto generado:

1. Lee el texto completo de un tirón. Si algo "suena a IA", márcalo.
2. Comprueba las palabras contra [references/palabras.md](references/palabras.md). Sustituye cada una.
3. Comprueba las estructuras contra [references/estructuras.md](references/estructuras.md). Reestructura cada patrón detectado.
4. Varía el ritmo: rompe series de frases con longitud similar.
5. Elimina todo lo que no aporte información nueva.
6. Lee en voz alta mentalmente. Si suena a discurso institucional, reescribe.
7. Puntúa con la tabla de arriba. Si está por debajo de 35, revisa de nuevo.

## Notas importantes

- Esta skill no cambia el significado ni los datos del texto, solo la forma de expresarlos.
- No se trata de escribir mal a propósito ni de meter errores. Se trata de escribir con personalidad.
- Un texto puede ser preciso, bien documentado y profesional sin sonar a robot.
- Las listas de palabras prohibidas no son absolutas: una palabra de la lista puede usarse si es la más precisa para el contexto. Lo que se evita es el uso automático y recurrente.

## Referencias

- [Wikipedia: Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing) — Guía de WikiProject AI Cleanup
- [stop-slop](https://github.com/hardikpandya/stop-slop) — Skill de Hardik Pandya para eliminar patrones IA (MIT)
- [humanizer](https://github.com/blader/humanizer) — Skill de blader basada en Wikipedia (MIT)
- [The AI-isms of Writing Bible](https://docs.google.com/document/d/1l3OLrnWaXUqH0ycS-0so65Hd6ayxSQqUypRtrFHMt3M/) — Documento comunitario de patrones IA
- [Novelcrafter: AI-isms](https://www.novelcrafter.com/help/faq/ai-and-prompting/ai-isms) — Lista de la comunidad de escritores de ficción
