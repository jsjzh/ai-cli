import type {
  ApiResponse,
  UserInfoData,
  ApplicationListData,
  ProjectIdData,
  PipelineItem,
  ProjectInfoData,
  BranchItem,
  BuildRunData,
} from '../types/api';

const API = {
  SSO: 'https://sso.souche-inc.com',
  CYBERTRON: 'https://cybertron-application-api.souche-inc.com',
  DEVOPS: 'https://wireless-devops.souche-inc.com',
};

function authHeaders(token: string) {
  return {
    '_security_token_inc': token,
    Cookie: `_security_token_inc=${token}`,
  };
}

async function request<T>(
  url: string,
  token: string,
  options?: RequestInit,
): Promise<ApiResponse<T>> {
  const res = await fetch(url, {
    ...options,
    headers: {
      ...authHeaders(token),
      ...(options?.headers as Record<string, string>),
    },
  });
  if (!res.ok) {
    throw new Error(`请求失败: HTTP ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export function getUserInfo(token: string) {
  return request<UserInfoData>(`${API.SSO}/httpApi/getAuthZ.json`, token);
}

export function getApplications(token: string, appName: string) {
  return request<ApplicationListData>(
    `${API.CYBERTRON}/application/list?appName=${encodeURIComponent(appName)}&page=1&pageSize=20`,
    token,
  );
}

export function getProjectIdByAppId(token: string, appId: string) {
  return request<ProjectIdData>(
    `${API.DEVOPS}/api/project/findProjectIdbyAppId?appId=${appId}`,
    token,
  );
}

export function getPipelines(token: string, projectId: number) {
  return request<PipelineItem[]>(
    `${API.DEVOPS}/api/project/pipelines?projectId=${projectId}`,
    token,
  );
}

export function getProjectInfo(token: string, projectId: number) {
  return request<ProjectInfoData>(
    `${API.DEVOPS}/api/project/info?projectId=${projectId}`,
    token,
  );
}

export function getBranches(token: string, gitlabProjectId: string) {
  return request<BranchItem[]>(
    `${API.DEVOPS}/api/gitlab/branches?gitlabProjectId=${gitlabProjectId}`,
    token,
  );
}

export function runPipeline(
  token: string,
  params: {
    projectId: number;
    projectPipelineId: number;
    branch: string;
    commitId: string;
  },
) {
  return request<BuildRunData>(
    `${API.DEVOPS}/api/project/pipeline/run`,
    token,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json;charset=UTF-8' },
      body: JSON.stringify(params),
    },
  );
}
