#!/usr/bin/env node

const puppeteer = require("puppeteer");
const cp = require("child_process");
const fs = require("fs");

async function main() {
  if (process.argv.length < 4) {
    console.error("Usage: get-icons [output_prefix_path] [name1] [name2] ... [nameN]");
    process.exit(1);
  }

  const outputPrefix = process.argv[2];
  const names = process.argv.slice(3);

  console.log(`outputPrefix: ${outputPrefix}`);
  console.log(`names: ${names.join(", ")}`);

  const browser = await puppeteer.launch({ headless: false });

  const downloadImage = async (name) => {
    const page = await browser.newPage();
        const outputPath = `${outputPrefix}/${name}`;

    console.log(`name: ${name}`);
    console.log(`outputPath: ${outputPath}`);

    const exists = fs.existsSync(outputPath);
    console.log(`exists: ${exists}`);
    if (exists) {
      await page.close();
      return;
    }

    const name2 = name.replace(/ /g, "+");
    const pageURL = `https://duckduckgo.com/?iax=images&ia=images&q=${name2}+anime+wiki`;
    console.log(`pageURL: ${pageURL}`);

    await page.goto(pageURL);
    await page.waitForSelector(".tile--img__img");
    const result = await page.evaluate(() => {
      return document.querySelector(".tile--img__img").src;
    });

    const url = `${result}`;
    console.log(`url: ${url}`);

    const spawned = cp.spawnSync("curl", ["-L", url, "-o", outputPath]);
    const status = spawned.status;
    console.log(`spawned.status: ${status}`);
    if (status !== 0) {
      console.error(`Failed to download image for ${name}`);
    }

    await page.close();
  };

  const chunks = [];
  for (let i = 0; i < names.length; i += 10) {
    chunks.push(names.slice(i, i + 10));
  }

  for (const chunk of chunks) {
    await Promise.all(chunk.map(downloadImage));
  }

  await browser.close();
  process.exit(0);
}

main();
