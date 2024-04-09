// node init.js 0x79dE83Ab9493Ef3e206d5B05EAA8bD9216261749 0x0aef75d8710e366b93e1198abaab644702e05c99766e076eeaf156addc233dd8 2

const { spawn } = require("child_process");

const processToSpawn = "./bin/buttpluggy-gpu-miner";

const [address, salt, difficulty] = process.argv.slice(2);

const expectedOutput = "->";

const telegramToken = process.env.TELEGRAM_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

const child = spawn(processToSpawn, [address, salt, difficulty]);

child.stdout.on("data", (data) => {
  const sData = data.toString();
  if (sData.includes(expectedOutput)) {
    const lines = sData.split("\n");
    const hashes = lines
      .reverse()
      .find((line) => line.startsWith("0x") && line.includes("->"));

    if (hashes) {
      console.log(`Buttplugy mined: ${hashes.toString()}`);
      sendMessageOnTelegram(`Buttplugy mined: ${hashes.toString()}`);
    }
  }
});

child.stderr.on("data", (data) => {
  console.error(`stderr: ${data}`);
});

child.on("close", (code) => {
  console.log(`child process exited with code ${code}`);
});

async function sendMessageOnTelegram(text) {
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${telegramToken}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: text,
        }),
      }
    );
    const data = await response.json();
  } catch (error) {
    console.error("Error sending message", error);
  }
}
