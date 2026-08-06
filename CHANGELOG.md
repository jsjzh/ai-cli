# Changelog

## [1.2.0] - 2026-08-06

### 功能补全

- **项目级 hook 机制**: 新增 `utils/hook.ts` 通用 hook runner，支持项目级 `.clihooks/` 钩子
  - 命名规则: `pre-<command>` / `post-<command>`（如 `.clihooks/pre-git-pull`）
  - hook 用 Node 执行（跨平台，Windows 兼容），通过 `git rev-parse --show-toplevel` 定位仓库根
  - 执行前交互确认（默认 yes 回车即执行），失败仅提示不中断主命令
- **git pull 接入 hook**: `pull.ts` 在拉取前执行 `pre-git-pull`、拉取成功后执行 `post-git-pull`，可用于 `git pull` 后自动 `uv sync` 等场景

## [1.1.0] - 2026-07-27

### 架构优化

- **跨平台兼容**: 全面适配 Windows 运行环境：
  - `gs/add.ts`: SSH config `IdentityFile` 路径转前斜杠，避免 Windows 反斜杠导致解析歧义
  - `tests/exec.test.ts`: `false`/`echo` 命令替换为 `node -e`，消除 Windows 无对应命令的问题
  - `tests/gs-config.test.ts`、`tests/git.test.ts`: 路径断言改用 `path.join`，消除硬编码 `/` 分隔符

## [1.0.9] - 2026-07-19

### 功能补全

- **原始需求归档**: 将所有原始需求文档整理至 `agents/原始需求/`，排除 undo 需求
- **最终结果文档**: 为 4 个原始需求（_init、gitInitAndPush、gitPullAndMerge、soucheSync）生成需求分析.md 和流程架构.puml
- **souche-deploy-flow.puml**: 在项目根目录生成 `cli souche deploy` 的 PlantUML 流程架构图

## [1.0.8] - 2026-07-18

### 架构优化

- **AGENTS.md**: 重写工作流规则，覆盖架构总览、代码规范、开发工作流、测试、依赖管理等完整说明

## [1.0.7] - 2026-07-17

### 架构优化

- **chalk → picocolors**: 替换颜色库，更轻量（零依赖），API 一致
- **输出美化**: 全项目统一输出风格：
  - 步骤标题用 `▶` + `cyan bold` 标记
  - 成功用 `✔` + `green`，失败用 `✖` + `red`
  - 警告/取消用 `yellow`
  - 次要信息用 `dim`
- **cli-table3**: 替代 `gs/list.ts`、`gs/current.ts` 的手工 `padEnd` 表格排版
- **withSpinner**: 创建 spinner 工具函数，用于 `gs/test.ts` SSH 连接测试（10s 超时，显示加载动画）

## [1.0.6] - 2026-07-17

### BUG 修复

- **cli --help**: 修复 `cli --help` 被当作未知命令的问题，全局帮助现在正确显示
- **utils/git**: 修复 `git status --porcelain` 中含空格文件名解析错误
- **错误处理**: 创建 `getErrorMessage()` 统一处理非 Error 抛出，替换 15 处 `(error as Error).message`
- **空 catch**: `readAiclirc` 解析失败、配置迁移失败、切回原分支失败添加错误输出

### 架构优化

- **readPackageJson**: 抽取共享工具函数，消除 `run.ts`/`sync.ts`/`deploy.ts` 中重复的 `package.json` 读取
- **createController**: 抽取共享控制器工厂，4 个控制器减少 ~127 行样板代码
- **install.ts**: 移除冗余的 `cmd` 变量（三元运算恒等）

### 功能补全

- **帮助文本**: `-v` / `-h` 短选项加入帮助文本

### 移除

- **fuse.js**: 移除模糊搜索依赖；pullAndMerge / rebase 改为子串匹配

### 测试

- **getErrorMessage**: 新增 4 个测试用例（Error / string / object / null）
- **readPackageJson**: 新增 2 个测试用例（存在 / 不存在）

## [1.0.5] - 2026-07-17

### BUG 修复

- **git push**: 修复在无远程跟踪的分支（如新分支）上 push 时 `git pull` 和 `git log origin/branch..HEAD` 崩溃的问题；自动检测远程分支是否存在，不存在则跳过拉取并使用 `-u` 推送

### 功能补全

- **git branch**: 新增 `switch`（切换分支）选项，放在操作列表第一位；通过 search-list 选择目标分支并执行 `git checkout`

## [1.0.4] - 2026-07-16

### BUG 修复

- **souche deploy**: 修复 `search-list` 选中流水线/分支后回显 `[object Object]` 的问题，打补丁 `inquirer-search-list` 改用 `choice.name` 作为选中回显文本

## [1.0.3] - 2026-07-16

### 功能补全

- **souche deploy**: 所有 inquirer 列表选择统一使用 `search-list` 支持模糊搜索

## [1.0.2] - 2026-07-15

### 架构优化

- **gs 配置存储迁移**: SSH 配置元数据从 `~/.ssh/gs-config.json` 迁移至 `~/.aiclirc`，统一 CLI 配置管理
- 旧配置自动迁移：首次读取时从 `~/.ssh/gs-config.json` 导入数据，原文件备份为 `.bak`
- `formatConfigLine` 容错：`keyType` 缺失时显示 `-` 而非 `undefined`

### 功能补全

- **souche deploy**: 新增 `cli souche deploy` 命令，支持一键部署当前项目到 Souche DevOps
  - 自动管理 `~/.aiclirc` 配置文件中的 `_security_token_inc`
  - 检查 token 有效性，失效时交互式引导用户重新输入
  - 读取 package.json, 查询应用、选择流水线、选择分支，最终触发构建
  - 首次选择应用后自动绑定当前路径 + appId 到 `~/.aiclirc`，下次部署跳过应用选择
- **API 层**: 新增 `src/apis/index.ts`，封装 7 个 Souche DevOps 接口调用
- **类型声明**: 新增 `src/types/api.d.ts`，声明所有 API 请求/响应类型
- **souche controller**: `deploy` 子命令已接入交互菜单，支持 `cli souche deploy` 直达

## [1.0.1] - 2026-07-14

### BUG 修复

- **git push**: 修复 `.trim()` 误删 `git status --porcelain` 首列空格导致 `hasStaged` 误判为 true，恢复文件选择流程
- **git push**: 提交失败后自动 `git reset` 回滚暂存状态，避免重试时误入"已暂存"路径
- **spawn**: 错误消息现在包含命令的 stderr 输出，方便排查失败原因
- **spawn**: 含空格的参数在日志/错误消息中用双引号包裹，消除显示歧义
- **spawn/inquirer 兼容性**: 将 `{ stdio: 'inherit' }` 改为 `{ stdio: ['ignore', 'inherit', 'inherit'] }`，避免 `spawnSync` 继承 stdin 导致 inquirer 的 readline 在 Node.js v24 上崩溃

## [1.0.0] - 2025-07-13

### 安全修复

- **命令注入修复**: 将所有用户输入拼接到 shell 命令的调用点从 `execSync` 字符串拼接迁移到 `spawnSync` 参数数组，彻底消除注入风险
- 新增 `spawn(command, args[])` 工具函数，底层使用 `spawnSync`，不经过 shell

### BUG 修复

- **git push**: 提交失败后自动回滚暂存状态，避免重试时误判为"已暂存变更"而跳过文件选择；错误信息现在包含 git stderr 输出
- **souche/sync**: 将并行 sync 批次大小从 10 降至 5，避免并发过高导致执行失败
- **gs/test.ts**: 修复 SSH 测试输出无法捕获的问题（移除 `stdio:'inherit'`，改用 capture stdout/stderr 判断成功关键词）
- **gs/del.ts**: 用 `existsSync` 前置检查替代空 `catch`，不再静默吞异常
- **node/update.ts**: pnpm 的 depType 选择（all/prod/dev）现在实际生效
- **pullAndMerge.ts**: 修复 stash 安全风险，使用 `try/catch/finally` 确保异常时恢复暂存并切回原分支
- **push.ts**: 修复 `gs/current.ts` 残留的 `exec` 命令注入

### 架构优化

- **抽取公共代码**: 将 `push.ts` 和 `initAndPush.ts` 中重复的文件选择逻辑提取为 `selectFilesAndStage()` 共享函数
- **Controller 鲁棒性**: 4 个 controller 的 switch 均加上 `default` 分支
- **动态列宽**: `gs/list.ts` 和 `gs/current.ts` 从硬编码 `padEnd(n)` 改为根据数据内容动态计算
- **类型收窄**: `gs-config.ts` 中 `!c.deleteTime` → `c.deleteTime == null`，同时捕获 `null` 和 `undefined`
- **测试目录**: 测试文件统一移至项目根目录 `tests/` 下

### 功能补全

- **node cache**: 新增缓存清理命令，自动识别 pnpm/yarn/npm 并执行对应缓存清理操作
- **CLI 非交互模式**: 支持 `cli <command> <subcommand>` 直达子命令，`cli --version` 查看版本，`cli --help` 查看帮助
- **Git stash 管理**: 暂存更改 / 选择恢复特定暂存 / 查看暂存列表，支持带说明暂存
- **Git log**: 查看最近 N 条提交历史（含 `--oneline --graph --decorate`）
- **Git status**: 快捷查看工作区状态
- **Git branch**: 创建分支（可选立即切换）和删除分支（安全确认）
- **Git rebase**: 模糊搜索目标分支，自动暂存未提交变更，执行变基
- **列表输入过滤**: 长列表（commit 类型 13 项、菜单 10 项、分支列表等）支持输入文字过滤 + 箭头选择
- **push 智能状态检测**: 工作区干净时直接推送（显示包含的提交）、仅暂存时跳过文件选择、有未暂存时完整流程
- **node run**: 列举当前项目 package.json 的 scripts，选择并自动执行（自动识别 pnpm/npm/yarn）

### 工程化

- **ESLint + Prettier**: 引入 ESLint flat config + Prettier，统一代码风格，支持 `pnpm lint` / `pnpm format`
- **Vitest 测试框架**: 引入 Vitest，4 个测试文件 18 个用例覆盖核心工具函数，支持 `pnpm test`
- **.gitignore**: 清理废弃条目 `.eslintcache`，添加 `pnpm-debug.log*`
- **prepublishOnly**: `npm run build` → `pnpm run build`
- **package.json**: 添加 `engines` 和 `packageManager` 字段保证环境一致

### 移除

- **nvm 功能**: 删除 `nvm.ts`（`execSync` 无法持久化到用户 shell，切换 Node 版本请直接使用 `nvm use`）
- **package.json**: 删除 `packageManager` 字段，避免因本地 pnpm 版本与声明不符导致 Corepack 报错

### 文档

- **README**: 全面重写，补充所有新命令、CLI flags、开发命令说明
- **CHANGELOG**: 新增本文件
- **AGENTS.md**: 新增工作流规则文件，自动指导 agent 完成功能后更新文档并提交代码
