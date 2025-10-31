# Stage 1: Build the React application
FROM node:alpine AS builder

# Встановіть робочий каталог у контейнері
WORKDIR /app

# Скопіюйте package.json та package-lock.json
COPY package.json package-lock.json ./

# Встановіть залежності
RUN npm install

# Скопіюйте код програми
COPY . .

# Зберіть React-застосунок
RUN npm run build

# Stage 2: Serve the built application with Nginx
FROM nginx:alpine

COPY --from=builder /app/build /usr/share/nginx/html

# Відкрийте порт, який використовує ваш застосунок
EXPOSE 80

# Запустіть застосунок
CMD ["nginx", "-g", "daemon off;"]
