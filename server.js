const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const app = express();

app.use(cors());

app.get('/api/translate', async (req, res) => {
  const word = req.query.word;
  if (!word) return res.status(400).json({ error: "No word provided" });

  try {
    const url = `https://dictionary.cambridge.org/ru/словарь/англо-русский/${encodeURIComponent(word)}`;
    
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });

    const $ = cheerio.load(response.data);

    const translation = $('.trans.dtrans').first().text().trim() || "Перевод не найден";
    
    const definition = $('.def.ddef_d').first().text().trim() || "";

    res.json({
      word: word,
      translation: translation,
      definition: definition
    });

  } catch (error) {
    console.error("Ошибка парсинга Кембриджа:", error.message);
    res.status(500).json({ error: "Не удалось получить данные из словаря" });
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});