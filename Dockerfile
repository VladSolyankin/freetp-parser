# Используем официальный образ Node.js
FROM node:16


# Копируем package.json и package-lock.json (если есть)
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# установка chrome для puppeteer
RUN npx puppeteer browsers install chrome && npx puppeteer install

# Установка зависимостей
RUN apt-get update && \
    apt-get install -yq libatk1.0-0
    
# Копируем ВСЕ файлы из текущей директории (корня проекта) в корень контейнера
COPY . .

# Указываем команду для запуска приложения
CMD ["node", "index.js"]