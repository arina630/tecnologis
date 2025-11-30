const modal = document.querySelector('#modal ');// модальное окно
const content = document.querySelector('#content');// род блок с карточками
const backdrop = document.querySelector('#backdrop');// темный фон при открытии модального окна
const progress = document.querySelector('#progress');// плашка прогресса
// const done = document.querySelector('#done');// клик по чекбоксу 
const form = document.querySelector('#form')// форма для добавления технологий


content.addEventListener('click', openCard);// слушаем клик добавляем класс открываем модальное окно
backdrop.addEventListener('click', closeModal);// слушаем клик удаляем класс закрываем модальное окно
modal.addEventListener('change', toggleTech)// слушаем изменения у модального окна input.checked
form.addEventListener('submit', createTech)// слушаем отправку формы

// title страницы
const APP_TITLE = document.title
// переменная для локал сторэйдж. ключ по которому хранятся значения
const LS_KEY = 'MY_TECHS'

const technologies = getState()


// открыть карточку
function openCard(event) {
  const data = event.target.dataset// dataset(JavaScript) = data-type(HTML)
  const tech = technologies.find(t => t.type === data.type)// t = каждый элемент массива на каждой итерации как цикл, ищем тип каждого объекта и сравниваем с текущим HTML
  if (!tech) return // если кликнули мимо карточки не откроется модальное окно

  openModal(toModal(tech), tech.title)// текущий title
}

// добавляет HTML для модального окна
function toModal(tech) {
  // если есть technologies => done:true то для input => checked атрибут ИНАЧЕ пустая строка
  const checked = tech.done ? 'checked' : ''
  return `
   <h2>${tech.title}</h2>
    <p>${tech.description}</p>
    <hr>
    <div>
      <input type="checkbox" id="done" ${checked} data-type="${tech.type}"> <!--если технология выполена передаем aттрибут checked-->
      <label for="done">Выучил</label>
    </div>
  `
}


// при клике на выполнено изменяется карточка и поле прогресса
function toggleTech(event) {
  const type = event.target.dataset.type// ищем тип по которому кликаем 
  const tech = technologies.find(t => t.type === type)// ищем технологию у которой type массива совпадает с type текущей переменной 
  tech.done = event.target.checked // изменяем ее поле 

  saveState()
  init()
}


// при открытии модального окна title  меняется в зависимости от контекста
function openModal(html, title = APP_TITLE) {
  document.title = `${title} | ${APP_TITLE}`
  modal.innerHTML = html
  modal.classList.add('open');
}

// закрыть карточку
function closeModal() {
  document.title = APP_TITLE
  modal.classList.remove('open');
}


// если длина массива technologies.length === 0, то добавляем класс "empty" ИНАЧЕ добавляем HTML элемент карточку 
function init() {
  renderCards()
  renderProgress()
}


// содержит логику подходящую только к карточкам
function renderCards() {
   if (technologies.length === 0) {
  content.innerHTML = '<p class = "empty">Технологий пока нет. Добавьте первую</p>'
} else {

  // ПОЛУЧАЕМ ДОСТУП ДО КАЖДОГО ЭЛЕМЕНТА И АВТОМАТИЗИРУЕМ ПРОЦЕСС С ПОМОЩЬЮ ЦИКЛА 
  // СОЗДАЕМ ПУСТУЮ ПЕРЕМЕННУЮ 
  let html = ''
for (let i = 0; i < technologies.length; i++) {
  // КОНСТАНТА СООТВЕТСТВУЕТ ТЕКУЩЕМУ ЭЛЕМЕНТУ С КОТОРЫМ РАБОТАЕТ ЦИКЛ
    const tech = technologies[i]
    // В ПУСТУЮ ПЕРЕМЕННУЮ ДОБАВЛЯЕМ HTML КОД
    html += toCard(tech) 
}

// HTM КОД ДОБАВЛЯЕМ В HTML ФАЙЛ В РОДИТЕЛЬСИЙ БЛОК CONTENT
content.innerHTML = html 
/*content.innerHTML = technologies.map(toCard).join('')*/
}
}


// логика относящаяся к прогрессу
function renderProgress() {
  const percent = computeProgressPercent()

  let background

  if (percent <= 30) {
    background = '#E75A5A'
  } else if (percent > 10 && percent < 70) {
    background = '#F99415'
  } else {
    background = '#73BA3C'
  }
 
  progress.style.background = background
  progress.style.width = percent + '%'
  // если процент не 0 ( => не null => не false) => добавляем к числу % : ИНАЧЕ пустая строка => ничего
  progress.textContent = percent ? percent + '%' : ''
}


// вычисляем прогресс в процентах
function computeProgressPercent() {

  // останавливаем функцию если 0 технологий
  if (technologies.length === 0) {
    return 0
  }
  
  // x => 100% 
  // 2 => 5 два пункта изучено из пяти
  // (100 * 2) / 5 вычисляем процент изученых технологий
  let doneCount = 0
  for (let i = 0; i < technologies.length; i++) {
    if (technologies[i].done) doneCount++
  }
  // высчитываем процент по формуле и ОКРУГЛЯЕМ в ту сторону которая ближе к числу!!!!!!
  return Math.round((100 * doneCount) / technologies.length)
}


// добавляем класс done зеленый цвет
function toCard(tech) {
  /*let doneClass = ''

  if (tech.done) {
    doneClass = 'done'
  }*/

    const doneClass = tech.done ? 'done' : ''
  return  `
      <div class="card ${doneClass}" data-type="${tech.type}">
        <h3 data-type="${tech.type}">${tech.title}</h3>
      </div>
    `
}


// если поля ввода не заполнены 
function isInvalid(title, description) {
  return !title.value || !description.value
}


// в конец массива новый элемент добавляем
function createTech(event) {
  // ОТМЕНЯЕТ ПЕРЕЗАГРУЗКУ ПРИ ОТПРАВКЕ ФОРМЫ
  event.preventDefault()

  /*const title = event.target.title => записано в name HTML
  const description = event.target.description => записанов name HTML =>>>>>> тот же код что и снизу*/
  const {title, description} = event.target// деструктуризация говорим какие поля у объекта забрать

  // если неичего не занесли в поля то добавляем соответсвующий подсвечивающий класс для интпутов и текстарии
  if (isInvalid(title, description)) {
    if(!title.value) title.classList.add('invalid')
      if(!description.value) description.classList.add('invalid')

        // удаляем с помощью таймера класс invalid через две секунды чтоб при клике с пустой формой он опять добавлялся
        setTimeout(() => {
          title.classList.remove('invalid')
          description.classList.remove('invalid')
        }, 2000)

    return
  }

  const newTech = {
    title: title.value,
    description: description.value,
    done: false,
    type: title.value.toLowerCase()
  }

  // в конец массива новый элемент добавляем
  technologies.push(newTech)
  title.value =''
  description.value =''

  saveState()
  init()
}


//
function saveState() {
  localStorage.setItem(LS_KEY, JSON.stringify(technologies))// переводим массив technologies в строку для localStorage
}


// получаем состояние
function getState() {
  const raw = localStorage.getItem(LS_KEY)// строка с технологиями массива technologies
  return raw ? JSON.parse(raw) : [] // получаем объект из строки
}

/////////////////////////////////////ПЕСОЧНИЦА//////////////////////////////////

/////////////////////////////////////////////////////////////////////////////
init()

