# 人生火花 · AI 聊天

一个温暖、极简的 React 聊天应用：左侧流式对话，右侧展示后台提炼的「人生火花卡片」。对话走 DeepSeek `deepseek-chat`。

## 本地运行

1. 安装依赖（若尚未安装）：

```bash
npm install
```

2. 在项目根目录的 `.env.local` 里填入你的 DeepSeek API Key：

```bash
DEEPSEEK_API_KEY=你的密钥
```

3. 启动开发服务器：

```bash
npm run dev
```

4. 打开 [http://localhost:3000](http://localhost:3000)

## 说明

- 系统提示词已写在 `src/lib/prompts.ts`
- 流式聊天接口：`POST /api/chat` → `https://api.deepseek.com/chat/completions`
- 卡片提炼接口：`POST /api/spark`（对话里出现真实情绪或生活片段时才会出卡）
# TImeline
