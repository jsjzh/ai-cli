---
name: souche-deploy
description: Use when deploying a Souche front-end project through the internal DevOps platform (触发构建部署 / deploy 当前项目 / 选择应用流水线分支部署). Walks the app → pipeline → branch → build flow via the Souche DevOps HTTP APIs, no CLI required.
---

# Souche DevOps 部署

通过 Souche 内部 DevOps 平台的 HTTP 接口，把当前路径的项目触发一次构建部署。全程只用 `curl` + 交互选择，不依赖任何 CLI。

## 前置条件

- 已登录 Souche SSO，持有 `_security_token_inc`（浏览器 cookie 中同名键的值）。
- 在目标项目根目录执行（需要读取 `package.json` 的 `name`）。
- Token 缓存文件：`~/.aiclirc`，结构 `{ "security_token_inc": "..." }`（文件不存在则创建）。

## 认证

所有请求同时携带 header 和 cookie：

```
-security_token_inc: <token>          # header
Cookie: _security_token_inc=<token>   # cookie
```

## 执行流程

每一步都是 chain 的输入，任一步 `success=false` 就停下把 `msg` 报给用户。

### 1. 取 token 并校验

先读缓存，没有就让用户提供，然后调「获取用户信息」验证：

```bash
curl -s 'https://sso.souche-inc.com/httpApi/getAuthZ.json' \
  -H '_security_token_inc: <token>' \
  -b '_security_token_inc=<token>'
```

- `success=true` → 有效，缓存到 `~/.aiclirc`，记下 `data.displayName`。
- `success=false`（如 `msg: 尚未登录`）→ token 失效，请用户重新提供，重复校验直到通过。

### 2. 查询应用 → appId

用当前目录 `package.json` 的 `name` 作为 `appName`：

```bash
curl -s 'https://cybertron-application-api.souche-inc.com/application/list?appName=<name>&page=1&pageSize=20' \
  -H '_security_token_inc: <token>' -b '_security_token_inc=<token>'
```

`data.items` 可能多个，让用户选择，展示 `appName | appPersonInCharge | appTeam`，取选中项的 `appId`。

### 3. appId → projectId

```bash
curl -s 'https://wireless-devops.souche-inc.com/api/project/findProjectIdbyAppId?appId=<appId>' \
  -H '_security_token_inc: <token>' -b '_security_token_inc=<token>'
```

取 `data.projectId`。

### 4. projectId → 流水线

```bash
curl -s 'https://wireless-devops.souche-inc.com/api/project/pipelines?projectId=<projectId>' \
  -H '_security_token_inc: <token>' -b '_security_token_inc=<token>'
```

`data` 是数组，让用户选择，展示 `name | 环境: parameters.buildEnv | 部署: parameters.deployHost`，取选中项的 `id` 作为 `projectPipelineId`。

### 5. projectId → gitlabProjectId → 分支

```bash
curl -s 'https://wireless-devops.souche-inc.com/api/project/info?projectId=<projectId>' \
  -H '_security_token_inc: <token>' -b '_security_token_inc=<token>'
```

取 `data.gitlabProjectId`，再拉分支：

```bash
curl -s 'https://wireless-devops.souche-inc.com/api/gitlab/branches?gitlabProjectId=<gitlabProjectId>' \
  -H '_security_token_inc: <token>' -b '_security_token_inc=<token>'
```

`data` 是数组，让用户选择，展示 `name | commit.author_name | commit.title [commit.short_id]`，取选中项的 `name` 作为 `branch`、`commit.id` 作为 `commitId`。

### 6. 触发构建

```bash
curl -s 'https://wireless-devops.souche-inc.com/api/project/pipeline/run' \
  -H '_security_token_inc: <token>' \
  -H 'content-type: application/json;charset=UTF-8' \
  -b '_security_token_inc=<token>' \
  --data-raw '{"projectId":<projectId>,"projectPipelineId":<projectPipelineId>,"branch":"<branch>","commitId":"<commitId>"}'
```

`success=true` 即触发成功。只负责触发，不追踪构建状态。

## 出错处理

| 场景 | 处理 |
|---|---|
| 无 `package.json` / 无 `name` | 报错退出 |
| token 校验失败 | 循环让用户重新输入直到通过 |
| 应用列表为空 | 报错退出（该 `name` 无匹配应用） |
| 任意接口 `success=false` | 报错退出并打印 `msg` |
| 无流水线 / 无分支 | 报错退出 |