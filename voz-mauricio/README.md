# Voz clonada de Mauricio – Service Hogar Belgrano

Cuando se pida "mi voz" / "la voz de Mauricio", usar esto.

## Versión actual: v1

- Plataforma: fal.ai (credencial `fal.run` ya guardada en el entorno; no pegar la key).
- Clonación: `POST https://fal.run/fal-ai/minimax/voice-clone`
  - `audio_url`: muestra de voz (se puede mandar como data URI base64)
  - `model`: `speech-02-hd`, `accuracy`: `0.7`, `noise_reduction`: `true`
- **ID de voz v1:** `Voice881fd0551793920332`
- Muestra usada: 54 s, leída con el texto de grabación (ver abajo). El audio NO se guarda en el repo.
- Hosts a permitir en el entorno: `v3b.fal.media`

## Generar audio con esta voz

`POST https://fal.run/fal-ai/minimax/speech-02-hd`

```json
{
  "text": "…",
  "voice_setting": {"voice_id": "Voice881fd0551793920332", "speed": 1.0, "vol": 1, "pitch": 0},
  "language_boost": "Spanish",
  "output_format": "url"
}
```

Reglas del texto: números con letras, "..." para pausas, voseo, y la firma final "Service Hogar Belgrano... tu hogar, en buenas manos."

## Aviso importante

Es posible que el ID de una voz clonada **venza si no se usa por varios días**. Si el ID falla, volver a clonar con una muestra nueva y actualizar este archivo.

## Cómo mejorar la voz

Mauricio manda más audios (limpios, sin ruido, sin picos en el máximo). Se unen con los anteriores, se vuelve a clonar y se anota acá el nuevo ID como v2, v3, etc. (dejando el anterior como respaldo).

## Texto de grabación usado

Hola, ¿cómo andás? Soy [nombre], de Service Hogar Belgrano. Arreglamos lavarropas, heladeras, calefones, cocinas y estufas. Si se te rompió algo en casa, no te preocupes. Lo revisamos, te explicamos qué pasó y lo dejamos funcionando. Trabajo prolijo, con repuestos originales y garantía escrita. […] Service Hogar Belgrano: tu hogar, en buenas manos.
