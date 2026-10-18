---
name: souche-sync
description: Use when syncing a project's npm dependencies into the Souche internal registry (同步依赖到内部源 / snpm sync / registry.npm.souche-inc.com). Reads package.json deps, switches to node 12, batch-syncs via snpm, then restores registry and node version. No CLI required.
---

# Souche 依赖同步

把 `package.json` 里的依赖（`dependencies` + `devDependencies`）同步到 Souche 内部 npm 仓库，用 `snpm sync` 完成。全程 bash 脚本，不依赖任何 CLI。

## 前置条件

- 内部 npm 源：`http://registry.npm.souche-inc.com/`
- 全局安装 `snpm`（仅在 node 12 下可用）：`nvm use 12 && npm install -g snpm`
- 在项目根目录执行（读取 `package.json`）。

## 原理

`snpm sync <pkg...>` 会把包从中转源拉取并同步进内部仓库，但只能在 node 12 下运行。因此流程是：切 node 12 → 换 registry → 分批 sync → 恢复 registry 和 node 版本。

## 执行步骤

### 1. 记录原始环境（用于收尾还原）

```bash
originalRegistry=$(npm config get registry)
originalNode=$(node --version)
```

### 2. 读取依赖

从 `package.json` 取 `dependencies` 与 `devDependencies` 的 key 并合并。空则退出。

### 3. 切环境并分批同步

```bash
source ~/.nvm/nvm.sh
nvm use 12 > /dev/null 2>&1
if ! command -v snpm &> /dev/null; then
  echo "未检测到 snpm，请执行: nvm use 12 && npm install -g snpm"
  exit 1
fi
npm config set registry http://registry.npm.souche-inc.com/

# 依赖按每批 5 个拆分，后台并发执行
snpm sync dep1 dep2 dep3 dep4 dep5 &
snpm sync dep6 dep7 ... &
wait
```

### 4. 还原环境

```bash
npm config set registry "$originalRegistry"
nvm use "${originalNode#v}" > /dev/null 2>&1
```

## 注意事项

- **必须**还原 registry 和 node 版本，否则污染用户全局环境。
- 单个包 sync 失败不中断整批（后台任务）；如需严格失败即停，改写为串行（去掉 `&`，逐批 `wait`）。
- 依赖较多时每批 5 个是保守值，可按需调大（如 10）。
- 切 node 12 需要 nvm，`spawn` 类不经 shell 的方式加载不了 `~/.nvm/nvm.sh`，所以这里用 bash 脚本执行是必要的。