# CLI - 命令行工具集

## 软链方式

```bash
npm link
```

或使用 pnpm：

```bash
pnpm link --global
```

然后在终端输入 `cli` 即可使用。

## 命令使用

### git - Git 操作

| 命令    | 说明                                       |
| ------- | ------------------------------------------ |
| `clone` | 克隆项目，可指定地址、名称、分支、深度     |
| `pull`  | 拉取当前分支最新代码                       |
| `push`  | 先拉取更新，选择提交类型和范围，提交并推送 |

### gs - Git SSH 配置管理

| 命令      | 说明                                            |
| --------- | ----------------------------------------------- |
| `add`     | 新增 SSH 配置，生成密钥，自动配置 ~/.ssh/config |
| `list`    | 列出所有 SSH 配置                               |
| `test`    | 测试 SSH 连接是否正常                           |
| `use`     | 使用指定配置的 user.name / user.email           |
| `del`     | 软删除 SSH 配置（保留 gs-config.json 记录）     |
| `current` | 查看当前 git 配置                               |

### node - Node.js 包管理

| 命令      | 说明                                     |
| --------- | ---------------------------------------- |
| `install` | 自动检测包管理器并安装依赖               |
| `update`  | 选择更新类型（all/dep/devDep），更新依赖 |
| `clean`   | 清除 node_modules 和 lock 文件后重新安装 |

## 数据存储

SSH 配置存储在 `~/.ssh/gs-config.json`，密钥文件存储在 `~/.ssh/` 目录下。

## 待办

1. 解析一下 .ssh/Config，生成 gs-config.json
2. 希望有一个功能，先切换到主分支，执行 pull，在切换到之前所在分支，执行 git merge 主分支