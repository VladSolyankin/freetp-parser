# Используем официальный образ Node.js
FROM node:16

# Копируем package.json и package-lock.json (если есть)
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем ВСЕ файлы из текущей директории (корня проекта) в корень контейнера
COPY . .

# Указываем команду для запуска приложения
CMD ["node", "index.js"]