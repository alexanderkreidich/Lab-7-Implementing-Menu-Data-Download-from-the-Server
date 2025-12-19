// API URL для загрузки блюд
const API_URL = 'https://edu.std-900.ist.mospolytech.ru/labs/api/dishes'

// Массив для хранения загруженных блюд
let dishes = []

// Функция загрузки блюд с сервера
async function loadDishes() {
  try {
    const response = await fetch(API_URL)
    if (!response.ok) {
      throw new Error(`Ошибка HTTP: ${response.status}`)
    }
    const data = await response.json()

    // Преобразуем данные: категория 'main' -> 'main-course' для совместимости
    dishes = data.map(dish => ({
      ...dish,
      category: dish.category === 'main' ? 'main-course' : dish.category
    }))

    // Отображаем блюда после загрузки
    displayDishes()
    updateOrderDisplay()
  } catch (error) {
    console.error('Ошибка загрузки блюд:', error)
  }
}

// Объект для хранения выбранных блюд
const selectedDishes = {
  soup: null,
  'main-course': null,
  salad: null,
  drink: null,
  dessert: null,
}

// Объект для хранения активных фильтров
const activeFilters = {
  soup: null,
  'main-course': null,
  salad: null,
  drink: null,
  dessert: null,
}

// Сортировка блюд по алфавиту
function sortDishesByName(dishesArray) {
  return dishesArray.sort((a, b) => a.name.localeCompare(b.name, 'ru'))
}

// Создание HTML для карточки блюда
function createDishCard(dish) {
  const card = document.createElement('div')
  card.className = 'dish-card'
  card.setAttribute('data-dish', dish.keyword)

  card.innerHTML = `
        <img src="${dish.image}" alt="${dish.name}" />
        <p class="dish-price">${dish.price}₽</p>
        <p class="dish-name">${dish.name}</p>
        <p class="dish-weight">${dish.count}</p>
        <button>Добавить</button>
    `

  // Добавляем обработчик клика на карточку
  card.addEventListener('click', () => selectDish(dish))

  return card
}

// Отображение блюд на странице
function displayDishes(category = null, filterKind = null) {
  const sections = document.querySelectorAll('.menu-section')

  sections.forEach((section) => {
    const categoryName = section.getAttribute('data-category')

    // Если указана конкретная категория, обрабатываем только её
    if (category && categoryName !== category) {
      return
    }

    const grid = section.querySelector('.dishes-grid')
    if (grid) {
      // Очищаем секцию
      grid.innerHTML = ''

      // Фильтруем блюда для текущей категории
      let categoryDishes = dishes.filter(
        (dish) => dish.category === categoryName
      )

      // Применяем фильтр по kind, если он установлен
      const activeFilter = filterKind || activeFilters[categoryName]
      if (activeFilter) {
        categoryDishes = categoryDishes.filter(
          (dish) => dish.kind === activeFilter
        )
      }

      // Сортируем блюда
      const sortedDishes = sortDishesByName(categoryDishes)

      // Добавляем карточки блюд
      sortedDishes.forEach((dish) => {
        grid.appendChild(createDishCard(dish))
      })
    }
  })
}

// Выбор блюда
function selectDish(dish) {
  selectedDishes[dish.category] = dish
  updateOrderDisplay()
}

// Обновление отображения заказа
function updateOrderDisplay() {
  const orderBlock = document.querySelector('.order-block')

  // Проверяем, есть ли хотя бы одно выбранное блюдо
  const hasSelection = Object.values(selectedDishes).some(
    (dish) => dish !== null
  )

  if (!hasSelection) {
    // Если ничего не выбрано
    orderBlock.innerHTML = `
            <h3>Ваш заказ</h3>
            <p>Ничего не выбрано</p>
        `
    return
  }

  // Формируем HTML для заказа
  let orderHTML = '<h3>Ваш заказ</h3>'

  // Суп
  if (selectedDishes.soup) {
    orderHTML += `
            <p><strong>Суп</strong></p>
            <p>${selectedDishes.soup.name} ${selectedDishes.soup.price}₽</p>
        `
  } else {
    orderHTML += `
            <p><strong>Суп</strong></p>
            <p>Блюдо не выбрано</p>
        `
  }

  // Главное блюдо
  if (selectedDishes['main-course']) {
    orderHTML += `
            <p><strong>Главное блюдо</strong></p>
            <p>${selectedDishes['main-course'].name} ${selectedDishes['main-course'].price}₽</p>
        `
  } else {
    orderHTML += `
            <p><strong>Главное блюдо</strong></p>
            <p>Блюдо не выбрано</p>
        `
  }

  // Салат/стартер
  if (selectedDishes.salad) {
    orderHTML += `
            <p><strong>Салат/стартер</strong></p>
            <p>${selectedDishes.salad.name} ${selectedDishes.salad.price}₽</p>
        `
  } else {
    orderHTML += `
            <p><strong>Салат/стартер</strong></p>
            <p>Блюдо не выбрано</p>
        `
  }

  // Напиток
  if (selectedDishes.drink) {
    orderHTML += `
            <p><strong>Напиток</strong></p>
            <p>${selectedDishes.drink.name} ${selectedDishes.drink.price}₽</p>
        `
  } else {
    orderHTML += `
            <p><strong>Напиток</strong></p>
            <p>Напиток не выбран</p>
        `
  }

  // Десерт
  if (selectedDishes.dessert) {
    orderHTML += `
            <p><strong>Десерт</strong></p>
            <p>${selectedDishes.dessert.name} ${selectedDishes.dessert.price}₽</p>
        `
  } else {
    orderHTML += `
            <p><strong>Десерт</strong></p>
            <p>Десерт не выбран</p>
        `
  }

  // Подсчет стоимости
  const totalPrice = calculateTotalPrice()
  orderHTML += `
        <p><strong>Стоимость заказа</strong></p>
        <p>${totalPrice}₽</p>
    `

  orderBlock.innerHTML = orderHTML
}

// Подсчет итоговой стоимости
function calculateTotalPrice() {
  let total = 0
  Object.values(selectedDishes).forEach((dish) => {
    if (dish) {
      total += dish.price
    }
  })
  return total
}

// Обработка кликов по фильтрам
function handleFilterClick(event) {
  const filterBtn = event.target
  if (!filterBtn.classList.contains('filter-btn')) return

  const section = filterBtn.closest('.menu-section')
  const category = section.getAttribute('data-category')
  const kind = filterBtn.getAttribute('data-kind')

  // Проверяем, активен ли уже этот фильтр
  const isActive = filterBtn.classList.contains('active')

  // Удаляем класс active у всех кнопок в этой секции
  section.querySelectorAll('.filter-btn').forEach((btn) => {
    btn.classList.remove('active')
  })

  if (isActive) {
    // Если фильтр был активен, отключаем его
    activeFilters[category] = null
    displayDishes(category)
  } else {
    // Активируем новый фильтр
    filterBtn.classList.add('active')
    activeFilters[category] = kind
    displayDishes(category, kind)
  }
}

// Проверка валидности комбо
function validateCombo() {
  const { soup, 'main-course': mainCourse, salad, drink, dessert } = selectedDishes

  // Комбо 1: Суп + Главное блюдо + Салат + Напиток (+ Десерт опционально)
  // Комбо 2: Суп + Главное блюдо + Напиток (+ Десерт опционально)
  // Комбо 3: Суп + Салат + Напиток (+ Десерт опционально)
  // Комбо 4: Главное блюдо + Салат + Напиток (+ Десерт опционально)
  // Комбо 5: Главное блюдо + Напиток (+ Десерт опционально)

  // Проверка 1: Ничего не выбрано
  if (!soup && !mainCourse && !salad && !drink && !dessert) {
    return {
      valid: false,
      message: 'Ничего не выбрано. Выберите блюда для заказа'
    }
  }

  // Проверка 2: Выбран только десерт или только напиток
  if (!soup && !mainCourse && !salad && drink && !dessert) {
    return {
      valid: false,
      message: 'Выберите главное блюдо'
    }
  }

  if (!soup && !mainCourse && !salad && !drink && dessert) {
    return {
      valid: false,
      message: 'Выберите главное блюдо'
    }
  }

  if (!soup && !mainCourse && !salad && drink && dessert) {
    return {
      valid: false,
      message: 'Выберите главное блюдо'
    }
  }

  // Проверка 3: Выбран суп, но нет главного блюда/салата
  if (soup && !mainCourse && !salad) {
    if (!drink) {
      return {
        valid: false,
        message: 'Выберите напиток'
      }
    }
    return {
      valid: false,
      message: 'Выберите главное блюдо/салат/стартер'
    }
  }

  // Проверка 4: Выбран салат, но нет супа/главного блюда
  if (!soup && !mainCourse && salad) {
    if (!drink) {
      return {
        valid: false,
        message: 'Выберите напиток'
      }
    }
    return {
      valid: false,
      message: 'Выберите суп или главное блюдо'
    }
  }

  // Проверка 5: Есть все, кроме напитка
  if ((soup || mainCourse || salad) && !drink) {
    return {
      valid: false,
      message: 'Выберите напиток'
    }
  }

  // Валидные комбинации
  // Комбо 1: Суп + Главное + Салат + Напиток
  if (soup && mainCourse && salad && drink) {
    return { valid: true }
  }

  // Комбо 2: Суп + Главное + Напиток
  if (soup && mainCourse && !salad && drink) {
    return { valid: true }
  }

  // Комбо 3: Суп + Салат + Напиток
  if (soup && !mainCourse && salad && drink) {
    return { valid: true }
  }

  // Комбо 4: Главное + Салат + Напиток
  if (!soup && mainCourse && salad && drink) {
    return { valid: true }
  }

  // Комбо 5: Главное + Напиток
  if (!soup && mainCourse && !salad && drink) {
    return { valid: true }
  }

  // Если не подходит ни под одну комбинацию
  return {
    valid: false,
    message: 'Выберите напиток'
  }
}

// Создание и отображение уведомления
function showNotification(message) {
  // Создаем overlay
  const overlay = document.createElement('div')
  overlay.className = 'notification-overlay'

  // Создаем уведомление
  const notification = document.createElement('div')
  notification.className = 'notification'
  notification.innerHTML = `
    <h3>${message}</h3>
    <button>Окей 👌</button>
  `

  // Добавляем на страницу
  document.body.appendChild(overlay)
  document.body.appendChild(notification)

  // Обработчик закрытия уведомления
  const closeNotification = () => {
    overlay.remove()
    notification.remove()
  }

  // Закрытие по клику на кнопку
  notification.querySelector('button').addEventListener('click', closeNotification)

  // Закрытие по клику на overlay
  overlay.addEventListener('click', closeNotification)
}

// Обработка отправки формы
function handleFormSubmit(event) {
  const validation = validateCombo()

  if (!validation.valid) {
    event.preventDefault() // Отменяем отправку формы
    showNotification(validation.message)
  }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  // Загружаем блюда с сервера
  loadDishes()

  // Добавляем обработчики для кнопок фильтров
  const filterContainers = document.querySelectorAll('.filters')
  filterContainers.forEach((container) => {
    container.addEventListener('click', handleFilterClick)
  })

  // Добавляем обработчик отправки формы
  const form = document.querySelector('.order-form')
  if (form) {
    form.addEventListener('submit', handleFormSubmit)
  }

  // Добавляем hover эффект для изображений комбо через JavaScript
  const comboImages = document.querySelectorAll('.combo-item img')
  comboImages.forEach((img) => {
    img.addEventListener('mouseenter', function() {
      this.classList.add('hovered')
    })
    img.addEventListener('mouseleave', function() {
      this.classList.remove('hovered')
    })
  })
})
