// api-config.js - API配置和工具函数

const API_CONFIG = {
    // 后端API基础地址
    BASE_URL: 'http://localhost:8000/api', // 根据实际后端地址修改
    
    // API端点
    ENDPOINTS: {
        // 健康检查
        HEALTH: '/health',
        
        // 评论数据
        COMMENTS: {
            LIST: '/comments',
            CREATE: '/comments',
            DETAIL: '/comments/:id',
            UPDATE: '/comments/:id',
            DELETE: '/comments/:id',
            IMPORT: '/comments/import',
            EXPORT: '/comments/export'
        },
        
        // AI检测
        DETECTION: {
            SINGLE: '/detect/single',
            BATCH: '/detect/batch',
            REALTIME: '/detect/realtime',
            CLUSTER: '/detect/cluster'
        },
        
        // 用户行为分析
        ANALYSIS: {
            USER: '/analysis/user',
            CLUSTER: '/analysis/cluster',
            REPORT: '/analysis/report'
        },
        
        // 系统管理
        SYSTEM: {
            USERS: '/system/users',
            TASKS: '/system/tasks',
            SETTINGS: '/system/settings',
            LOGS: '/system/logs'
        }
    },
    
    // 请求超时时间（毫秒）
    TIMEOUT: 30000,
    
    // 重试次数
    RETRY_COUNT: 3,
    
    // 是否启用模拟数据
    USE_MOCK_DATA: true
};

// 认证信息存储
class AuthStore {
    static getToken() {
        return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    }
    
    static setToken(token, remember = false) {
        if (remember) {
            localStorage.setItem('auth_token', token);
        } else {
            sessionStorage.setItem('auth_token', token);
        }
    }
    
    static clearToken() {
        localStorage.removeItem('auth_token');
        sessionStorage.removeItem('auth_token');
    }
}

// API服务类
class ApiService {
    constructor() {
        this.baseURL = API_CONFIG.BASE_URL;
    }
    
    // 构建完整URL
    buildUrl(endpoint, params = {}) {
        let url = endpoint;
        
        // 替换路径参数
        Object.keys(params).forEach(key => {
            if (url.includes(`:${key}`)) {
                url = url.replace(`:${key}`, params[key]);
            }
        });
        
        return `${this.baseURL}${url}`;
    }
    
    // 通用请求方法
    async request(endpoint, method = 'GET', data = null, params = {}) {
        const url = this.buildUrl(endpoint, params);
        
        const headers = {
            'Content-Type': 'application/json'
        };
        
        // 添加认证token
        const token = AuthStore.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        const config = {
            method,
            headers,
            mode: 'cors',
            cache: 'no-cache'
        };
        
        if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
            config.body = JSON.stringify(data);
        }
        
        // 添加时间戳防止缓存（GET请求）
        if (method === 'GET' && !url.includes('?')) {
            url = `${url}?_t=${Date.now()}`;
        }
        
        let retryCount = API_CONFIG.RETRY_COUNT;
        
        while (retryCount >= 0) {
            try {
                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error('请求超时')), API_CONFIG.TIMEOUT);
                });
                
                const fetchPromise = fetch(url, config);
                
                const response = await Promise.race([fetchPromise, timeoutPromise]);
                
                // 处理响应
                if (!response.ok) {
                    if (response.status === 401) {
                        // Token过期，清除并跳转登录
                        AuthStore.clearToken();
                        window.location.href = '/login';
                        throw new Error('身份验证失败');
                    }
                    
                    const error = await response.json().catch(() => ({}));
                    throw new Error(error.message || `请求失败: ${response.status}`);
                }
                
                // 解析响应数据
                const responseData = await response.json();
                return responseData;
                
            } catch (error) {
                if (retryCount === 0) {
                    console.error('API请求失败:', error);
                    
                    // 如果启用了模拟数据，抛出错误让上层处理
                    if (API_CONFIG.USE_MOCK_DATA) {
                        throw error;
                    }
                    
                    // 显示错误提示
                    this.showError(error);
                    throw error;
                }
                
                retryCount--;
                await new Promise(resolve => setTimeout(resolve, 1000)); // 等待1秒后重试
            }
        }
    }
    
    // 显示错误
    showError(error) {
        const errorMessage = error.message || '网络请求失败，请检查网络连接';
        
        // 在实际应用中，这里可以使用更优雅的错误提示
        console.error('API错误:', errorMessage);
        
        // 简单的alert提示（实际项目中建议使用更优雅的方式）
        if (!API_CONFIG.USE_MOCK_DATA) {
            alert(`错误: ${errorMessage}`);
        }
    }
    
    // 健康检查
    async checkHealth() {
        if (API_CONFIG.USE_MOCK_DATA) {
            return {
                success: true,
                data: {
                    status: 'healthy',
                    timestamp: new Date().toISOString(),
                    version: '1.0.0'
                }
            };
        }
        
        try {
            return await this.request(API_CONFIG.ENDPOINTS.HEALTH, 'GET');
        } catch (error) {
            return {
                success: false,
                error: '后端服务不可用'
            };
        }
    }
    
    // 获取评论列表
    async getComments(params = {}) {
        if (API_CONFIG.USE_MOCK_DATA) {
            // 返回模拟数据
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve({
                        success: true,
                        data: {
                            items: [],
                            total: 0,
                            page: 1,
                            pageSize: 10
                        }
                    });
                }, 500);
            });
        }
        
        return this.request(API_CONFIG.ENDPOINTS.COMMENTS.LIST, 'GET', null, params);
    }
    
    // 创建评论
    async createComment(data) {
        if (API_CONFIG.USE_MOCK_DATA) {
            return { success: true, data: { id: Date.now(), ...data } };
        }
        
        return this.request(API_CONFIG.ENDPOINTS.COMMENTS.CREATE, 'POST', data);
    }
    
    // AI检测
    async detectAIGC(data) {
        if (API_CONFIG.USE_MOCK_DATA) {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve({
                        success: true,
                        data: {
                            probability: Math.random(),
                            risk_level: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
                            factors: ['内容重复度高', '评分模式异常', '发布时间集中']
                        }
                    });
                }, 800);
            });
        }
        
        return this.request(API_CONFIG.ENDPOINTS.DETECTION.SINGLE, 'POST', data);
    }
    
    // 检测水军集群
    async detectCluster(userIds) {
        if (API_CONFIG.USE_MOCK_DATA) {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve({
                        success: true,
                        data: {
                            cluster_id: `cluster_${Date.now()}`,
                            user_count: userIds.length,
                            risk_level: userIds.length > 5 ? 'high' : userIds.length > 2 ? 'medium' : 'low',
                            suspicious_indicators: ['相同IP地址', '相似评论内容', '同时段发布'],
                            creation_time: new Date().toISOString()
                        }
                    });
                }, 1000);
            });
        }
        
        return this.request(API_CONFIG.ENDPOINTS.DETECTION.CLUSTER, 'POST', { user_ids: userIds });
    }
    
    // 分析用户行为
    async analyzeUserBehavior(userId) {
        if (API_CONFIG.USE_MOCK_DATA) {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve({
                        success: true,
                        data: {
                            risk_score: Math.random(),
                            suspicious_factors: ['短时间内大量评论', '评论内容相似度极高', '与已知水军IP关联'],
                            behavior_pattern: {
                                comment_frequency: '高频',
                                content_similarity: 0.85,
                                time_pattern: '集中发布'
                            },
                            recommendations: ['标记为可疑用户', '持续监控']
                        }
                    });
                }, 800);
            });
        }
        
        return this.request(API_CONFIG.ENDPOINTS.ANALYSIS.USER, 'GET', null, { userId });
    }
}

// 创建全局API实例
const apiService = new ApiService();

// 导出API服务
export default apiService;