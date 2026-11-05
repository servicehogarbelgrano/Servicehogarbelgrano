# Voz del locutor – Service Hogar Belgrano

Receta aprobada. Cuando se pida "la voz del locutor", usar exactamente esto.

- Plataforma: fal.ai
- Endpoint: `POST https://fal.run/fal-ai/elevenlabs/tts/eleven-v3`
- Voz: `Brian`
- `stability`: `0.6`
- `language_code`: `es`
- Credencial: `fal.run` ya guardada en el entorno (el proxy la inyecta; no pegar la key).
- Host de descarga a permitir en el entorno: `v3b.fal.media`

## Estilo (va como prefijo del texto)

`[warm, confident radio announcer, Argentine Rioplatense Spanish from Buenos Aires]`

Perfil buscado: hombre argentino de ~55 años, voz grave y cálida, locutor de radio con 30 años de trayectoria, acento rioplatense de Buenos Aires con "sh" en ll/y, dicción impecable, ritmo pausado, pausas en comas y puntos, sonrisa en la voz, cierre firme.

## Reglas del texto

- Escribir los números con letras (ej. "dos mil ciento ochenta y tres").
- Usar "..." para pausas largas.
- Voseo: "escribinos", "volvé".

## Ejemplo aprobado

```json
{
  "text": "[warm, confident radio announcer, Argentine Rioplatense Spanish from Buenos Aires] ¿Se te rompió el aire acondicionado... o el lavarropas? En Service Hogar Belgrano, lo arreglamos. Con años de experiencia, trabajo prolijo y garantía. Te esperamos en O'Higgins dos mil ciento ochenta y tres, Local once, en Belgrano. Escribinos por WhatsApp... y volvé a tener tu casa funcionando. Service Hogar Belgrano: tu hogar, en buenas manos.",
  "voice": "Brian",
  "stability": 0.6,
  "language_code": "es"
}
```
