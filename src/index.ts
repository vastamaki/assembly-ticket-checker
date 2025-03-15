import { fetch } from "bun";
import { Telegraf } from "telegraf";

const { TG_TOKEN, TG_CHAT_ID } = process.env;

const bot = new Telegraf(TG_TOKEN!);

async function fetchTikettiData() {
  console.log("Fetching data...");

  const headers = {
    accept: "*/*",
    "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
    "content-type": "text/plain",
    cookie:
      "wwwtikettifi=d58051c9c5aaab9bcb8a4cff0acccf59; *gid=GA1.2.506929771.1742059428; *fbp=fb.1.1742059428337.219178096277391743; *tt*enable_cookie=1; *ttp=01JPDDAPWM9CNK0VXWRT17RAGH*.tt.1; *gcl*au=1.1.1542724600.1742059428.1392825764.1742060187.1742060186; *ga*2FX2W87YJC=GS1.2.1742059428.1.1.1742062085.0.0.0; *ga=GA1.1.519629752.1742059428; *ga_NFEDBG25VE=GS1.1.1742059428.1.1.1742062085.59.0.0",
    dnt: "1",
    origin: "https://www.tiketti.fi",
    priority: "u=1, i",
    referer: "https://www.tiketti.fi/",
    "sec-ch-ua": '"Not:A-Brand";v="24", "Chromium";v="134"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"macOS"',
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-site",
    "user-agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36",
  };

  const data = {
    eID: 107215,
    cID: 0,
    lang: "fi",
  };

  try {
    const response = await fetch(
      "https://api.tiketti.fi/prod/net-sales/selector",
      {
        method: "POST",
        headers: headers,
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();

    const salesStatus =
      result.selector_data[0].data.sections["239987"].sales_status;

    if (salesStatus[0][5] !== "1") {
      console.log("Tickets are on sale!");

      bot.telegram.sendMessage(TG_CHAT_ID!, "Tickets are on sale!");

      return;
    }

    console.log("Tickets are not on sale!");
  } catch (error) {
    console.error("Error fetching data:", error);
    bot.telegram.sendMessage(TG_CHAT_ID!, "Error fetching data!");
  }
}

setInterval(fetchTikettiData, 1000 * 60 * 1); // Fetch data every 1 minutes

console.log("Bot started!");
bot.telegram.sendMessage(TG_CHAT_ID!, "Bot started!");

fetchTikettiData();
