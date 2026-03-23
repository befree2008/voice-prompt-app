#!/usr/bin/env sh

# 发生错误时终止
set -e

# 构建
npm run build

# 进入构建输出目录
cd dist

# 初始化 git 并提交
git init
git add -A
git commit -m 'deploy'

# 推送到 gh-pages 分支
# 把下面的 <USERNAME> 改成你的 GitHub 用户名
# 把 <REPO> 改成你的仓库名（默认 voice-prompt-app）
git push -f git@github.com:<USERNAME>/voice-prompt-app.git main:gh-pages

cd -
