# `cli souche deploy` 需求文档

## 1. 概述

在 `cli souche` 下新增一个 `deploy` 子命令，用于将当前路径的前端项目通过 Souche 内部 DevOps 平台进行构建部署。

**命令格式**: `cli souche deploy`

---

## 2. 交互流程

```
cli souche deploy
  │
  ├─ [1] 检查 ~/.aiclirc 是否存在
  │    ├─ 存在 → 读取 security_token_inc
  │    └─ 不存在 → 创建文件，写入 security_token_inc = ""
  │
  ├─ [2] 调用「获取用户信息」接口校验 token
  │    ├─ success=true → 继续
  │    └─ success=false → 进入 token 输入流程
  │
  ├─ [3] Token 输入流程（循环直到校验通过）
  │    ├─ 提示用户输入 token
  │    ├─ 调用「获取用户信息」接口校验
  │    └─ 校验通过 → 写入 ~/.aiclirc
  │
  ├─ [4] 读取当前目录 package.json 的 name
  │    └─ 调用「查询应用」接口 → 展示列表让用户选择
  │
  ├─ [5] 调用「根据 appId 获取 projectId」接口
  │
  ├─ [6] 调用「根据 projectId 获取流水线配置」接口 → 展示列表让用户选择
  │
  ├─ [7] 调用「根据 projectId 获取 gitlabProjectId」接口
  │    └─ 再调用「获取分支」接口 → 展示列表让用户选择（展示分支 + commit 信息）
  │
  └─ [8] 调用「执行构建」接口
       └─ 参数: projectId, projectPipelineId, branch, commitId
```

---

## 3. 详细步骤

### 3.1 配置文件 (~/.aiclirc)

- 路径: `~/.aiclirc`
- 格式: JSON，包含字段 `security_token_inc`
- 初始值: `{ "security_token_inc": "" }`
- 校验通过后将有效的 token 写入此文件

### 3.2 Token 校验与输入

- `security_token_inc` 通过 **request header** `_security_token_inc` 发送（所有后续 API 调用均携带此 header）
- 调用「获取用户信息」接口:
  - 返回 `success: true` → token 有效，继续
  - 返回 `success: false` → token 无效，进入交互式输入
- Token 输入验证循环:
  1. 使用 inquirer 提示用户输入 token
  2. 调用接口校验
  3. 未通过则继续提示，直到通过为止
  4. 通过后将 token 写入 `~/.aiclirc`

### 3.3 查询应用

- 读取当前目录 `package.json` 的 `name` 字段
- 调用「查询应用」接口，以 `name` 作为 `appName` 参数
- 返回列表可能包含多个应用，使用 inquirer 让用户选择
- 选择时展示: `应用名(appName) / 负责人 / 所属团队`

### 3.4 获取 projectId

- 用选中应用的 `appId` 调用「根据 appId 获取 projectId」接口
- 返回 `data.projectId`

### 3.5 选择流水线

- 用 `projectId` 调用「根据 projectId 获取流水线配置」接口
- 返回流水线列表，使用 inquirer 让用户选择
- 选择时展示: `流水线名称 / 部署环境(buildEnv) / 部署地址(deployHost)`
- 选中后获得 `projectPipelineId`（即接口返回的 `id`）

### 3.6 选择分支

- 用 `projectId` 调用「根据 projectId 获取 gitlabProjectId」接口，得到 `gitlabProjectId`
- 用 `gitlabProjectId` 调用「获取分支」接口
- 返回分支列表（每个分支包含 `name` 和 `commit.id`），使用 inquirer 让用户选择
- 选择时展示: `分支名 / 最新提交作者 / 提交信息 / commit short_id`
- 选中后获得 `branch` 和 `commitId`

### 3.7 执行构建

- 参数:
  - `projectId` — 来自步骤 3.4
  - `projectPipelineId` — 来自步骤 3.5 所选流水线的 `id`
  - `branch` — 来自步骤 3.6 所选分支的 `name`
  - `commitId` — 来自步骤 3.6 所选分支的 `commit.id`
- 调用「执行构建」接口
- 展示构建结果

---

## 4. API 参考

所有 API 请求均需在 header 中携带 `_security_token_inc: <token>`。

### 4.1 获取用户信息

```
GET https://sso.souche-inc.com/httpApi/getAuthZ.json
Header: _security_token_inc: <token>
```

**成功返回**:
```json
{
  "success": true,
  "code": "200",
  "msg": "获取登录数据成功",
  "data": {
    "displayName": "金哲豪",
    "userId": "gAQ1abnPaU",
    "userName": "18368094601",
    "email": "jinzhehao@souche.com",
    "organization": "souche",
    "headImg": "..."
  }
}
```

**失败返回**:
```json
{
  "success": false,
  "code": "10001",
  "msg": "尚未登录",
  "data": { "loginUrl": "..." }
}
```

### 4.2 查询应用

```
GET https://cybertron-application-api.souche-inc.com/application/list?appName=<name>&page=1&pageSize=20
```

```json
{
  "success": true,
  "code": "200",
  "msg": "success",
  "data": {
    "items": [
      {
        "appId": "application-b290afb2f9344f8f",
        "appName": "估价助理",
        "appCode": "web-app-valuation-assistant",
        "appPersonInCharge": "金哲豪",
        "appPersonInChargeEmail": "jinzhehao@souche.com",
        "appTeam": "姚军红分管-基础技术中心-基础工具部",
        "gitLab": "git@git.souche-inc.com:Mars_WEB/web-app-valuation-assistant.git"
      }
    ],
    "totalNumber": 2,
    "totalPage": 1
  }
}
```

### 4.3 根据 appId 获取 projectId

```
GET https://wireless-devops.souche-inc.com/api/project/findProjectIdbyAppId?appId=<appId>
```

```json
{
  "success": true,
  "code": 200,
  "msg": "success",
  "data": { "projectId": 2773 }
}
```

### 4.4 根据 projectId 获取流水线配置

```
GET https://wireless-devops.souche-inc.com/api/project/pipelines?projectId=<projectId>
```

```json
{
  "success": true,
  "code": 200,
  "msg": "success",
  "data": [
    {
      "id": 6469,
      "projectId": 2773,
      "name": "测试环境",
      "parameters": {
        "buildEnv": "dev",
        "deployHost": "f2e.dasouche-inc.net",
        "nodeVersion": "22.21.1"
      }
    }
  ]
}
```

### 4.5 根据 projectId 获取 gitlabProjectId

```
GET https://wireless-devops.souche-inc.com/api/project/info?projectId=<projectId>
```

```json
{
  "success": true,
  "code": 200,
  "msg": "success",
  "data": {
    "id": 2773,
    "name": "web-app-valuation-assistant",
    "type": "webapp",
    "gitlabProjectId": "27142",
    "gitlabUrl": "git@git.souche-inc.com:Mars_WEB/web-app-valuation-assistant.git"
  }
}
```

### 4.6 根据 gitlabProjectId 获取分支

```
GET https://wireless-devops.souche-inc.com/api/gitlab/branches?gitlabProjectId=<gitlabProjectId>
```

```json
{
  "success": true,
  "code": 200,
  "msg": "success",
  "data": [
    {
      "name": "develop",
      "commit": {
        "id": "d89b242d1f73424396f7b196209b6ed7e4c505f0",
        "short_id": "d89b242d",
        "title": "feat: 修改接口",
        "author_name": "jinzhehao"
      },
      "default": false,
      "web_url": "https://git.souche-inc.com/..."
    }
  ]
}
```

### 4.7 执行构建

```
POST https://wireless-devops.souche-inc.com/api/project/pipeline/run
Content-Type: application/json;charset=UTF-8

{
  "projectId": 2773,
  "projectPipelineId": 6469,
  "branch": "develop",
  "commitId": "d89b242d1f73424396f7b196209b6ed7e4c505f0"
}
```

```json
{
  "success": true,
  "code": 200,
  "msg": "success",
  "data": {}
}
```

---

## 5. 认证方式

所有 API 请求 **同时** 携带 cookie 和 header：

```
Cookie: _security_token_inc=<token>
Header: _security_token_inc: <token>
```

---

## 6. 错误处理

| 场景 | 处理方式 |
|---|---|
| `~/.aiclirc` 读取失败 | 报错退出 |
| token 校验失败 (success=false) | 循环让用户输入，直到通过 |
| 当前目录无 `package.json` | 报错退出 |
| `package.json` 无 `name` 字段 | 报错退出 |
| 查询应用返回空列表 | 报错退出 |
| 任意 API 调用返回 `success=false` | 报错退出并打印 msg |
| 网络请求失败 | 报错退出 |

构建触发后只打印成功消息，不追踪构建状态。

---

## 7. 涉及文件

| 文件 | 操作 |
|---|---|
| `src/index.ts` | 注册 `souche deploy`，更新 HELP 文本 |
| `src/controllers/souche.ts` | 新增 `deploy` 子命令路由 |
| `src/services/souche/deploy.ts` | **新建**，核心部署流程 |
| `src/apis/index.ts` | API 调用层 |
| `src/types/api.d.ts` | 接口返回类型声明 |


