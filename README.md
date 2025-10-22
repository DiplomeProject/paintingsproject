# Getting Started with Create React App


This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## 📋 Project Structure
```
paintingsproject/
│
├── 📂public/                           # Публічні файли (зображення, статичний контент)
│
├── 📂server/                           # Серверна частина (Node.js + Express + MySQL)
│   ├── 📂config/                       # Конфігураційні файли
│   │   ├── db.js                     # Підключення до бази даних (MySQL)
│   │   └── multerConfig.js           # Налаштування для завантаження зображень (Multer)
│   │
│   ├── 📂middleware/                   # Проміжні обробники запитів
│   │   └── authMiddleware.js         # Перевірка сесії користувача (авторизація)
│   │
│   ├── 📂routes/                       # REST API маршрути (ендпоінти)
│   │   ├── authRoutes.js             # Реєстрація, логін, логаут, перевірка сесії
│   │   ├── paintingRoutes.js         # CRUD операції з картинами (створення, редагування, видалення)
│   │   └── profileRoutes.js          # Оновлення профілю художника, отримання даних автора
│   │
│   ├── 📂utils/                        # Додаткові допоміжні функції
│   │   └── createDirectory.js        # Перевірка/створення директорій користувачів
│   │
│   ├── app.js                        # Ініціалізація Express, CORS, session middleware
│   └── server.js                     # Точка входу. Запуск сервера на вказаному порту
│
├── 📂src/                              # Клієнтська частина (React)
│   ├── 📂components/                   # Головні компоненти програми
│   │   ├── 📂AuthorPage/               # Сторінка автора (портфоліо художника)
│   │   ├── 📂GalleryArtist/            # Галерея художників
│   │   ├── 📂PaintingsDetailsModal/    # Модальне вікно з деталями картини
│   │   └── 📂profilecomponents/        # Компоненти, пов'язані з профілем користувача
│   │       ├── 📂Login/                # Компонент для входу
│   │       ├── 📂Profile/              # Сторінка редагування профілю
│   │       └── 📂Register/             # Форма реєстрації нового користувача
│   │
│   ├── 📂Gallery/                      # Галерея картин
│   ├── 📂Header/                       # Верхня панель навігації
│   ├── 📂Nav/                          # Навігаційне меню
│   │
│   ├── App.js                        # Головний компонент React-додатку
│   ├── App.css                       # Основні стилі застосунку
│   ├── AppRouter.js                  # Маршрутизація сторінок (React Router)
│   ├── index.js                      # Точка входу у фронтенд-додаток
│   ├── index.css                     # Глобальні стилі
│   ├── logo.svg                      # Логотип сайту
│   └── reportWebVitals.js            # Метрики продуктивності (опціонально)
│
├── .gitignore                        # Ігнорує файли для Git
├── artgallery.db                     # Локальна база даних (якщо використовується SQLite)
├── package.json                      # Залежності клієнта і сервера
├── package-lock.json                 # Точні версії залежностей
└── README.md                         # Документація проекту (цей файл)
```

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.
