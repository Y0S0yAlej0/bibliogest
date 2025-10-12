// Array de datos curiosos sobre libros y autores
const datosCuriosos = [
  "📚 El libro más largo del mundo es 'En busca del tiempo perdido' de Marcel Proust, con más de 3,000 páginas.",
  "✍️ Agatha Christie es la autora más traducida del mundo, superando incluso a Shakespeare.",
  "🎭 William Shakespeare inventó más de 1,700 palabras en inglés que usamos hoy en día.",
  "📖 La Biblia es el libro más robado del mundo, seguido por el Guinness World Records.",
  "🔥 Ray Bradbury eligió el título 'Fahrenheit 451' porque es la temperatura a la que arde el papel.",
  "👻 Mary Shelley escribió 'Frankenstein' cuando tenía solo 18 años durante un verano lluvioso.",
  "🌍 'Don Quijote de la Mancha' es considerada la primera novela moderna de la literatura.",
  "💰 J.K. Rowling fue la primera autora en convertirse en multimillonaria gracias a sus libros.",
  "📚 Stephen King escribe al menos 2,000 palabras cada día, incluso en días festivos.",
  "🎨 Lewis Carroll era matemático y escribió 'Alicia en el País de las Maravillas' llena de acertijos matemáticos.",
  "📖 El libro más pequeño del mundo mide 0.07 x 0.10 mm y necesita ser leído con microscopio.",
  "✨ 'El Principito' ha sido traducido a más de 300 idiomas y dialectos.",
  "🦉 J.R.R. Tolkien comenzó a escribir 'El Señor de los Anillos' como secuela de 'El Hobbit' para niños.",
  "📚 Gabriel García Márquez tardó 18 meses en escribir 'Cien años de soledad'.",
  "🎭 Oscar Wilde escribió 'El retrato de Dorian Gray' en solo tres semanas.",
  "📖 El Código Da Vinci de Dan Brown fue rechazado por varias editoriales antes de su publicación.",
  "✍️ Charles Dickens escribía de pie frente a un escritorio especialmente alto.",
  "🌙 Bram Stoker nunca visitó Transilvania, lugar donde transcurre 'Drácula'.",
  "📚 Jorge Luis Borges trabajó 9 años como bibliotecario antes de dedicarse completamente a escribir.",
  "🎨 Dr. Seuss escribió 'Huevos verdes con jamón' usando solo 50 palabras diferentes.",
  "📖 Ernest Hemingway reescribió el final de 'Adiós a las armas' 39 veces hasta quedar satisfecho.",
  "✨ 'El Quijote' fue el primer libro de bolsillo de la historia, publicado en 1605.",
  "🦋 Franz Kafka pidió que quemaran todos sus manuscritos, pero su amigo los publicó tras su muerte.",
  "📚 Virginia Woolf escribía de pie para mantener la concentración y energía.",
  "🎭 Shakespeare escribió 37 obras de teatro, 154 sonetos y varios poemas largos.",
  "📖 Edgar Allan Poe inventó el género de la novela detectivesca moderna.",
  "✍️ Julio Verne predijo más de 100 inventos futuristas en sus novelas, muchos ya son realidad.",
  "🌍 'Las mil y una noches' es una recopilación de cuentos que tardó siglos en completarse.",
  "📚 Mark Twain nació y murió en años en que el cometa Halley pasó cerca de la Tierra.",
  "🎨 Antoine de Saint-Exupéry era piloto aviador y desapareció en un vuelo durante la Segunda Guerra Mundial."
];

// Función para crear y mostrar tarjetas de datos curiosos
function mostrarDatoCurioso() {
  const dato = datosCuriosos[Math.floor(Math.random() * datosCuriosos.length)];
  
  // Crear el elemento de la tarjeta
  const tarjeta = document.createElement('div');
  tarjeta.className = 'dato-curioso-card';
  tarjeta.innerHTML = `
    <div class="dato-curioso-content">
      <p>${dato}</p>
    </div>
  `;
  
  // Agregar la tarjeta al body
  document.body.appendChild(tarjeta);
  
  // Animar entrada
  setTimeout(() => {
    tarjeta.classList.add('show');
  }, 100);
  
  // Remover después de 6 segundos
  setTimeout(() => {
    tarjeta.classList.remove('show');
    setTimeout(() => {
      tarjeta.remove();
    }, 500);
  }, 8000);
}

// Detectar scroll y mostrar datos curiosos aleatoriamente
let lastScrollTop = 0;
let scrollCount = 0;

window.addEventListener('scroll', () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  
  // Solo si está bajando (scrolling down)
  if (scrollTop > lastScrollTop) {
    scrollCount++;
    
    // Mostrar un dato cada 300-500 píxeles de scroll (aleatorio)
    if (scrollCount >= Math.random() * (200 - 100) + 100) {
      mostrarDatoCurioso();
      scrollCount = 0;
    }
  }
  
  lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
});

// CSS para las tarjetas (agregar al final del archivo)
const style = document.createElement('style');
style.textContent = `
  .dato-curioso-card {
    position: fixed;
    bottom: 30px;
    right: 30px;
    max-width: 350px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 20px 25px;
    border-radius: 15px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    z-index: 9999;
    opacity: 0;
    transform: translateX(400px);
    transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }
  
  .dato-curioso-card.show {
    opacity: 1;
    transform: translateX(0);
  }
  
  .dato-curioso-content p {
    margin: 0;
    font-size: 15px;
    line-height: 1.6;
    font-weight: 500;
  }
  
  /* Responsive */
  @media (max-width: 768px) {
    .dato-curioso-card {
      bottom: 20px;
      right: 20px;
      left: 20px;
      max-width: none;
      padding: 15px 20px;
    }
    
    .dato-curioso-content p {
      font-size: 14px;
    }
  }
`;
document.head.appendChild(style);