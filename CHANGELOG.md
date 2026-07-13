# Changelog

## [1.0.0] - 2025-07-13

### 安全修复

- **命令注入修复**: 将所有用户输入拼接到 shell 命令的调用点从 `execSync` 字符串拼接迁移到 `spawnSync` 参数数组，彻底消除注入风险
- 新增 `spawn(command, args[])` 工具函数，底层使用 `spawnSync`，不经过 shell

### BUG 修复

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

### 文档

- **README**: 全面重写，补充所有新命令、CLI flags、开发命令说明
- **CHANGELOG**: 新增本文件
