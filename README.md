# 🍳 吃什么 - AI菜单生成器

随机生成今日菜单，AI帮你规划做法、采购清单和出餐时间线。

## 运行方法

```bash
npm install
npm start
```

打开 http://localhost:3000

## 配置

运行前需要在项目根目录创建 `.env` 文件：

```
AZURE_OPENAI_API_KEY=你的key
AZURE_OPENAI_ENDPOINT=https://你的资源.openai.azure.com/openai/deployments/模型名/chat/completions?api-version=2025-01-01-preview
PORT=3000
```
