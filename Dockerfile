# Используем официальный образ Node.js
FROM node:16

# Установка зависимостей для Puppeteer
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libxkbfile1 \
    libsecret-1-0 \
    libxss1 \
    libappindicator3-1 \
    libasound2 \
    libgbm1 \
    fonts-liberation \
    && rm -rf /var/lib/apt/lists/*

# Устанавливаем Puppeteer и его зависимости
RUN npm install puppeteer

# Копируем package.json и package-lock.json (если есть)
COPY package*.json ./

# Устанавливаем зависимости проекта
RUN npm install

# Установка chrome для Puppeteer

RUN npx puppeteer browsers install chrome

# Копируем ВСЕ файлы из текущей директории (корня проекта) в корень контейнера
COPY . .

# Указываем команду для запуска приложения
CMD ["node", "index.js"]