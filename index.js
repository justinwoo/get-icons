#!/usr/bin/env node

const puppeteer = require("puppeteer");
const cp = require("child_process");
const fs = require("fs");

async function main() {
  if (process.argv.length != 4) {
    console.error("Usage: get-icons [name] [output_path]");
    process.exit(1);
  }

  const name = process.argv[2];
  const path = process.argv[3];

  console.log(`name: ${name}`);
  console.log(`path: ${path}`);

  const exists = fs.existsSync(path);
  console.log(`exists: ${exists}`);
  if (exists) process.exit(0);

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const name2 = name.replace(/ /g, "+");
  const pageURL = `https://duckduckgo.com/?iax=images&ia=images&q=${name2}+anime+wiki`;
  console.log(`pageURL: ${pageURL}`);

  await page.goto(pageURL);
  await page.waitForSelector(".tile--img__img");
  const result = await page.evaluate(() => {
    return document.querySelector(".tile--img__img").src;
  });
  await browser.close();

  const url = `${result}`;
  console.log(`url: ${url}`);

  const spawned = cp.spawnSync("curl", ["-L", url, "-o", path]);
  const status = spawned.status;
  console.log(`spawned.status: ${status}`);
  process.exit(status);
}

main();
