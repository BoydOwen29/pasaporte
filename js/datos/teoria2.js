// Más fichas de teoría (palabras clave y tiempos verbales) y el temario que ordena todas las fichas por sección.
// Mismo formato que teoria.js. En "probalo", tr es la traducción de la respuesta modelo.
window.App = window.App || {};
App.datos = App.datos || {};

App.datos.teoria.push(
  // ───────── Armar la frase
  {
    id: 'there-is',
    titulo: 'There is / there are: hay',
    idea: '"Hay" en inglés se dice there is (una cosa) o there are (varias). Para preguntar si hay algo, se da vuelta: Is there…? / Are there…?',
    formulas: [
      [{ t: 'There is', r: 'aux' }, { t: 'a pharmacy', r: 'resto' }, { t: 'near here', r: 'extra' }],
      [{ t: 'Is there', r: 'aux' }, { t: 'a bathroom', r: 'resto' }, { t: '?', r: 'extra' }],
      [{ t: 'There are', r: 'aux' }, { t: 'two beds', r: 'resto' }, { t: 'in the room', r: 'extra' }],
    ],
    reglas: [
      'There is (there\'s) + una cosa. There are + varias.',
      'Pregunta: Is there…? / Are there…? Respuesta: Yes, there is. / No, there isn\'t.',
      'En pasado: there was / there were.',
      'No digas "Have a pharmacy?": para "¿hay…?" siempre es Is there…?',
    ],
    ejemplos: [
      { en: 'Is there a pharmacy near here?', es: '¿Hay una farmacia cerca?' },
      { en: "There's a problem with my room.", es: 'Hay un problema con mi habitación.' },
      { en: 'Are there any tickets left?', es: '¿Quedan entradas?' },
      { en: 'There was a lot of traffic.', es: 'Había mucho tránsito.' },
    ],
    probalo: [
      { es: 'Preguntá si hay un cajero cerca.', en: 'Is there an ATM near here?', tr: '¿Hay un cajero cerca?', ideas: [['atm', 'cash machine', 'bank']], forma: [['is there']] },
      { es: 'Decí que hay un problema con la ducha.', en: "There's a problem with the shower.", tr: 'Hay un problema con la ducha.', ideas: [['shower']], forma: [['there is', "there's"]] },
      { es: 'Preguntá si hay asientos libres.', en: 'Are there any free seats?', tr: '¿Hay asientos libres?', ideas: [['seat', 'seats']], forma: [['are there', 'is there']] },
    ],
    escenas: ['hotel', 'aeropuerto'],
  },

  // ───────── Tiempos verbales
  {
    id: 'perfecto',
    titulo: 'Presente perfecto: "alguna vez" y "ya"',
    idea: 'Have / has + participio. Sirve para experiencias (¿alguna vez…?) y para cosas que ya pasaron sin decir cuándo. Si decís cuándo (yesterday, in 2019), va pasado simple.',
    formulas: [
      [{ t: 'I', r: 'persona' }, { t: 'have', r: 'aux' }, { t: 'been', r: 'verbo' }, { t: 'to Rome', r: 'resto' }],
      [{ t: '—', r: 'pregunta' }, { t: 'Have', r: 'aux' }, { t: 'you', r: 'persona' }, { t: 'ever been', r: 'verbo' }, { t: 'to Spain?', r: 'resto' }],
      [{ t: 'I', r: 'persona' }, { t: "haven't", r: 'aux' }, { t: 'checked in', r: 'verbo' }, { t: 'yet', r: 'extra' }],
    ],
    reglas: [
      'I / you / we / they have + participio; he / she / it has + participio.',
      'Have you ever…? = ¿Alguna vez…? Respuesta corta: Yes, I have. / No, I haven\'t.',
      'Already = ya; yet = todavía (en negativas y preguntas); just = recién.',
      'Con fecha o momento concreto, pasado simple: I went to Rome in 2019 (no "I have gone… in 2019").',
    ],
    ejemplos: [
      { en: 'Have you ever been to Italy?', es: '¿Alguna vez estuviste en Italia?' },
      { en: "I've never tried it.", es: 'Nunca lo probé.' },
      { en: "We've already paid.", es: 'Ya pagamos.' },
      { en: "I haven't checked in yet.", es: 'Todavía no hice el check-in.' },
    ],
    probalo: [
      { es: 'Preguntale si alguna vez estuvo en Argentina.', en: 'Have you ever been to Argentina?', tr: '¿Alguna vez estuviste en Argentina?', ideas: [['argentina']], forma: [['have you ever', 'have you been']] },
      { es: 'Decí que nunca estuviste en Londres.', en: "I've never been to London.", tr: 'Nunca estuve en Londres.', ideas: [['london']], forma: [['never been', 'have never', "haven't been"]] },
      { es: 'Decí que ya pagaste.', en: "I've already paid.", tr: 'Ya pagué.', ideas: [['paid']], forma: [['already', 'have paid', "i've paid"]] },
    ],
    escenas: ['presentarme', 'migraciones'],
  },
  {
    id: 'futuro-will',
    titulo: 'Futuro con will: decidir en el momento y prometer',
    idea: 'Will + verbo: para lo que decidís en el momento ("I\'ll have the soup"), promesas y predicciones. Para planes ya pensados, mejor going to.',
    formulas: [
      [{ t: "I'll", r: 'aux' }, { t: 'have', r: 'verbo' }, { t: 'the chicken', r: 'resto' }, { t: ', please', r: 'extra' }],
      [{ t: "I'll", r: 'aux' }, { t: 'call', r: 'verbo' }, { t: 'you', r: 'resto' }, { t: 'later', r: 'extra' }],
      [{ t: '—', r: 'pregunta' }, { t: 'Will', r: 'aux' }, { t: 'it', r: 'persona' }, { t: 'rain', r: 'verbo' }, { t: 'tomorrow?', r: 'resto' }],
    ],
    reglas: [
      'Will + verbo base, igual para todas las personas: I will, she will, they will (I\'ll, she\'ll).',
      'Negativo: won\'t (will not): I won\'t be late.',
      'En un restaurante, para elegir: I\'ll have… = voy a pedir…',
      'Plan ya decidido: I\'m going to visit… Decisión de ahora: OK, I\'ll take it.',
    ],
    ejemplos: [
      { en: "I'll have a coffee, please.", es: 'Voy a tomar un café, por favor.' },
      { en: "OK, I'll take it.", es: 'Bueno, me lo llevo.' },
      { en: "We'll be back at six.", es: 'Volvemos a las seis.' },
      { en: "Don't worry, I won't be late.", es: 'Tranqui, no voy a llegar tarde.' },
    ],
    probalo: [
      { es: 'En el restaurante, decí que vas a pedir la pasta.', en: "I'll have the pasta, please.", tr: 'Voy a pedir la pasta, por favor.', ideas: [['pasta']], forma: [["i'll", 'i will']] },
      { es: 'Decí que te lo llevás.', en: "I'll take it.", tr: 'Me lo llevo.', ideas: [['take']], forma: [["i'll", 'i will']] },
      { es: 'Decí que volvés en diez minutos.', en: "I'll be back in ten minutes.", tr: 'Vuelvo en diez minutos.', ideas: [['back']], forma: [["i'll", 'i will']] },
    ],
    escenas: ['cafe'],
  },

  // ───────── Palabras clave
  {
    id: 'can-could',
    titulo: 'Can / could: poder, pedir permiso y pedir favores',
    idea: 'Can = poder (habilidad o permiso). Could = lo mismo pero más amable, o "podía" en pasado. El verbo que sigue va siempre en forma base, sin "to".',
    formulas: [
      [{ t: 'Can I', r: 'aux' }, { t: 'pay', r: 'verbo' }, { t: 'by card?', r: 'resto' }],
      [{ t: 'Could you', r: 'aux' }, { t: 'help', r: 'verbo' }, { t: 'me?', r: 'resto' }],
      [{ t: 'I', r: 'persona' }, { t: "can't", r: 'aux' }, { t: 'find', r: 'verbo' }, { t: 'my passport', r: 'resto' }],
    ],
    reglas: [
      'Can / could + verbo base: I can swim, she can come (sin "to", sin -s).',
      'Pedir permiso: Can I…? (normal) / Could I…? (más amable).',
      'Pedir un favor: Can you…? / Could you…? (más amable).',
      'Negativo: can\'t / couldn\'t. Pasado de can: could (I couldn\'t sleep = no pude dormir).',
    ],
    ejemplos: [
      { en: 'Can I sit here?', es: '¿Me puedo sentar acá?' },
      { en: 'Could you take a photo of us?', es: '¿Nos podrías sacar una foto?' },
      { en: "I can't find my passport.", es: 'No encuentro mi pasaporte.' },
      { en: "I couldn't sleep on the plane.", es: 'No pude dormir en el avión.' },
    ],
    probalo: [
      { es: 'Preguntá si podés pagar con tarjeta.', en: 'Can I pay by card?', tr: '¿Puedo pagar con tarjeta?', ideas: [['card']], forma: [['can i', 'could i']] },
      { es: 'Pedile con amabilidad que te ayude.', en: 'Could you help me, please?', tr: '¿Me podrías ayudar, por favor?', ideas: [['help']], forma: [['could you', 'can you']] },
      { es: 'Decí que no encontrás tu valija.', en: "I can't find my suitcase.", tr: 'No encuentro mi valija.', ideas: [['suitcase', 'bag', 'luggage']], forma: [["can't", 'cannot', 'can not']] },
    ],
    escenas: ['cafe', 'aeropuerto', 'hotel'],
  },
  {
    id: 'should',
    titulo: 'Should: consejos y recomendaciones',
    idea: 'Should + verbo = "debería". Sirve para dar o pedir consejos: What should I see? / You should try the pizza.',
    formulas: [
      [{ t: 'You', r: 'persona' }, { t: 'should', r: 'aux' }, { t: 'try', r: 'verbo' }, { t: 'the pizza', r: 'resto' }],
      [{ t: 'What', r: 'pregunta' }, { t: 'should', r: 'aux' }, { t: 'I', r: 'persona' }, { t: 'see', r: 'verbo' }, { t: '?', r: 'resto' }],
      [{ t: 'We', r: 'persona' }, { t: "shouldn't", r: 'aux' }, { t: 'be', r: 'verbo' }, { t: 'late', r: 'resto' }],
    ],
    reglas: [
      'Should + verbo base para todas las personas: I should, she should (sin -s, sin "to").',
      'Pregunta: Should I…? / What should I…? = ¿Debería…? / ¿Qué debería…?',
      'Negativo: shouldn\'t = no debería.',
      'Para pedir recomendaciones a un local, es la pregunta ideal: What do you recommend? / What should we try?',
    ],
    ejemplos: [
      { en: 'What should we see in Rome?', es: '¿Qué deberíamos ver en Roma?' },
      { en: 'You should book in advance.', es: 'Deberías reservar con anticipación.' },
      { en: 'Should I take a taxi or the train?', es: '¿Me conviene tomar un taxi o el tren?' },
      { en: "We shouldn't miss the last train.", es: 'No deberíamos perder el último tren.' },
    ],
    probalo: [
      { es: 'Preguntá qué deberían ver en la ciudad.', en: 'What should we see in the city?', tr: '¿Qué deberíamos ver en la ciudad?', ideas: [['see', 'visit', 'do']], forma: [['should']] },
      { es: 'Preguntá si te conviene tomar el tren.', en: 'Should I take the train?', tr: '¿Me conviene tomar el tren?', ideas: [['train']], forma: [['should i']] },
      { es: 'Recomendale probar el helado.', en: 'You should try the ice cream.', tr: 'Tenés que probar el helado.', ideas: [['ice cream', 'gelato']], forma: [['should']] },
    ],
    escenas: ['presentarme'],
  },
  {
    id: 'would',
    titulo: 'Would: ofrecer, pedir con suavidad e imaginar',
    idea: 'Would suaviza: Would you like…? (¿querés…?), I would like = I\'d like (quisiera). También sirve para imaginar: I would love to go (me encantaría ir).',
    formulas: [
      [{ t: 'Would you', r: 'aux' }, { t: 'like', r: 'verbo' }, { t: 'a drink?', r: 'resto' }],
      [{ t: "I'd", r: 'aux' }, { t: 'like', r: 'verbo' }, { t: 'to check out', r: 'resto' }],
      [{ t: 'I', r: 'persona' }, { t: 'would', r: 'aux' }, { t: 'love', r: 'verbo' }, { t: 'to go', r: 'resto' }],
    ],
    reglas: [
      'Would you like…? = ¿Querés…? / ¿Le gustaría…? Respuesta: Yes, please. / No, thank you.',
      "I'd like + cosa / I'd like to + verbo = quisiera.",
      'Would you mind + -ing? = ¿Le molestaría…? (Would you mind closing the window?)',
      'Imaginar: I would… / It would be… = yo haría… / sería…',
    ],
    ejemplos: [
      { en: 'Would you like some water?', es: '¿Querés un poco de agua?' },
      { en: "I'd like to change my seat.", es: 'Quisiera cambiar de asiento.' },
      { en: 'Would you mind speaking more slowly?', es: '¿Le molestaría hablar más despacio?' },
      { en: 'It would be great to see the sea.', es: 'Sería genial ver el mar.' },
    ],
    probalo: [
      { es: 'Ofrecele algo de tomar.', en: 'Would you like something to drink?', tr: '¿Querés algo de tomar?', ideas: [['drink']], forma: [['would you like']] },
      { es: 'Decí que quisieras cambiar de habitación.', en: "I'd like to change rooms.", tr: 'Quisiera cambiar de habitación.', ideas: [['change', 'room', 'rooms']], forma: [["i'd like", 'i would like']] },
      { es: 'Decí que te encantaría ir.', en: 'I would love to go.', tr: 'Me encantaría ir.', ideas: [['love']], forma: [['would', "i'd"]] },
    ],
    escenas: ['cafe', 'hotel'],
  },
  {
    id: 'have-to',
    titulo: 'Have to / must / don\'t have to: obligación',
    idea: 'Have to = tener que. Must = deber (más fuerte, carteles y reglas). Ojo: don\'t have to = no hace falta, y mustn\'t = está prohibido.',
    formulas: [
      [{ t: 'I', r: 'persona' }, { t: 'have to', r: 'aux' }, { t: 'leave', r: 'verbo' }, { t: 'at six', r: 'resto' }],
      [{ t: '—', r: 'pregunta' }, { t: 'Do I', r: 'aux' }, { t: 'have to', r: 'verbo' }, { t: 'pay now?', r: 'resto' }],
      [{ t: 'You', r: 'persona' }, { t: "don't have to", r: 'aux' }, { t: 'print', r: 'verbo' }, { t: 'it', r: 'resto' }],
    ],
    reglas: [
      'Have to + verbo: I have to, she has to. Pasado: had to (tuve que).',
      'Pregunta: Do I have to…? = ¿Tengo que…?',
      "Don't have to = no hace falta (no es obligatorio).",
      'Must / mustn\'t aparece en carteles: You must show your passport. You mustn\'t smoke here.',
    ],
    ejemplos: [
      { en: 'Do I have to pay now?', es: '¿Tengo que pagar ahora?' },
      { en: 'We have to be at the airport at five.', es: 'Tenemos que estar en el aeropuerto a las cinco.' },
      { en: "You don't have to print the ticket.", es: 'No hace falta imprimir el pasaje.' },
      { en: 'I had to wait for an hour.', es: 'Tuve que esperar una hora.' },
    ],
    probalo: [
      { es: 'Preguntá si tenés que pagar ahora.', en: 'Do I have to pay now?', tr: '¿Tengo que pagar ahora?', ideas: [['pay']], forma: [['have to']] },
      { es: 'Decí que te tenés que ir.', en: 'I have to go.', tr: 'Me tengo que ir.', ideas: [['go', 'leave']], forma: [['have to', 'got to', 'gotta']] },
      { es: 'Decí que tuviste que esperar mucho.', en: 'I had to wait a long time.', tr: 'Tuve que esperar mucho.', ideas: [['wait']], forma: [['had to']] },
    ],
    escenas: ['aeropuerto', 'migraciones'],
  },
  {
    id: 'might',
    titulo: 'Might / maybe: capaz, quizás',
    idea: 'Might + verbo = "capaz que…" (no estás segura). Maybe va al principio de la frase y el verbo queda normal.',
    formulas: [
      [{ t: 'We', r: 'persona' }, { t: 'might', r: 'aux' }, { t: 'go', r: 'verbo' }, { t: 'to Florence', r: 'resto' }],
      [{ t: 'Maybe', r: 'extra' }, { t: 'we', r: 'persona' }, { t: 'can', r: 'aux' }, { t: 'meet', r: 'verbo' }, { t: 'tomorrow', r: 'resto' }],
      [{ t: 'It', r: 'persona' }, { t: 'might', r: 'aux' }, { t: 'rain', r: 'verbo' }],
    ],
    reglas: [
      'Might + verbo base: I might, she might (sin -s).',
      'Maybe + frase normal: Maybe I\'ll go. Maybe it\'s closed.',
      'Para responder sin comprometerte: Maybe! / I\'m not sure yet.',
      'May también existe, pero en una charla se usa más might o maybe.',
    ],
    ejemplos: [
      { en: 'We might stay one more day.', es: 'Capaz que nos quedamos un día más.' },
      { en: "Maybe it's closed on Mondays.", es: 'Quizás cierra los lunes.' },
      { en: 'It might be expensive.', es: 'Capaz que es caro.' },
      { en: "I'm not sure yet. Maybe!", es: 'Todavía no sé. ¡Capaz!' },
    ],
    probalo: [
      { es: 'Decí que capaz se quedan un día más.', en: 'We might stay one more day.', tr: 'Capaz que nos quedamos un día más.', ideas: [['stay']], forma: [['might', 'maybe']] },
      { es: 'Decí que quizás está cerrado.', en: "Maybe it's closed.", tr: 'Quizás está cerrado.', ideas: [['closed']], forma: [['maybe', 'might']] },
      { es: 'Respondé que todavía no sabés.', en: "I'm not sure yet.", tr: 'Todavía no sé.', ideas: [['sure']], forma: [["i'm not", 'i am not']] },
    ],
    escenas: ['presentarme'],
  },
  {
    id: 'too-either',
    titulo: 'Too / either / neither / so: "yo también" y "yo tampoco"',
    idea: 'Para coincidir con lo que dice el otro. Si es positivo: me too / so do I. Si es negativo: me neither / I don\'t either. Either y neither se usan solo con negativo.',
    formulas: [
      [{ t: 'I love it.', r: 'pregunta' }, { t: '→', r: 'extra' }, { t: 'Me too.', r: 'aux' }, { t: '/ So do I.', r: 'resto' }],
      [{ t: "I don't like it.", r: 'pregunta' }, { t: '→', r: 'extra' }, { t: 'Me neither.', r: 'aux' }, { t: "/ I don't either.", r: 'resto' }],
      [{ t: 'Either', r: 'aux' }, { t: 'is fine.', r: 'resto' }],
    ],
    reglas: [
      'Positivo: Me too. / I do too. / So do I. (yo también).',
      'Negativo: Me neither. / I don\'t either. / Neither do I. (yo tampoco). Nunca "me too" para algo negativo.',
      'Either = cualquiera de los dos: Either is fine. / Either… or… = o… o…',
      'Neither = ninguno de los dos: Neither of them works. / Neither… nor… = ni… ni…',
    ],
    ejemplos: [
      { en: "I'm tired. — Me too.", es: 'Estoy cansada. — Yo también.' },
      { en: "I don't eat meat. — Me neither.", es: 'No como carne. — Yo tampoco.' },
      { en: 'Window or aisle? — Either is fine.', es: '¿Ventanilla o pasillo? — Cualquiera está bien.' },
      { en: 'Neither of the elevators works.', es: 'No anda ninguno de los dos ascensores.' },
    ],
    probalo: [
      { es: '"I love this city!" Respondé que vos también.', en: 'Me too!', tr: '¡Yo también!', ideas: [['too', 'so do i']], forma: [['me too', 'so do i', 'i do too']] },
      { es: '"I don\'t like the cold." Respondé que vos tampoco.', en: 'Me neither.', tr: 'Yo tampoco.', ideas: [['neither', 'either']], forma: [['me neither', 'neither do i', "i don't either"]] },
      { es: '"Tea or coffee?" Decí que cualquiera está bien.', en: 'Either is fine.', tr: 'Cualquiera está bien.', ideas: [['either', 'whatever', 'any']], forma: [['either', 'is fine', 'are fine']] },
    ],
    escenas: ['presentarme'],
  },
  {
    id: 'some-any',
    titulo: 'Some / any / no: algo, alguno, nada',
    idea: 'Some en frases positivas y para ofrecer o pedir. Any en preguntas y negativas. No = ninguno / nada.',
    formulas: [
      [{ t: "I'd like", r: 'aux' }, { t: 'some', r: 'verbo' }, { t: 'water', r: 'resto' }],
      [{ t: 'Do you have', r: 'aux' }, { t: 'any', r: 'verbo' }, { t: 'rooms?', r: 'resto' }],
      [{ t: "We don't have", r: 'aux' }, { t: 'any', r: 'verbo' }, { t: 'cash', r: 'resto' }],
    ],
    reglas: [
      'Some: positivo y para pedir u ofrecer (Could I have some bread? / Would you like some tea?).',
      'Any: preguntas y negativas (Do you have any…? / I don\'t have any…).',
      'Something / anything / nothing = algo / algo-nada / nada. Someone / anyone / no one = alguien / nadie.',
      'No + cosa = ninguno: There are no rooms left. (Ojo: una sola negación en inglés.)',
    ],
    ejemplos: [
      { en: 'Could I have some more bread?', es: '¿Me podría traer un poco más de pan?' },
      { en: 'Do you have any vegetarian options?', es: '¿Tienen opciones vegetarianas?' },
      { en: "I don't need anything else.", es: 'No necesito nada más.' },
      { en: 'There are no taxis at the moment.', es: 'No hay taxis en este momento.' },
    ],
    probalo: [
      { es: 'Preguntá si tienen opciones sin gluten.', en: 'Do you have any gluten-free options?', tr: '¿Tienen opciones sin gluten?', ideas: [['gluten', 'options']], forma: [['any']] },
      { es: 'Pedí un poco más de agua.', en: 'Could I have some more water?', tr: '¿Me podría traer un poco más de agua?', ideas: [['water']], forma: [['some']] },
      { es: 'Decí que no necesitás nada más.', en: "I don't need anything else.", tr: 'No necesito nada más.', ideas: [['need']], forma: [['anything', 'nothing']] },
    ],
    escenas: ['cafe', 'hotel'],
  },
  {
    id: 'much-many',
    titulo: 'Much / many / a lot of: cantidades',
    idea: 'Many para cosas que se cuentan (many people), much para las que no (much time). En positivo, lo más fácil es a lot of para todo. Para preguntar: How much…? / How many…?',
    formulas: [
      [{ t: 'How much', r: 'pregunta' }, { t: 'is', r: 'aux' }, { t: 'it', r: 'persona' }, { t: '?', r: 'resto' }],
      [{ t: 'How many', r: 'pregunta' }, { t: 'nights', r: 'resto' }, { t: 'are you staying?', r: 'extra' }],
      [{ t: 'There are', r: 'aux' }, { t: 'a lot of', r: 'verbo' }, { t: 'people', r: 'resto' }],
    ],
    reglas: [
      'How much…? = ¿cuánto? (precio o algo que no se cuenta). How many…? = ¿cuántos?',
      'A lot of / lots of = mucho/s, sirve para todo en frases positivas.',
      'A little = un poco (no se cuenta); a few = unos pocos (se cuenta).',
      'Too much / too many = demasiado/s. Not enough = no alcanza.',
    ],
    ejemplos: [
      { en: 'How much is a ticket to the center?', es: '¿Cuánto sale un boleto al centro?' },
      { en: 'How many stops is it?', es: '¿Cuántas paradas son?' },
      { en: "There's a lot of traffic today.", es: 'Hay mucho tránsito hoy.' },
      { en: 'I speak a little English.', es: 'Hablo un poco de inglés.' },
    ],
    probalo: [
      { es: 'Preguntá cuánto sale.', en: 'How much is it?', tr: '¿Cuánto sale?', ideas: [['how much']], forma: [['how much']] },
      { es: 'Preguntá cuántas paradas son.', en: 'How many stops is it?', tr: '¿Cuántas paradas son?', ideas: [['stops', 'stop']], forma: [['how many']] },
      { es: 'Decí que hablás un poco de inglés.', en: 'I speak a little English.', tr: 'Hablo un poco de inglés.', ideas: [['english']], forma: [['a little', 'a bit']] },
    ],
    escenas: ['cafe', 'hotel'],
  },
  {
    id: 'comparar',
    titulo: 'Comparar: bigger, more expensive, the best',
    idea: 'Palabras cortas: -er / the -est (cheaper, the cheapest). Palabras largas: more / the most (more comfortable). Para comparar con otra cosa: than.',
    formulas: [
      [{ t: 'Is there', r: 'aux' }, { t: 'anything', r: 'resto' }, { t: 'cheaper', r: 'verbo' }, { t: '?', r: 'extra' }],
      [{ t: 'This one', r: 'persona' }, { t: 'is', r: 'aux' }, { t: 'more expensive', r: 'verbo' }, { t: 'than that one', r: 'resto' }],
      [{ t: "What's", r: 'aux' }, { t: 'the best', r: 'verbo' }, { t: 'way to get there?', r: 'resto' }],
    ],
    reglas: [
      'Corta: cheap → cheaper → the cheapest; big → bigger → the biggest.',
      'Larga: expensive → more expensive → the most expensive.',
      'Irregulares: good → better → the best; bad → worse → the worst; far → farther.',
      'Error típico: "more cheap" → cheaper. Comparar con algo: than (bigger than mine).',
    ],
    ejemplos: [
      { en: 'Do you have a smaller size?', es: '¿Tienen un talle más chico?' },
      { en: "What's the fastest way to the airport?", es: '¿Cuál es la forma más rápida de ir al aeropuerto?' },
      { en: 'The train is cheaper than the taxi.', es: 'El tren es más barato que el taxi.' },
      { en: 'This is the best pizza in the city.', es: 'Esta es la mejor pizza de la ciudad.' },
    ],
    probalo: [
      { es: 'Preguntá si tienen algo más barato.', en: 'Do you have anything cheaper?', tr: '¿Tienen algo más barato?', ideas: [['cheaper']], forma: [['cheaper']] },
      { es: 'Preguntá cuál es la forma más rápida de llegar al centro.', en: "What's the fastest way to the center?", tr: '¿Cuál es la forma más rápida de ir al centro?', ideas: [['center', 'centre', 'downtown']], forma: [['fastest', 'quickest', 'best']] },
      { es: 'Decí que el tren es más barato que el taxi.', en: 'The train is cheaper than the taxi.', tr: 'El tren es más barato que el taxi.', ideas: [['train', 'taxi']], forma: [['cheaper than']] },
    ],
    escenas: ['cafe'],
  },
);

// ───────── Preposiciones y artículos
App.datos.teoria.push(
  {
    id: 'prep-lugar',
    titulo: 'In / on / at: dónde',
    idea: 'In = adentro de un espacio (in the room, in Rome). On = sobre una superficie o línea (on the table, on the second floor). At = en un punto o lugar concreto (at the airport, at gate 12).',
    formulas: [
      [{ t: "I'm", r: 'aux' }, { t: 'in', r: 'verbo' }, { t: 'the hotel', r: 'resto' }],
      [{ t: "It's", r: 'aux' }, { t: 'on', r: 'verbo' }, { t: 'the first floor', r: 'resto' }],
      [{ t: "We're", r: 'aux' }, { t: 'at', r: 'verbo' }, { t: 'the station', r: 'resto' }],
    ],
    reglas: [
      'In: ciudades, países, habitaciones y lugares cerrados (in London, in my room, in the car).',
      'On: pisos, calles, superficies y transportes grandes (on the 3rd floor, on Oxford Street, on the bus, on the plane).',
      'At: un punto o un lugar donde se hace algo (at the airport, at the gate, at home, at work, at the corner).',
      'Error típico: "in the airport" para decir dónde estás esperando → at the airport. Y "in the bus" → on the bus.',
    ],
    ejemplos: [
      { en: "I'm at the airport.", es: 'Estoy en el aeropuerto.' },
      { en: 'Our room is on the third floor.', es: 'Nuestra habitación está en el tercer piso.' },
      { en: 'I left my bag on the bus.', es: 'Me olvidé el bolso en el colectivo.' },
      { en: 'We live in Buenos Aires.', es: 'Vivimos en Buenos Aires.' },
    ],
    probalo: [
      { es: 'Decí que estás en el aeropuerto.', en: "I'm at the airport.", tr: 'Estoy en el aeropuerto.', ideas: [['airport']], forma: [['at the']] },
      { es: 'Decí que tu habitación está en el segundo piso.', en: 'My room is on the second floor.', tr: 'Mi habitación está en el segundo piso.', ideas: [['floor']], forma: [['on the']] },
      { es: 'Decí que estás en el colectivo.', en: "I'm on the bus.", tr: 'Estoy en el colectivo.', ideas: [['bus']], forma: [['on the']] },
    ],
    escenas: ['hotel', 'aeropuerto'],
  },
  {
    id: 'prep-tiempo',
    titulo: 'In / on / at: cuándo',
    idea: 'At para horas (at 10 o\'clock), on para días y fechas (on Monday, on May 5th), in para meses, años y partes del día (in June, in 2027, in the morning).',
    formulas: [
      [{ t: 'The flight leaves', r: 'resto' }, { t: 'at', r: 'verbo' }, { t: '10:15', r: 'extra' }],
      [{ t: 'We arrive', r: 'resto' }, { t: 'on', r: 'verbo' }, { t: 'Monday', r: 'extra' }],
      [{ t: "We're traveling", r: 'resto' }, { t: 'in', r: 'verbo' }, { t: 'October', r: 'extra' }],
    ],
    reglas: [
      'At: horas y momentos puntuales (at 6 pm, at night, at the weekend en UK).',
      'On: días y fechas (on Friday, on my birthday, on July 4th).',
      'In: meses, años, estaciones y partes del día (in May, in 2027, in summer, in the afternoon).',
      'Sin preposición: this / next / last / every + tiempo (next week, last night, every day), tomorrow, yesterday, today.',
    ],
    ejemplos: [
      { en: 'Check-out is at eleven.', es: 'El check-out es a las once.' },
      { en: 'The museum is closed on Mondays.', es: 'El museo cierra los lunes.' },
      { en: 'We usually travel in October.', es: 'Normalmente viajamos en octubre.' },
      { en: "We're leaving next week.", es: 'Nos vamos la semana que viene.' },
    ],
    probalo: [
      { es: 'Decí que tu vuelo sale a las ocho.', en: 'My flight leaves at eight.', tr: 'Mi vuelo sale a las ocho.', ideas: [['flight', 'plane']], forma: [['at eight', 'at 8']] },
      { es: 'Decí que llegás el viernes.', en: 'I arrive on Friday.', tr: 'Llego el viernes.', ideas: [['friday']], forma: [['on friday']] },
      { es: 'Decí que viajan en octubre.', en: "We're traveling in October.", tr: 'Viajamos en octubre.', ideas: [['october']], forma: [['in october']] },
    ],
    escenas: ['aeropuerto', 'hotel'],
  },
  {
    id: 'prep-movimiento',
    titulo: 'To / into / onto / from / out of: hacia dónde',
    idea: 'Con movimiento cambian: to = hacia un destino (go to Rome), into = hacia adentro (get into the taxi), from = desde, out of = hacia afuera. Con home no va to: go home.',
    formulas: [
      [{ t: "I'm going", r: 'verbo' }, { t: 'to', r: 'aux' }, { t: 'the station', r: 'resto' }],
      [{ t: 'Get', r: 'verbo' }, { t: 'into', r: 'aux' }, { t: 'the taxi', r: 'resto' }],
      [{ t: "We're flying", r: 'verbo' }, { t: 'from', r: 'aux' }, { t: 'Madrid', r: 'resto' }, { t: 'to Rome', r: 'extra' }],
    ],
    reglas: [
      'To = hacia un destino: go to, fly to, walk to, get to (llegar a).',
      'Into / out of = entrar en / salir de: get into the car, get out of the taxi. Para transportes grandes: get on / get off the bus, the train, the plane.',
      'From… to… = desde… hasta…: from Madrid to Rome, from 9 to 5.',
      'Sin to: go home, go there, go downtown. Error típico: "arrive to" → arrive in (ciudad) / arrive at (lugar).',
    ],
    ejemplos: [
      { en: 'How do I get to the station?', es: '¿Cómo llego a la estación?' },
      { en: 'We got off the train in Florence.', es: 'Nos bajamos del tren en Florencia.' },
      { en: 'We arrived in Rome at night.', es: 'Llegamos a Roma de noche.' },
      { en: "Let's go home.", es: 'Vamos a casa.' },
    ],
    probalo: [
      { es: 'Preguntá cómo llegás al museo.', en: 'How do I get to the museum?', tr: '¿Cómo llego al museo?', ideas: [['museum']], forma: [['get to', 'go to']] },
      { es: 'Decí que vuelan de Madrid a Roma.', en: "We're flying from Madrid to Rome.", tr: 'Volamos de Madrid a Roma.', ideas: [['madrid']], forma: [['from madrid to']] },
      { es: 'Decí que tenés que bajarte en la próxima parada.', en: 'I have to get off at the next stop.', tr: 'Me tengo que bajar en la próxima parada.', ideas: [['stop']], forma: [['get off']] },
    ],
    escenas: ['aeropuerto'],
  },
  {
    id: 'for-since',
    titulo: 'For / since / ago / during: cuánto tiempo',
    idea: 'For = durante (una cantidad de tiempo): for two weeks. Since = desde (un momento): since Monday. Ago = hace (en pasado): two days ago. During = durante (algo): during the flight.',
    formulas: [
      [{ t: "I'm staying", r: 'verbo' }, { t: 'for', r: 'aux' }, { t: 'two weeks', r: 'resto' }],
      [{ t: "I've been here", r: 'verbo' }, { t: 'since', r: 'aux' }, { t: 'Monday', r: 'resto' }],
      [{ t: 'We arrived', r: 'verbo' }, { t: 'two days', r: 'resto' }, { t: 'ago', r: 'aux' }],
    ],
    reglas: [
      'For + cantidad: for ten minutes, for a week.',
      'Since + momento de inicio: since 2020, since this morning (casi siempre con have / has).',
      'Cantidad + ago = hace…: an hour ago, three years ago (con pasado simple).',
      'During + algo que pasa: during the trip, during dinner. Error típico: "since two weeks" → for two weeks.',
    ],
    ejemplos: [
      { en: "We're staying for five nights.", es: 'Nos quedamos cinco noches.' },
      { en: "I've been waiting since ten o'clock.", es: 'Estoy esperando desde las diez.' },
      { en: 'I booked it a month ago.', es: 'Lo reservé hace un mes.' },
      { en: 'I slept during the flight.', es: 'Dormí durante el vuelo.' },
    ],
    probalo: [
      { es: 'Decí que te quedás una semana.', en: "I'm staying for a week.", tr: 'Me quedo una semana.', ideas: [['week']], forma: [['for a week', 'for one week']] },
      { es: 'Decí que llegaste hace dos días.', en: 'I arrived two days ago.', tr: 'Llegué hace dos días.', ideas: [['arrived', 'got here']], forma: [['ago']] },
      { es: 'Decí que estás esperando desde las nueve.', en: "I've been waiting since nine.", tr: 'Estoy esperando desde las nueve.', ideas: [['waiting', 'wait']], forma: [['since']] },
    ],
    escenas: ['migraciones', 'presentarme'],
  },
  {
    id: 'articulos',
    titulo: 'A / an / the, o nada',
    idea: 'A / an = un, una (la primera vez, una cualquiera). The = el, la, los, las (algo conocido o único). Muchas veces en inglés no va artículo donde en castellano sí: I love pizza, people are friendly.',
    formulas: [
      [{ t: "I'd like", r: 'aux' }, { t: 'a', r: 'verbo' }, { t: 'coffee', r: 'resto' }],
      [{ t: "Where's", r: 'aux' }, { t: 'the', r: 'verbo' }, { t: 'station?', r: 'resto' }],
      [{ t: 'I', r: 'persona' }, { t: 'love', r: 'verbo' }, { t: 'Italian food', r: 'resto' }],
    ],
    reglas: [
      'An antes de sonido vocal: an apple, an hour (la h no suena), an umbrella. A antes de consonante: a hotel, a university (suena "iu").',
      'The: algo que los dos saben cuál es (the bill, the station, the hotel) o es único (the sun).',
      'Sin artículo: hablando en general (Coffee is expensive here, I love museums) y con comidas, idiomas y la mayoría de los países (in Italy, I speak English).',
      'Profesiones con a: I\'m a designer (no "I\'m designer").',
    ],
    ejemplos: [
      { en: "I'm a teacher.", es: 'Soy profesora.' },
      { en: 'Could we have the bill, please?', es: '¿Nos trae la cuenta, por favor?' },
      { en: 'People are very friendly here.', es: 'La gente es muy amable acá.' },
      { en: 'We waited for an hour.', es: 'Esperamos una hora.' },
    ],
    probalo: [
      { es: 'Decí que sos diseñadora (o tu profesión).', en: "I'm a designer.", tr: 'Soy diseñadora.', ideas: [['designer', 'teacher', 'engineer', 'doctor', 'nurse', 'lawyer', 'accountant', 'architect', 'psychologist', 'manager', 'student']], forma: [["i'm a", 'i am a', "i'm an", 'i am an']] },
      { es: 'Decí que te encanta la comida italiana (en general).', en: 'I love Italian food.', tr: 'Me encanta la comida italiana.', ideas: [['italian']], forma: [['love italian', 'like italian']] },
      { es: 'Pedí la cuenta.', en: 'Could we have the bill, please?', tr: '¿Nos trae la cuenta, por favor?', ideas: [['bill', 'check']], forma: [['the bill', 'the check']] },
    ],
    escenas: ['cafe', 'presentarme'],
  },
);

// El temario: cada sección agrupa fichas. "extra" agrega una tarjeta especial (verbos o arsenal).
App.datos.temario = [
  { id: 'arsenal', titulo: 'Para defenderte', desc: 'Frases armadas para cualquier situación, y cómo no quedarte en blanco.', fichas: ['eco', 'ganar-tiempo'], extra: 'arsenal' },
  { id: 'armar', titulo: 'Cómo se arma una frase', desc: 'El orden de las palabras, las preguntas y el "hay".', fichas: ['oracion', 'preguntas-be', 'preguntas-do', 'there-is'] },
  { id: 'tiempos', titulo: 'Tiempos verbales', desc: 'Presente, pasado, perfecto y futuro, con los verbos irregulares.', fichas: ['presente-simple', 'ahora-y-planes', 'pasado', 'perfecto', 'futuro-will'], extra: 'verbos' },
  { id: 'clave', titulo: 'Palabras clave', desc: 'can, could, should, would, have to, might, either, neither, some, any, much, many…', fichas: ['can-could', 'should', 'would', 'have-to', 'might', 'too-either', 'some-any', 'much-many', 'comparar'] },
  { id: 'preposiciones', titulo: 'Preposiciones y artículos', desc: 'in, on, at, to, into, from, for, since, ago… y cuándo va a, an, the o nada.', fichas: ['prep-lugar', 'prep-tiempo', 'prep-movimiento', 'for-since', 'articulos'] },
  { id: 'pedir', titulo: 'Pedir y resolver', desc: 'Pedir con amabilidad, reclamar y ofrecer.', fichas: ['pedir'] },
];
