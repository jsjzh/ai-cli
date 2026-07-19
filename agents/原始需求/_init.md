## 需求概述

这是一个命令行工具集，用 ts 来实现，如果期间需要申请权限或者输入密码就弹出让用户授权，需要什么三方库就自己装，我希望最后可以用 npm link 到全局，然后通过 cli 就可以调用各个命令

项目目录如下

- index.ts 项目入口文件
- controllers 命令入口文件夹
  - git.ts
  - gs.ts
  - node.ts
- services 命令实现文件夹
  - git
    - clone.ts
    - pull.ts
    - push.ts
  - gs
    - add.ts
    - list.ts
    - test.ts
    - use.ts
    - del.ts
    - current.ts
  - node
    - install.ts
    - update.ts


## 需求详解

命令行交互方式如下

1. 输入 cli 回车
2. 显示 git gs node 让我选择
3. 选择了 git 之后，再出现对应的 git 下命令集合，如 clone pull push 等让用户选择，各个命令的实现如下

### git

#### clone

1. 输入地址，string 类型
2. 输入名称，string 类型，如果不输入，默认从项目地址取
3. 输入分支，string 类型，若不输入，默认不传入
4. 输入深度，number 类型，若不输入，默认不传入
5. 回车后开始 clone 项目
6. 若成功，提示用户接下来的操作：cd 项目名称
7. 若失败，将错误提示给用户

#### pull

1. 获取项目当前所在分支，执行 git pull origin 所在分支

#### push

1. 先执行 git pull 当前分支，可以调用 pull.ts 的方法，将远端的更新拉下来先，如果自动合报错则不执行后续
2. 输入提交内容 content，string 类型，必填
3. 选择提交类型 type，可选值如下，默认 chore
   1. feat: 新功能、新特性
   2. fix: 修改 bug
   3. perf: 更改代码，以提高性能
   4. refactor: 代码重构
   5. docs: 文档修改
   6. style: 代码格式修改, 注意不是 css 修改
   7. test: 测试用例新增、修改
   8. build: 影响项目构建或依赖项修改
   9. revert: 恢复上一次提交
   10. ci: 持续集成相关文件修改
   11. chore: 其他修改
   12. release: 发布新版本
   13. workflow: 工作流相关文件修改
4. 选择提交范围，可选 all 或 select，默认 all
   1. 若用户选了 all，则 git add 所有变更的文件
   2. 若用户选了 select，则列出所有变更的文件，让用户选择，空格选中，a 全选
5. 根据提交范围执行 git add
6. commit 的信息为：type: content，注意，这里的 type 只要提交类型里前面的英文即可
   1. 举例：feat: 完成新功能，合并代码
7. 执行 git push origin 当前分支
8. 提交成功后将提交的信息告诉用户，内容如下：branch 分支提交成功，提交内容为：type: content

### gs


#### add

1. 输入 origin，string 类型，是表明当前新增的是什么环境的，唯一，比如可以写 personal company 等等
   1. 输入完之后要有一个校验，和 gs-config.json 中做对比，如果重复了，报错终止命令行
2. 输入 username，string 类型，新增的 ssh 的 username
3. 输入 useremail，string 类型，新增的 ssh 的 useremail
4. 输入 host，string 类型，新增的 ssh 的 host
5. 选择生成密钥的方式，可选 ed25519 和 rsa，默认 ed25519
6. 用户选择后，用 ssh-keygen 和 useremail 生成密钥，密钥就放在 ～/.ssh 下，密钥的名称就用用户输入的 origin
7. 检测 ～/.ssh 下是否有 config 文件，没的话生成一个，有的话新增当前的 ssh 数据
8. 再记录一个 gs-config.json 文件，后续读取配置都到这个 json 里读
   1. 这里面记录 origin username useremail host 生成密钥的方式 公钥数据 deleteTime（后面读取记得过滤 deleteTime，删除用软删除）
9.  输出当前 ssh 的公钥，提示用户去对应的 host 配置公钥

#### list

1. 列出当前已有的 ssh 配置，到 gs-config.json 中读，展示内容：origin username useremail host

#### test

1. 列出所有的 config，空格选中，a 全选，默认全选，展示内容：origin username useremail host
2. 用 ssh -T 来测试所有的 ssh 是否连接正常
3. 将测试结果直接输出

#### use

1. 用户选择 use 回车后，列出用户所有的 config，按照 origin username useremail host 一行的展示方式，让用户选择
2. 判断当前目录下是否有 .git 的文件
   1. 若有的话，让用户选择是要将配置文件生效 global 还是 local，默认 local
   2. 若无的话，直接生效 global
3. 设置成功后告诉用户在 global 还是 local 设置了 config

#### del

1. 列出用户所有的 config，按照 origin username useremail host 一行的展示方式，让用户选择
2. 用户选择后，删除 ~/.ssh/config 中对应的配置，也要删除 ～/.ssh 中对应的公钥文件，还有 json 中的内容，但是 json 记得是软删除 deleteTime 删除时间
3. 最后提示用户去 host 对应的网站删除这个已经配置的公钥

#### current

1. 判断当前目录下是否有 .git 文件
   1. 若有的话，读取当前的项目的 local 信息，按照 origin username useremail host 一行的展示方式
   2. 若无的话，读取 global 的信息，按照 origin username useremail host 一行的展示方式
   3. 记得展示的时候要区分是从 local 读取的还是 global 读取的

### node

#### install

1. 分析当前项目下是用 npm yarn 还是 pnpm，可以用 lock 文件来判断，如果有多个 lock 文件，则按照 npm yarn pnpm 顺位，若无 lock 文件，则用 npm
2. 执行他们的安装依赖的命令

#### update

1. 分析当前项目下是用 npm yarn 还是 pnpm，可以用 lock 文件来判断，如果有多个 lock 文件，则按照 npm yarn pnpm 顺位，若无 lock 文件，则用 npm
2. 让用户选择需要更新的依赖类型，可选 all dep devDep，默认 all
3. 执行他们 update 的命令，比如 npm 是 npm update xxx，yarn 是 yarn upgrade xxx

## 需求结尾

等项目生成后，在项目根目录生成一个 README.md 的文件，里面记录如下内容

1. 该项目的安装方法，比如：npm install -g xxx
2. 软链方式，比如：npm link
3. 各个命令的使用方法
