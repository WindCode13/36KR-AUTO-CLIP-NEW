#!/bin/bash
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
PROFILE="/Users/qingtian/.puppeteer-feishu-profile"

echo "🚀 初始化专用 Chrome 配置目录..."
"$CHROME" --user-data-dir="$PROFILE"

echo "✅ 请在新打开的 Chrome 中安装 & 登录 飞书剪存插件"
echo "⚠️ 完成后关闭该窗口，再运行 node clip.js 即可自动剪藏"
