export type Concept = { id: string; term: string; simple: string; example: string }

export const GLOSSARY: Concept[] = [
  {
    id: 'orbita',
    term: '¿Qué es una órbita?',
    simple:
      'Es el camino que sigue un objeto al girar alrededor de otro, como una pelota atada a una cuerda que das vueltas. La gravedad es la cuerda.',
    example: 'El USAT-1 da una vuelta a la Tierra cada 90 minutos: por eso solo lo escuchás en algunos "pases".',
  },
  {
    id: 'satelite',
    term: '¿Qué es un satélite?',
    simple:
      'Una máquina que orbita la Tierra para observar, medir o comunicar. Tiene paneles solares, batería, computadora y radio.',
    example: 'Los satélites ayudan a detectar incendios, medir cultivos y predecir el clima.',
  },
  {
    id: 'gravedad',
    term: '¿Qué es la gravedad?',
    simple: 'La fuerza que atrae los objetos entre sí. Cuanto más masa, más fuerte atrae.',
    example: 'En Marte la gravedad es un 38% de la terrestre: saltarías casi tres veces más alto.',
  },
  {
    id: 'masa',
    term: '¿Qué es la masa?',
    simple: 'La cantidad de materia de un objeto. Más masa = más difícil de mover y frenar.',
    example: 'Cada tonelada extra en la nave exige más combustible para llegar a Marte.',
  },
  {
    id: 'combustible',
    term: '¿Qué es el combustible?',
    simple: 'Lo que el cohete quema para empujarse. En el espacio no hay estaciones de servicio.',
    example: 'Si gastás todo en el viaje, no queda para frenar y aterrizar.',
  },
  {
    id: 'energia',
    term: '¿De dónde sale la energía?',
    simple: 'De paneles solares, baterías o generadores nucleares. Todo a bordo la necesita.',
    example: 'Si el satélite no apunta al Sol, sus paneles no cargan y la batería se agota.',
  },
  {
    id: 'comunicacion',
    term: '¿Qué es un sistema de comunicación?',
    simple: 'Radios y antenas que envían y reciben información entre el espacio y la Tierra.',
    example: 'Más potencia y una antena bien apuntada = señal más fuerte.',
  },
  {
    id: 'estacion-terrena',
    term: '¿Qué es una estación terrena?',
    simple: 'Una antena en la Tierra que "escucha" y habla con los satélites cuando pasan por encima.',
    example: 'Las redes de radioaficionados permiten escuchar satélites desde todo el mundo.',
  },
  {
    id: 'datos',
    term: '¿Qué datos envía un satélite?',
    simple: 'Telemetría (su salud: temperatura, batería) y datos científicos (imágenes, mediciones).',
    example: 'Primero conviene saber si el satélite está sano antes de pedirle archivos grandes.',
  },
  {
    id: 'estacion-espacial',
    term: '¿Qué es una estación espacial?',
    simple: 'Un laboratorio-casa en órbita donde viven astronautas para investigar.',
    example: 'La Estación Espacial Internacional está habitada sin interrupción desde el año 2000.',
  },
  {
    id: 'traje',
    term: '¿Por qué hace falta un traje espacial?',
    simple: 'En el espacio no hay aire, hay radiación y temperaturas extremas. El traje es una nave a tu medida.',
    example: 'Proteger a la tripulación de la radiación es clave en un viaje largo a Marte.',
  },
]

export function getConcept(id?: string) {
  return GLOSSARY.find((c) => c.id === id)
}
