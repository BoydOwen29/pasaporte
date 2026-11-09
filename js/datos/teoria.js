// Fichas de teoría mínima. Cada una: una fórmula en bloques, pocas reglas, ejemplos con audio
// y consignas para decir en voz alta. `escenas` dice dónde se usa.
// Roles de los bloques (colores en la UI): pregunta, aux, persona, verbo, resto, extra.
window.App = window.App || {};
App.datos = App.datos || {};

App.datos.teoria = [
  {
    id: 'oracion',
    titulo: 'La base: persona + verbo + resto',
    idea: 'En inglés siempre se dice quién hace la acción. Aunque en castellano digas "es lindo", en inglés va "It\'s nice".',
    formulas: [
      [{ t: 'I', r: 'persona' }, { t: 'need', r: 'verbo' }, { t: 'a taxi', r: 'resto' }],
      [{ t: 'It', r: 'persona' }, { t: 'is', r: 'verbo' }, { t: 'very nice', r: 'resto' }],
    ],
    reglas: [
      'Nunca arranques con el verbo: "Is very nice" está mal → "It\'s very nice".',
      'Para cosas, clima y situaciones se usa "it": It\'s cold. It\'s late. It\'s far.',
      'Edad y estados van con be: I\'m 30. I\'m tired. I\'m hungry. (No "I have 30 years").',
      '"Agree" es verbo: I agree. (No "I am agree").',
    ],
    ejemplos: [
      { en: "It's very beautiful.", es: 'Es muy lindo.' },
      { en: "I'm thirty years old.", es: 'Tengo 30 años.' },
      { en: 'I agree with you.', es: 'Estoy de acuerdo con vos.' },
      { en: "It's too expensive.", es: 'Es demasiado caro.' },
    ],
    probalo: [
      { es: 'Decí que hace frío.', en: "It's cold.", ideas: [['cold']], forma: [['it is', "it's"]] },
      { es: 'Decí que es muy lindo.', en: "It's very nice.", ideas: [['nice', 'beautiful', 'lovely', 'pretty']], forma: [['it is', "it's", 'this is']] },
      { es: 'Decí que estás de acuerdo.', en: 'I agree.', ideas: [['agree']], forma: [['i agree']] },
    ],
    escenas: ['presentarme', 'hotel'],
  },
  {
    id: 'preguntas-be',
    titulo: 'Preguntas con be (is / are)',
    idea: 'Cuando la pregunta es sobre dónde está algo, cómo es o qué es, el is/are pasa adelante de la persona.',
    formulas: [
      [{ t: 'Where', r: 'pregunta' }, { t: 'is', r: 'aux' }, { t: 'the gate', r: 'persona' }, { t: '?', r: 'resto' }],
      [{ t: 'Where', r: 'pregunta' }, { t: 'are', r: 'aux' }, { t: 'you', r: 'persona' }, { t: 'from?', r: 'resto' }],
      [{ t: '—', r: 'pregunta' }, { t: 'Is', r: 'aux' }, { t: 'breakfast', r: 'persona' }, { t: 'included?', r: 'resto' }],
    ],
    reglas: [
      'Afirmación: You are from Argentina. → Pregunta: Are you from Argentina?',
      'Con palabra de pregunta: Where / What / How + is/are + persona.',
      'Error típico: "Where you are from?" → el "are" va antes: "Where are you from?"',
      'Is para una cosa (is the gate), are para varias o para "you" (are the shops, are you).',
    ],
    ejemplos: [
      { en: 'Where is the bathroom?', es: '¿Dónde está el baño?' },
      { en: 'Is this seat free?', es: '¿Está libre este asiento?' },
      { en: 'How far is the station?', es: '¿Qué tan lejos queda la estación?' },
      { en: 'Are you from here?', es: '¿Sos de acá?' },
    ],
    probalo: [
      { es: 'Preguntá dónde está la estación.', en: 'Where is the station?', ideas: [['station']], forma: [['where is', "where's"]] },
      { es: 'Preguntá si el desayuno está incluido.', en: 'Is breakfast included?', ideas: [['breakfast']], forma: [['is breakfast', 'is the breakfast', 'is it']] },
      { es: 'Preguntale de dónde es.', en: 'Where are you from?', ideas: [['from']], forma: [['where are you']] },
    ],
    escenas: ['presentarme', 'aeropuerto', 'hotel'],
  },
  {
    id: 'preguntas-do',
    titulo: 'Preguntas con do / does',
    idea: 'Con los demás verbos (live, work, have, leave…) hace falta un ayudante: do o does. El verbo queda tal cual.',
    formulas: [
      [{ t: 'Where', r: 'pregunta' }, { t: 'do', r: 'aux' }, { t: 'you', r: 'persona' }, { t: 'live', r: 'verbo' }, { t: '?', r: 'resto' }],
      [{ t: 'What time', r: 'pregunta' }, { t: 'does', r: 'aux' }, { t: 'the flight', r: 'persona' }, { t: 'leave', r: 'verbo' }, { t: '?', r: 'resto' }],
      [{ t: '—', r: 'pregunta' }, { t: 'Do', r: 'aux' }, { t: 'you', r: 'persona' }, { t: 'have', r: 'verbo' }, { t: 'a map?', r: 'resto' }],
    ],
    reglas: [
      'Do con I / you / we / they. Does con he / she / it (una cosa: the bus, the room).',
      'Con does, el verbo no lleva -s: Does it include…? (no "Does it includes").',
      'Error típico: "Where you live?" → falta el ayudante: "Where do you live?"',
      'En negativo es igual: It doesn\'t work. I don\'t have it.',
    ],
    ejemplos: [
      { en: 'What time does the museum open?', es: '¿A qué hora abre el museo?' },
      { en: 'Do you have a table for two?', es: '¿Tienen una mesa para dos?' },
      { en: 'Does it include breakfast?', es: '¿Incluye el desayuno?' },
      { en: "The shower doesn't work.", es: 'La ducha no funciona.' },
    ],
    probalo: [
      { es: 'Preguntá a qué hora sale el tren.', en: 'What time does the train leave?', ideas: [['train']], forma: [['does']] },
      { es: 'Preguntá si tienen wifi.', en: 'Do you have Wi-Fi?', ideas: [['wifi', 'wi-fi', 'wi fi', 'internet']], forma: [['do you have']] },
      { es: 'Decí que el aire acondicionado no funciona.', en: "The air conditioning doesn't work.", ideas: [['air', 'conditioning', 'ac']], forma: [['does not', "doesn't"]] },
    ],
    escenas: ['cafe', 'aeropuerto', 'hotel'],
  },
  {
    id: 'pedir',
    titulo: 'Pedir con amabilidad',
    idea: '"I want" se entiende, pero suena brusco. Para pedir hay cuatro fórmulas fijas que sirven para todo.',
    formulas: [
      [{ t: 'Could I', r: 'aux' }, { t: 'get / have', r: 'verbo' }, { t: 'a latte', r: 'resto' }, { t: ', please?', r: 'extra' }],
      [{ t: "I'd like", r: 'aux' }, { t: 'a window seat', r: 'resto' }, { t: ', please.', r: 'extra' }],
      [{ t: 'Could you', r: 'aux' }, { t: 'help', r: 'verbo' }, { t: 'me', r: 'resto' }, { t: ', please?', r: 'extra' }],
    ],
    reglas: [
      'Could I get / Could I have + cosa → para pedir algo para vos.',
      "I'd like + cosa (o I'd like to + verbo) → para decir lo que querés.",
      'Could you + verbo → para pedirle al otro que haga algo.',
      'Is it possible to + verbo…? → para pedir algo que capaz no se puede.',
    ],
    ejemplos: [
      { en: 'Could I get a glass of water, please?', es: '¿Me das un vaso de agua?' },
      { en: "I'd like to check in, please.", es: 'Quiero hacer el check-in.' },
      { en: 'Could you take a photo of us?', es: '¿Nos sacás una foto?' },
      { en: 'Is it possible to change rooms?', es: '¿Se puede cambiar de habitación?' },
    ],
    probalo: [
      { es: 'Pedí un café.', en: 'Could I get a coffee, please?', ideas: [['coffee']], forma: [['could i', "i'd like", 'i would like', 'can i']] },
      { es: 'Pedile que hable más despacio.', en: 'Could you speak more slowly, please?', ideas: [['slow', 'slowly', 'slower']], forma: [['could you', 'can you']] },
      { es: 'Decí que querés un asiento de ventanilla.', en: "I'd like a window seat, please.", ideas: [['window']], forma: [["i'd like", 'i would like', 'could i']] },
    ],
    escenas: ['cafe', 'aeropuerto', 'hotel'],
  },
  {
    id: 'eco',
    titulo: 'La respuesta está en la pregunta',
    idea: 'Para no quedarte en blanco: repetí la pregunta dada vuelta (cambiando la persona) y agregá tu dato. Después, si querés, algo más.',
    formulas: [
      [{ t: 'Where are you from?', r: 'pregunta' }, { t: '→', r: 'extra' }, { t: "I'm from", r: 'aux' }, { t: 'Argentina.', r: 'resto' }],
      [{ t: 'Do you like it?', r: 'pregunta' }, { t: '→', r: 'extra' }, { t: 'Yes, I do.', r: 'aux' }, { t: 'I love it.', r: 'resto' }],
      [{ t: 'How long are you staying?', r: 'pregunta' }, { t: '→', r: 'extra' }, { t: "I'm staying", r: 'aux' }, { t: 'for two weeks.', r: 'resto' }],
    ],
    reglas: [
      'Paso 1, arrancá repitiendo la pregunta dada vuelta: you → I, your → my, are you → I am. Do you…? → Yes, I do / No, I don\'t.',
      'Paso 2, tu dato: completá con lo tuyo (Argentina, two weeks, a teacher).',
      'Paso 3, algo más (opcional): una razón (because…), un detalle (and…) o una pregunta de vuelta (And you?).',
      'Si no entendiste la pregunta, también hay fórmula: Sorry, could you repeat that?',
    ],
    ejemplos: [
      { en: "What do you do? → I'm a designer. I work from home.", es: '¿A qué te dedicás? → Soy diseñadora. Trabajo desde casa.' },
      { en: "Is this your first time here? → Yes, it's my first time. It's amazing!", es: '¿Es tu primera vez acá? → Sí. ¡Es increíble!' },
      { en: 'Did you like the museum? → Yes, I did. It was beautiful.', es: '¿Te gustó el museo? → Sí. Era hermoso.' },
    ],
    probalo: [
      { es: '"Where do you live?" Respondé repitiendo la pregunta y con tu dato.', en: 'I live in Buenos Aires.', ideas: [['live']], forma: [['i live']] },
      { es: '"Are you hungry?" Respondé que sí, repitiendo la pregunta.', en: 'Yes, I am. I\'m very hungry.', ideas: [['yes', 'hungry']], forma: [['i am', "i'm"]] },
      { es: '"Do you speak Spanish?" Respondé repitiendo la pregunta y sumá algo más.', en: "Yes, I do. I'm from Argentina.", ideas: [['yes', 'spanish']], forma: [['i do', 'i speak']] },
    ],
    escenas: ['presentarme', 'migraciones', 'aeropuerto'],
  },
  {
    id: 'presente-simple',
    titulo: 'Presente simple: lo de siempre y los datos fijos',
    idea: 'Para hablar de tu vida (dónde vivís, de qué trabajás) y de horarios (el vuelo sale a las 10). Con he / she / it el verbo lleva -s.',
    formulas: [
      [{ t: 'I', r: 'persona' }, { t: 'work', r: 'verbo' }, { t: 'as a designer', r: 'resto' }],
      [{ t: 'The flight', r: 'persona' }, { t: 'leaves', r: 'verbo' }, { t: 'at ten', r: 'resto' }],
      [{ t: 'It', r: 'persona' }, { t: "doesn't", r: 'aux' }, { t: 'work', r: 'verbo' }],
    ],
    reglas: [
      'I / you / we / they + verbo: I live, they work.',
      'He / she / it + verbo con -s: she lives, it costs, the bus leaves.',
      'Negativo: don\'t / doesn\'t + verbo sin -s: It doesn\'t include breakfast.',
      'La -s suena de tres formas: /s/ (works), /z/ (lives), /ɪz/ (closes).',
    ],
    ejemplos: [
      { en: 'I live in Buenos Aires.', es: 'Vivo en Buenos Aires.' },
      { en: 'I work in marketing.', es: 'Trabajo en marketing.' },
      { en: 'The museum opens at nine.', es: 'El museo abre a las nueve.' },
      { en: 'It costs twenty euros.', es: 'Cuesta veinte euros.' },
    ],
    probalo: [
      { es: 'Contá dónde vivís.', en: 'I live in Buenos Aires.', ideas: [['live']], forma: [['i live']] },
      { es: 'Decí a qué te dedicás.', en: 'I work as a…', ideas: [['work', 'am a', "i'm a", 'i am an', "i'm an", 'study']], forma: [['i work', "i'm a", 'i am a', "i'm an", 'i am an', 'i study']] },
      { es: 'Decí que el museo abre a las nueve.', en: 'The museum opens at nine.', ideas: [['museum']], forma: [['opens']] },
    ],
    escenas: ['presentarme', 'migraciones', 'hotel'],
  },
  {
    id: 'ahora-y-planes',
    titulo: 'Ahora y planes: I\'m staying / I\'m going to',
    idea: 'En un viaje casi todo es "ahora" o "lo que voy a hacer": am / is / are + verbo con -ing, o going to + verbo.',
    formulas: [
      [{ t: "I'm", r: 'aux' }, { t: 'staying', r: 'verbo' }, { t: 'at a hotel', r: 'resto' }],
      [{ t: "I'm", r: 'aux' }, { t: 'flying', r: 'verbo' }, { t: 'to Rome', r: 'resto' }],
      [{ t: "I'm going to", r: 'aux' }, { t: 'visit', r: 'verbo' }, { t: 'the Colosseum', r: 'resto' }],
    ],
    reglas: [
      'am / is / are + -ing → lo que está pasando o ya está arreglado: I\'m staying for two weeks.',
      'going to + verbo → lo que pensás hacer: I\'m going to take the train.',
      'Las preguntas de migraciones vienen así: How long are you staying? Where are you staying?',
      'Repetí la pregunta: Are you traveling alone? → No, I\'m traveling with my partner.',
    ],
    ejemplos: [
      { en: "I'm staying for two weeks.", es: 'Me quedo dos semanas.' },
      { en: "I'm traveling with my boyfriend.", es: 'Viajo con mi novio.' },
      { en: "We're going to rent a car.", es: 'Vamos a alquilar un auto.' },
      { en: "I'm here on vacation.", es: 'Estoy de vacaciones.' },
    ],
    probalo: [
      { es: 'Decí que te quedás dos semanas.', en: "I'm staying for two weeks.", ideas: [['week', 'weeks']], forma: [['staying', 'i am here', "i'm here"]] },
      { es: 'Decí que vas a tomar el tren.', en: "I'm going to take the train.", ideas: [['train']], forma: [['going to', 'gonna']] },
      { es: 'Decí que estás de vacaciones.', en: "I'm here on vacation.", ideas: [['vacation', 'holiday', 'holidays']], forma: [["i'm", 'i am']] },
    ],
    escenas: ['migraciones', 'aeropuerto', 'presentarme'],
  },
  {
    id: 'pasado',
    titulo: 'Pasado: -ed y los irregulares del viaje',
    idea: 'Para contar algo que pasó. Los regulares llevan -ed; los del viaje casi todos son irregulares y conviene sabérselos de memoria.',
    formulas: [
      [{ t: 'I', r: 'persona' }, { t: 'ordered', r: 'verbo' }, { t: 'a latte', r: 'resto' }],
      [{ t: 'We', r: 'persona' }, { t: 'went', r: 'verbo' }, { t: 'to the museum', r: 'resto' }, { t: 'yesterday', r: 'extra' }],
      [{ t: '—', r: 'pregunta' }, { t: 'Did', r: 'aux' }, { t: 'you', r: 'persona' }, { t: 'like', r: 'verbo' }, { t: 'it?', r: 'resto' }],
    ],
    reglas: [
      'La -ed suena de tres formas: /t/ (walked, booked), /d/ (ordered, stayed), /ɪd/ (wanted, waited). Casi nunca suena "e-d".',
      'Irregulares de viaje: go → went, have → had, take → took, get → got, lose → lost, buy → bought, see → saw, be → was / were.',
      'Preguntas y negativas con did + verbo normal: Did you like it? I didn\'t see it.',
      'Si decís "yesterday", el verbo tiene que ir en pasado: Yesterday I went…',
    ],
    ejemplos: [
      { en: 'I ordered a medium latte.', es: 'Pedí un latte mediano.' },
      { en: 'I lost my phone.', es: 'Perdí el celular.' },
      { en: 'We booked a room for five nights.', es: 'Reservamos una habitación por cinco noches.' },
      { en: 'The flight was delayed.', es: 'El vuelo se demoró.' },
    ],
    probalo: [
      { es: 'Decí que ayer fuiste al museo.', en: 'Yesterday I went to the museum.', ideas: [['museum']], forma: [['went']] },
      { es: 'Decí que reservaste una habitación.', en: 'I booked a room.', ideas: [['room']], forma: [['booked', 'reserved', 'have a reservation']] },
      { es: 'Decí que perdiste tu valija.', en: 'I lost my suitcase.', ideas: [['suitcase', 'bag', 'luggage']], forma: [['lost']] },
    ],
    escenas: ['cafe', 'presentarme'],
  },
  {
    id: 'ganar-tiempo',
    titulo: 'Ganar tiempo y pedir ayuda',
    idea: 'Estas frases son tu salida de emergencia. Con ellas nunca te quedás muda: si no entendiste o no te sale, lo decís.',
    formulas: [
      [{ t: 'Sorry,', r: 'extra' }, { t: 'could you', r: 'aux' }, { t: 'repeat that', r: 'verbo' }, { t: '?', r: 'resto' }],
      [{ t: 'Could you', r: 'aux' }, { t: 'speak', r: 'verbo' }, { t: 'a bit more slowly', r: 'resto' }, { t: '?', r: 'resto' }],
      [{ t: 'How do you say', r: 'pregunta' }, { t: '"valija"', r: 'resto' }, { t: 'in English?', r: 'extra' }],
    ],
    reglas: [
      'Para pensar: Let me think… / Well… / Hmm, good question.',
      'Para no entender: Sorry, could you repeat that? / Sorry, I didn\'t catch that.',
      'Para la palabra que no sale: How do you say…? / What\'s the word… It\'s like a…',
      'Usarlas no es un fracaso: es exactamente lo que hace un hablante nativo cuando no entiende.',
    ],
    ejemplos: [
      { en: 'Sorry, could you repeat that?', es: 'Perdón, ¿podés repetir?' },
      { en: 'Could you speak a bit more slowly?', es: '¿Podés hablar un poco más despacio?' },
      { en: "Let me think… I'm not sure.", es: 'Dejame pensar… No estoy segura.' },
      { en: "What's the word… It's like a bag for clothes.", es: '¿Cómo se dice…? Es como un bolso para la ropa.' },
    ],
    probalo: [
      { es: 'Pedí que te repitan.', en: 'Sorry, could you repeat that?', ideas: [['repeat', 'again', 'pardon']], forma: [['could you', 'can you', 'sorry', 'pardon']] },
      { es: 'Pedí que hablen más despacio.', en: 'Could you speak more slowly?', ideas: [['slow', 'slowly', 'slower']], forma: [['could you', 'can you']] },
      { es: 'Preguntá cómo se dice "valija".', en: 'How do you say "valija" in English?', ideas: [['how do you say', 'what is the word', "what's the word"]], forma: [['how do you say', 'what is the word', "what's the word"]] },
    ],
    escenas: ['presentarme', 'cafe', 'aeropuerto', 'migraciones', 'hotel'],
  },
];
