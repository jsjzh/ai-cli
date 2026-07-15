// ====== 通用响应包装 ======
export interface ApiResponse<T> {
  success: boolean
  code: string | number
  msg: string
  data: T
  traceId?: string
}

// ====== 4.1 获取用户信息 ======
export interface UserInfoData {
  displayName: string
  userId: string
  userName: string
  email: string
  organization: string
  headImg: string
  shopCode: string
  organizationName: string
  userPhone: string
  jobnumber: string
}

// ====== 4.2 查询应用 ======
export interface ApplicationItem {
  appId: string
  appName: string
  appCode: string
  appPersonInCharge: string
  appPersonInChargeEmail: string
  appTeam: string
  gitLab: string
  remark: string
}

export interface ApplicationListData {
  items: ApplicationItem[]
  totalNumber: number
  totalPage: number
  currentIndex: number
  pageSize: number
}

// ====== 4.3 根据 appId 获取 projectId ======
export interface ProjectIdData {
  projectId: number
}

// ====== 4.4 流水线配置 ======
export interface PipelineItem {
  id: number
  projectId: number
  name: string
  parameters: {
    buildEnv: string
    deployHost: string
    nodeVersion?: string
  }
}

// ====== 4.5 根据 projectId 获取 gitlabProjectId ======
export interface ProjectInfoData {
  id: number
  name: string
  type: string
  gitlabProjectId: string
  appId: string
  gitlabUrl: string
}

// ====== 4.6 分支 ======
export interface BranchCommit {
  id: string
  short_id: string
  title: string
  author_name: string
  message: string
}

export interface BranchItem {
  name: string
  commit: BranchCommit
  default: boolean
  web_url: string
}

// ====== 4.7 执行构建 ======
export type BuildRunData = Record<string, never>
