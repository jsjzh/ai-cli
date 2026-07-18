# 工作流规则

## 架构总览

```
src/
├── index.ts              # CLI 入口：解析 args → 派发到 controller
├── controllers/          # 薄层，用 createController() 将子命令映射到服务文件
├── services/<category>/  # 业务逻辑实现，每文件 export default async function name()
├── utils/                # 共享工具：exec, git, node, gs-config, controller, spinner
├── apis/index.ts         # 外部 API 封装（如 Souche DevOps）
├── types/                # `.d.ts` 类型声明（api.d.ts, inquirer-search-list.d.ts）
└── index.ts              # 入口
```

- `controller` 是唯一 import 对应 `services/<category>/` 的层
- 服务文件之间不互相引用（确有复用则抽取到 `utils/`）
- 不需要 barrel/index 文件，controller 直接 import 每个服务文件

## 代码规范

### 函数与导出
- `export default async function name(): Promise<void>` — 文件名即函数名
- 纯函数，不用 class，不用抽象层
- 辅助函数用具名导出

### 输出风格
- `pc.green('✔ ...')` — 成功
- `pc.red('✖ ...')` — 失败
- `pc.cyan('▶ ...')` — 步骤标题
- `pc.yellow('...')` — 警告 / 空状态 / 取消
- `pc.dim('...')` — 次要信息
- `pc.bold(pc.cyan('\n...\n'))` — 大标题

### Shell 执行
- **一律用** `utils/exec` 的 `spawn(command, args[])` — 参数数组，不经 shell，防注入
- 禁止 `execSync` 字符串拼接

### 错误处理
- `try/catch` + `getErrorMessage(error)`，禁止 `(error as Error).message`
- `getErrorMessage` 已处理 Error / string / object / null 四种情况

### 交互式输入
- 列表选择用 `inquirer` + `search-list`（支持模糊搜索），不用普通 `list`
- 不在交互式选择中引入新依赖（`search-list` 已通过在入口注册）

### 文件组织
- 新增服务文件不加 `index.ts`，controller 直接 `import xxx from '../services/xxx'`
- 类型声明放 `src/types/xxx.d.ts`，不用 `.ts`

## 开发工作流

### 新增命令
1. 在对应 `services/<category>/` 下新建文件，`export default async function name()`
2. 在 `controllers/<category>.ts` 中 import，并加入 `createController` 的 `choices` 和 `handlers`
3. 如果需要新分类，在 `src/index.ts` 的 `switch` 和 `HELP` 常量中追加

### BUG 修复
- 先 `grep` 所有调用方，在共享函数/根因处加 guard，不在每个调用方贴补丁
- 涉及 `spawn`/`exec` 的变更必须验证参数不走 shell 拼接

### 测试
- 非三行逻辑的工具函数应在 `tests/*.test.ts` 加 Vitest 用例
- 测试覆盖：正常路径 + 边界（空 / null / undefined / 异常）
- 运行 `pnpm test` 确保不破坏现有用例

### 依赖管理
- 优先用标准库 / 已有依赖
- 新依赖必须有充分理由（一个 npm 包 < 30 行代码则自己写）

### 完成工作后的流程

1. **更新 CHANGELOG.md**
   - 对应版本下找到 `### 功能补全`、`### BUG 修复`、`### 架构优化` 等分区添加条目
   - 条目格式：`- **模块名**: 具体改动描述`
2. **更新 README.md**
   - 新增/删除命令或改变行为时，同步命令表和说明
3. **提交代码**
   - 询问用户是否执行 `git commit`
   - 同意后先更新 `package.json` 中的 `version`
   - 然后 `git add` + `git commit`

## 原则

- **短 diff 优先**：修改最少文件、最短代码，但不牺牲正确性
- **复用优先**：已有工具函数先用，不重复造轮子
- **非侵入**：不引入未要求的抽象层、配置文件、脚手架
