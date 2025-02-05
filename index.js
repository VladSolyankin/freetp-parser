import axios from "axios";
import express from "express";
import * as cheerio from "cheerio";
import { Client, GatewayIntentBits } from "discord.js";
import cron from "node-cron";
import puppeteer from "puppeteer";

const baseUrl = "https://freetp.org/";
const BOT_TOKEN =
  "ODY1OTAwNTI3Nzk1MzA2NTA3.G5s_mv.zvK-DJy98riISXilDjhjCM9zshBR8lNnJ5jsEc";
const CHANNEL_ID = "1336489939864522782";

const app = express();

async function launchBrowser() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  return browser;
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

async function parseCoopGames() {
  try {
    const browser = await launchBrowser();
    const page = await browser.newPage();

    await page.goto(baseUrl);

    const html = await page.content();

    const $ = cheerio.load(html);
    const gameLinks = [];

    // Парсим ссылки на игры
    $("a").each((index, element) => {
      const href = $(element).attr("href");
      const text = $(element)
        .children("h1")
        .text()
        .trim()
        .replace(/[^a-zA-Z]/g, "");
      if (href && text && href.includes("/po-seti/")) {
        gameLinks.push({ href, text });
      }
    });

    const coopGames = [];

    for (const gameLink of gameLinks) {
      const gameResponse = await axios.get(gameLink.href, {
        responseType: "arraybuffer",
      });
      const html = new TextDecoder("windows-1251").decode(gameResponse.data);
      const game$ = cheerio.load(html);

      // Ищем жанр игры
      game$("span:contains('Жанр')").each((index, element) => {
        const gameGenre = game$(element).parent().text().trim();
        if (gameGenre && gameGenre.includes("Кооператив")) {
          coopGames.push({
            name: gameLink.text,
            genre: gameGenre,
            link: gameLink.href,
          });
        }
      });
    }

    return coopGames;
  } catch (error) {
    console.error("Ошибка при парсинге:", error);
    return [];
  }
}

async function sendToDiscord(games) {
  try {
    await client.login(BOT_TOKEN); // Логинимся в Discord
    const channel = await client.channels.fetch(CHANNEL_ID); // Получаем канал

    if (!channel || !channel.isTextBased()) {
      console.error("Канал не найден или не является текстовым");
      return;
    }

    // Отправляем данные в Discord
    for (const game of games) {
      await channel.send(
        `Название: ${game.name}\n${game.genre}\nСсылка: ${game.link}`
      );
    }
  } catch (error) {
    console.error("Ошибка при отправке в Discord:", error);
  } finally {
    await client.destroy(); // Завершаем работу клиента
  }
}

// Основная функция с планировщиком
async function main() {
  // Запускаем задачу каждые 60 минут
  console.log("Запуск парсинга...");
  const games = await parseCoopGames();
  if (games.length > 0) {
    console.log(`Найдено игр: ${games.length}`);
    await sendToDiscord(games);
  } else {
    console.log("Новые кооперативные игры не найдены.");
  }
}

// Слушаем 8000 порт
app.listen(8000, () => {
  console.log("Сервер запущен на порту 8000");
});

main();
