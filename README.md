# Website

This website is built using [Docusaurus](https://docusaurus.io/), a modern static website generator.

## Installation

```bash
npm install
```

**Note**: feel free to use the package manager of your choice.

## Local Development

```bash
npm run start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

## Build

```bash
npm run build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

## Deployment

Using SSH:

```bash
USE_SSH=true npm run deploy
```

Not using SSH:

```bash
GIT_USER=<Your GitHub username> npm run deploy
```

If you are using GitHub Pages for hosting, this command is a convenient way to build the website and push to the `gh-pages` branch.

## 📝 韓語課堂筆記自動生成 (Lesson Note Generator)

本專案配置了自動生成筆記的 Skill 與 Prompt 規範：
- **詳細使用指南與提示詞**：請參閱 [PROMPT_LESSON_GENERATOR.md](file:///c:/Users/Irene/Documents/KoreanNotes/korean-notes/docs/PROMPT_LESSON_GENERATOR.md)
- **Antigravity Skill 設定**：位於 [.agents/skills/korean-lesson-generator/SKILL.md](file:///c:/Users/Irene/Documents/KoreanNotes/korean-notes/.agents/skills/korean-lesson-generator/SKILL.md)
- **筆記模板基準**：以 [Lesson 008](file:///c:/Users/Irene/Documents/KoreanNotes/korean-notes/static/lessons/lesson-008.html) 為標準排版與互動規範（含 Web Speech TTS 發音、Tailwind CSS、初學者文法單字拆解專區、情境對話及發音音變解析）。

