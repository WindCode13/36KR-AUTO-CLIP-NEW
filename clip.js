const puppeteer = require('puppeteer-core');

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', // 不能是 puppeteer 自带路径
    userDataDir: '/Users/qingtian/.puppeteer-feishu-profile',
    args: [
      '--disable-extensions-except=/Users/qingtian/Library/Application Support/Google/Chrome/Default/Extensions/mofcmpgnbnnlcdkfchnggdilcelpgegn/1.0.38_0',
      '--load-extension=/Users/qingtian/Library/Application Support/Google/Chrome/Default/Extensions/mofcmpgnbnnlcdkfchnggdilcelpgegn/1.0.38_0'
    ],
    
    defaultViewport: null,
  });

  const page = await browser.newPage();
  await page.goto('https://36kr.com/information/technology/', { waitUntil: 'networkidle2' });
  await page.waitForSelector('a.article-item-title');

  const articleLinks = await page.$$eval('a.article-item-title', links =>
    links.slice(0, 10).map(link => link.href)
  );

  console.log(`📄 找到 ${articleLinks.length} 篇文章`);

  const screenshotDir = path.resolve(__dirname, 'screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir);
  }

  for (const [i, url] of articleLinks.entries()) {
    try {
      console.log(`🔗 正在打开第 ${i + 1} 篇：${url}`);
      const articlePage = await browser.newPage();
      await articlePage.goto(url, { waitUntil: 'networkidle2' });

      try {
        await articlePage.waitForSelector('.article-container', { timeout: 5000 });
      } catch {
        console.warn(`⚠️ 第 ${i + 1} 篇未检测到正文结构，继续剪藏...`);
      }
      await articlePage.bringToFront();
      await sleep(1000);

      console.log('⏳ 调用飞书剪存...');
      execSync(`osascript feishu_clip.scpt`);

      await sleep(5000);
      const screenshotPath = path.join(screenshotDir, `article_${i + 1}.png`);
      await articlePage.screenshot({ path: screenshotPath });
      console.log(`📸 截图保存至: ${screenshotPath}`);

      await articlePage.close();
      console.log(`✅ 第 ${i + 1} 篇已完成`);
    } catch (err) {
      console.error(`❌ 第 ${i + 1} 篇失败:`, err.message);
    }
  }

  await browser.close();
})();
