import fs from 'fs';
import path from 'path';
import os from 'os';
import inquirer from 'inquirer';
import {
  getUserInfo,
  getApplications,
  getProjectIdByAppId,
  getPipelines,
  getProjectInfo,
  getBranches,
  runPipeline,
} from '../../apis';
import type { ApplicationItem, PipelineItem, BranchItem } from '../../types/api';

const CONFIG_PATH = path.join(os.homedir(), '.aiclirc');

interface AppBinding {
  name: string
  appId: string
}

interface Config {
  security_token_inc: string
  bindings: Record<string, AppBinding>
}

function readConfig(): Config {
  const defaults: Config = { security_token_inc: '', bindings: {} };
  if (!fs.existsSync(CONFIG_PATH)) {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(defaults, null, 2), 'utf8');
    return defaults;
  }
  const raw = fs.readFileSync(CONFIG_PATH, 'utf8');
  try {
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    console.log('~/.aiclirc 格式错误，重新初始化');
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(defaults, null, 2), 'utf8');
    return defaults;
  }
}

function writeConfig(config: Config) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8');
}

function readPackageName(): string {
  const pkgPath = path.join(process.cwd(), 'package.json');
  if (!fs.existsSync(pkgPath)) {
    throw new Error('当前目录未找到 package.json');
  }
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  if (!pkg.name) {
    throw new Error('package.json 中缺少 name 字段');
  }
  return pkg.name;
}

async function ensureValidToken(): Promise<Config> {
  const config = readConfig();
  let { security_token_inc: token } = config;

  if (token) {
    const res = await getUserInfo(token);
    if (res.success) {
      console.log(`欢迎回来，${res.data.displayName}`);
      return config;
    }
    console.log('Token 已失效，请重新输入');
  }

  while (true) {
    const { input } = await inquirer.prompt([
      {
        type: 'password',
        name: 'input',
        message: '请输入 _security_token_inc',
        mask: '*',
      },
    ]);
    token = input.trim();
    if (!token) {
      console.log('Token 不能为空');
      continue;
    }
    const res = await getUserInfo(token);
    if (res.success) {
      config.security_token_inc = token;
      writeConfig(config);
      console.log(`Token 校验通过，欢迎 ${res.data.displayName}`);
      return config;
    }
    console.log(`Token 无效: ${res.msg}`);
  }
}

export default async function deploy() {
  try {
    const config = await ensureValidToken();
    const token = config.security_token_inc;

    const appName = readPackageName();
    const currentPath = process.cwd();
    console.log(`当前项目: ${appName}`);

    let appId: string;

    const binding = config.bindings[currentPath];
    if (binding && binding.name === appName) {
      console.log(`使用已绑定的应用: ${binding.appId}`);
      appId = binding.appId;
    } else {
      const appRes = await getApplications(token, appName);
      if (!appRes.success || appRes.data.items.length === 0) {
        throw new Error(`未找到匹配 "${appName}" 的应用`);
      }

      const { app } = await inquirer.prompt([
        {
          type: 'search-list',
          name: 'app',
          message: '请选择应用',
          choices: appRes.data.items.map((item: ApplicationItem) => ({
            name: `${item.appName} | ${item.appPersonInCharge} | ${item.appTeam}`,
            value: item,
          })),
        },
      ]);

      appId = app.appId;

      config.bindings[currentPath] = { name: appName, appId };
      writeConfig(config);
      console.log(`已绑定 ${appName} → ${app.appName} (${app.appId})`);
    }

    const pidRes = await getProjectIdByAppId(token, appId);
    if (!pidRes.success) {
      throw new Error(`获取 projectId 失败: ${pidRes.msg}`);
    }
    const projectId = pidRes.data.projectId;
    console.log(`Project ID: ${projectId}`);

    const pipeRes = await getPipelines(token, projectId);
    if (!pipeRes.success || pipeRes.data.length === 0) {
      throw new Error('该应用未配置流水线');
    }

    const { pipeline } = await inquirer.prompt([
      {
        type: 'search-list',
        name: 'pipeline',
        message: '请选择流水线',
        choices: pipeRes.data.map((item: PipelineItem) => ({
          name: `${item.name} | 环境: ${item.parameters.buildEnv} | 部署: ${item.parameters.deployHost}`,
          value: item,
        })),
      },
    ]);

    const infoRes = await getProjectInfo(token, projectId);
    if (!infoRes.success) {
      throw new Error(`获取项目信息失败: ${infoRes.msg}`);
    }
    const gitlabProjectId = infoRes.data.gitlabProjectId;
    console.log(`GitLab Project ID: ${gitlabProjectId}`);

    const branchRes = await getBranches(token, gitlabProjectId);
    if (!branchRes.success || branchRes.data.length === 0) {
      throw new Error('未获取到分支列表');
    }

    const { branch } = await inquirer.prompt([
      {
        type: 'search-list',
        name: 'branch',
        message: '请选择分支',
        choices: branchRes.data.map((item: BranchItem) => ({
          name: `${item.name} | ${item.commit.author_name} | ${item.commit.title} [${item.commit.short_id}]`,
          value: item,
        })),
      },
    ]);

    console.log(`\n即将部署:`);
    console.log(`  应用: ${appId}`);
    console.log(`  项目: ${projectId}`);
    console.log(`  流水线: ${pipeline.name}`);
    console.log(`  分支: ${branch.name}`);
    console.log(`  Commit: ${branch.commit.id}\n`);

    const buildRes = await runPipeline(token, {
      projectId,
      projectPipelineId: pipeline.id,
      branch: branch.name,
      commitId: branch.commit.id,
    });

    if (buildRes.success) {
      console.log('✅ 构建已触发成功');
    } else {
      throw new Error(`构建触发失败: ${buildRes.msg}`);
    }
  } catch (error) {
    console.error(`\n部署失败:`, (error as Error).message);
  }
}
