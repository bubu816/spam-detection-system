const { createApp } = Vue;

// 认证应用
const authApp = createApp({
    data() {
        return {
            // 认证状态
            isLoggedIn: false,
            authMode: 'login', // login, register, forgot
            
            // 登录表单
            loginForm: {
                username: '',
                password: '',
                remember: false
            },
            showLoginPassword: false,
            loginErrors: {},
            
            // 注册表单
            registerForm: {
                username: '',
                email: '',
                password: '',
                confirmPassword: '',
                role: 'visitor',
                agreeTerms: false
            },
            showRegisterPassword: false,
            showConfirmPassword: false,
            registerErrors: {},
            
            // 忘记密码表单
            forgotForm: {
                email: ''
            },
            forgotErrors: {},
            
            // 状态
            loggingIn: false,
            registering: false,
            resetting: false,
            
            // 当前用户信息
            currentUser: null,
            
            // 通知
            authNotifications: [],
            authNotificationId: 1
        };
    },
    
    mounted() {
        console.log('认证应用已挂载');
        // 显示欢迎消息
        this.showAuthNotification('欢迎使用AI水军检测系统', 'info');
    },
    
    methods: {
        // 登录验证
        validateLogin() {
            const errors = {};
            
            if (!this.loginForm.username.trim()) {
                errors.username = '请输入用户名';
            }
            
            if (!this.loginForm.password) {
                errors.password = '请输入密码';
            }
            
            this.loginErrors = errors;
            return Object.keys(errors).length === 0;
        },
        
        // 注册验证
        validateRegister() {
            const errors = {};
            
            if (!this.registerForm.username.trim()) {
                errors.username = '请输入用户名';
            } else if (this.registerForm.username.length < 3) {
                errors.username = '用户名至少3个字符';
            }
            
            if (!this.registerForm.email.trim()) {
                errors.email = '请输入邮箱地址';
            } else if (!this.isValidEmail(this.registerForm.email)) {
                errors.email = '请输入有效的邮箱地址';
            }
            
            if (!this.registerForm.password) {
                errors.password = '请输入密码';
            } else if (this.registerForm.password.length < 8) {
                errors.password = '密码至少8个字符';
            }
            
            if (this.registerForm.password !== this.registerForm.confirmPassword) {
                errors.confirmPassword = '两次输入的密码不一致';
            }
            
            if (!this.registerForm.agreeTerms) {
                errors.agreeTerms = '请同意服务条款';
            }
            
            this.registerErrors = errors;
            return Object.keys(errors).length === 0;
        },
        
        // 邮箱验证
        isValidEmail(email) {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return re.test(email);
        },
        
        // 模拟登录API
        async login() {
            if (!this.validateLogin()) {
                return;
            }
            
            this.loggingIn = true;
            
            // 模拟API延迟
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // 模拟用户数据
            const demoAccounts = {
                'admin': {
                    id: 1,
                    username: 'admin',
                    email: 'admin@system.com',
                    role: 'admin',
                    name: '系统管理员'
                },
                'analyst': {
                    id: 2,
                    username: 'analyst',
                    email: 'analyst@system.com',
                    role: 'analyst',
                    name: '安全分析师'
                },
                'visitor': {
                    id: 3,
                    username: 'visitor',
                    email: 'visitor@system.com',
                    role: 'visitor',
                    name: '访客用户'
                }
            };
            
            // 检查是否是演示账户
            let user = null;
            const username = this.loginForm.username.toLowerCase();
            
            if (demoAccounts[username] && this.loginForm.password === username + '123') {
                user = demoAccounts[username];
            } else {
                // 模拟其他用户登录（实际项目中这里应该调用API）
                user = {
                    id: Date.now(),
                    username: this.loginForm.username,
                    email: `${this.loginForm.username}@user.com`,
                    role: 'visitor',
                    name: this.loginForm.username
                };
            }
            
            if (user) {
                // 保存token
                const token = 'mock_jwt_token_' + Date.now();
                if (this.loginForm.remember) {
                    localStorage.setItem('auth_token', token);
                } else {
                    sessionStorage.setItem('auth_token', token);
                }
                
                // 保存用户信息
                this.currentUser = user;
                localStorage.setItem('currentUser', JSON.stringify(user));
                
                // 登录成功
                this.isLoggedIn = true;
                this.showAuthNotification('登录成功！', 'success');
                
                console.log('登录成功，切换到主应用');
                
                // 隐藏认证应用，显示主应用
                document.getElementById('auth-app').style.display = 'none';
                document.getElementById('app').style.display = 'block';
                
                // 初始化主应用
                if (typeof window.initMainApp === 'function') {
                    window.initMainApp();
                } else {
                    console.error('initMainApp 函数未定义，尝试重新加载页面');
                    window.location.reload();
                }
            } else {
                this.showAuthNotification('用户名或密码错误', 'error');
            }
            
            this.loggingIn = false;
        },
        
        // 模拟注册API
        async register() {
            if (!this.validateRegister()) {
                return;
            }
            
            this.registering = true;
            
            // 模拟API延迟
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // 检查用户名是否已存在
            const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
            const usernameExists = existingUsers.some(user => 
                user.username === this.registerForm.username
            );
            
            if (usernameExists) {
                this.showAuthNotification('用户名已存在', 'error');
                this.registering = false;
                return;
            }
            
            // 创建新用户
            const newUser = {
                id: Date.now(),
                username: this.registerForm.username,
                email: this.registerForm.email,
                role: this.registerForm.role,
                name: this.registerForm.username,
                createdAt: new Date().toISOString(),
                status: 'active'
            };
            
            // 保存到本地存储
            existingUsers.push(newUser);
            localStorage.setItem('users', JSON.stringify(existingUsers));
            
            // 自动登录
            const token = 'mock_jwt_token_' + Date.now();
            localStorage.setItem('auth_token', token);
            
            // 保存用户信息
            this.currentUser = newUser;
            localStorage.setItem('currentUser', JSON.stringify(newUser));
            
            // 注册成功
            this.isLoggedIn = true;
            this.showAuthNotification('注册成功！已自动登录', 'success');
            
            console.log('注册成功，切换到主应用');
            
            // 隐藏认证应用，显示主应用
            document.getElementById('auth-app').style.display = 'none';
            document.getElementById('app').style.display = 'block';
            
            // 初始化主应用
            if (typeof window.initMainApp === 'function') {
                window.initMainApp();
            }
            
            this.registering = false;
        },
        
        // 忘记密码
        async resetPassword() {
            if (!this.forgotForm.email.trim()) {
                this.forgotErrors.email = '请输入邮箱地址';
                return;
            }
            
            if (!this.isValidEmail(this.forgotForm.email)) {
                this.forgotErrors.email = '请输入有效的邮箱地址';
                return;
            }
            
            this.resetting = true;
            
            // 模拟API延迟
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // 模拟发送重置邮件
            this.showAuthNotification(`重置密码链接已发送到 ${this.forgotForm.email}`, 'success');
            
            // 重置表单
            this.forgotForm.email = '';
            this.forgotErrors = {};
            
            this.resetting = false;
        },
        
        // 使用演示账户
        useDemoAccount(role) {
            const accounts = {
                'admin': { username: 'admin', password: 'admin123' },
                'analyst': { username: 'analyst', password: 'analyst123' },
                'visitor': { username: 'visitor', password: 'visitor123' }
            };
            
            const account = accounts[role];
            this.loginForm.username = account.username;
            this.loginForm.password = account.password;
            this.loginForm.remember = true;
            
            this.showAuthNotification(`已填充${role}演示账户`, 'info');
        },
        
        // 忘记密码
        forgotPassword() {
            this.authMode = 'forgot';
            this.showAuthNotification('请输入注册邮箱以重置密码', 'info');
        },
        
        // 显示条款
        showTerms() {
            alert('服务条款内容...\n\n1. 用户需遵守国家法律法规\n2. 不得利用系统进行非法活动\n3. 尊重他人隐私\n4. 定期备份重要数据');
        },
        
        // 显示隐私政策
        showPrivacy() {
            alert('隐私政策内容...\n\n1. 我们保护用户个人信息\n2. 数据仅用于系统功能\n3. 不向第三方提供用户数据\n4. 用户有权删除个人数据');
        },
        
        // 显示通知
        showAuthNotification(message, type = 'info') {
            const id = this.authNotificationId++;
            this.authNotifications.push({
                id,
                message,
                type
            });
            
            // 5秒后自动移除
            setTimeout(() => {
                this.removeAuthNotification(id);
            }, 5000);
        },
        
        // 移除通知
        removeAuthNotification(id) {
            const index = this.authNotifications.findIndex(n => n.id === id);
            if (index !== -1) {
                this.authNotifications.splice(index, 1);
            }
        },
        
        // 获取通知图标
        getNotificationIcon(type) {
            const iconMap = {
                'success': 'fas fa-check-circle',
                'warning': 'fas fa-exclamation-triangle',
                'error': 'fas fa-times-circle',
                'info': 'fas fa-info-circle'
            };
            return iconMap[type] || 'fas fa-bell';
        },
        
        // 退出登录
        logout() {
            // 清除认证信息
            localStorage.removeItem('auth_token');
            sessionStorage.removeItem('auth_token');
            localStorage.removeItem('currentUser');
            
            // 重新加载页面
            window.location.reload();
        }
    },
    
    template: `
        <div class="auth-container">
            <!-- 登录表单 -->
            <div class="auth-form" v-if="authMode === 'login'">
                <div class="auth-header">
                    <div class="logo">
                        <i class="fas fa-robot"></i>
                        <h1>AI水军检测系统</h1>
                    </div>
                    <p class="welcome-text">欢迎回来，请登录您的账户</p>
                </div>
                
                <div class="form-group">
                    <label for="loginUsername">
                        <i class="fas fa-user"></i> 用户名
                    </label>
                    <input 
                        type="text" 
                        id="loginUsername" 
                        v-model="loginForm.username" 
                        placeholder="请输入用户名"
                        @keyup.enter="login"
                    >
                    <div class="error-message" v-if="loginErrors.username">
                        {{ loginErrors.username }}
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="loginPassword">
                        <i class="fas fa-lock"></i> 密码
                    </label>
                    <input 
                        :type="showLoginPassword ? 'text' : 'password'" 
                        id="loginPassword" 
                        v-model="loginForm.password" 
                        placeholder="请输入密码"
                        @keyup.enter="login"
                    >
                    <button 
                        type="button" 
                        class="password-toggle"
                        @click="showLoginPassword = !showLoginPassword"
                    >
                        <i :class="showLoginPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                    </button>
                    <div class="error-message" v-if="loginErrors.password">
                        {{ loginErrors.password }}
                    </div>
                </div>
                
                <div class="form-group remember-forgot">
                    <label class="remember-me">
                        <input type="checkbox" v-model="loginForm.remember">
                        <span>记住我</span>
                    </label>
                    <a href="#" class="forgot-password" @click.prevent="forgotPassword">
                        忘记密码？
                    </a>
                </div>
                
                <button class="auth-btn primary" @click="login" :disabled="loggingIn">
                    <i class="fas fa-sign-in-alt"></i>
                    {{ loggingIn ? '登录中...' : '登录' }}
                </button>
                
                <div class="divider">
                    <span>或</span>
                </div>
                
                <button class="auth-btn secondary" @click="authMode = 'register'">
                    <i class="fas fa-user-plus"></i>
                    创建新账户
                </button>
                
                <div class="demo-accounts">
                    <h4>演示账户</h4>
                    <div class="demo-account-list">
                        <div class="demo-account" @click="useDemoAccount('admin')">
                            <span class="role-tag admin">管理员</span>
                            <span>admin / admin123</span>
                        </div>
                        <div class="demo-account" @click="useDemoAccount('analyst')">
                            <span class="role-tag analyst">分析师</span>
                            <span>analyst / analyst123</span>
                        </div>
                        <div class="demo-account" @click="useDemoAccount('visitor')">
                            <span class="role-tag visitor">访客</span>
                            <span>visitor / visitor123</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- 注册表单 -->
            <div class="auth-form" v-if="authMode === 'register'">
                <div class="auth-header">
                    <div class="logo">
                        <i class="fas fa-robot"></i>
                        <h1>AI水军检测系统</h1>
                    </div>
                    <p class="welcome-text">创建新账户，开始使用我们的服务</p>
                </div>
                
                <div class="form-group">
                    <label for="registerUsername">
                        <i class="fas fa-user"></i> 用户名
                    </label>
                    <input 
                        type="text" 
                        id="registerUsername" 
                        v-model="registerForm.username" 
                        placeholder="请输入用户名"
                    >
                    <div class="error-message" v-if="registerErrors.username">
                        {{ registerErrors.username }}
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="registerEmail">
                        <i class="fas fa-envelope"></i> 邮箱
                    </label>
                    <input 
                        type="email" 
                        id="registerEmail" 
                        v-model="registerForm.email" 
                        placeholder="请输入邮箱地址"
                    >
                    <div class="error-message" v-if="registerErrors.email">
                        {{ registerErrors.email }}
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="registerPassword">
                        <i class="fas fa-lock"></i> 密码
                    </label>
                    <input 
                        :type="showRegisterPassword ? 'text' : 'password'" 
                        id="registerPassword" 
                        v-model="registerForm.password" 
                        placeholder="请输入密码（至少8位）"
                    >
                    <button 
                        type="button" 
                        class="password-toggle"
                        @click="showRegisterPassword = !showRegisterPassword"
                    >
                        <i :class="showRegisterPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                    </button>
                    <div class="error-message" v-if="registerErrors.password">
                        {{ registerErrors.password }}
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="confirmPassword">
                        <i class="fas fa-lock"></i> 确认密码
                    </label>
                    <input 
                        :type="showConfirmPassword ? 'text' : 'password'" 
                        id="confirmPassword" 
                        v-model="registerForm.confirmPassword" 
                        placeholder="请再次输入密码"
                    >
                    <button 
                        type="button" 
                        class="password-toggle"
                        @click="showConfirmPassword = !showConfirmPassword"
                    >
                        <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                    </button>
                    <div class="error-message" v-if="registerErrors.confirmPassword">
                        {{ registerErrors.confirmPassword }}
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="registerRole">
                        <i class="fas fa-user-tag"></i> 角色
                    </label>
                    <select id="registerRole" v-model="registerForm.role">
                        <option value="visitor">访客</option>
                        <option value="analyst">安全分析师</option>
                        <option value="admin">系统管理员</option>
                    </select>
                    <div class="role-hint">
                        <i class="fas fa-info-circle"></i>
                        <span>不同角色拥有不同的权限</span>
                    </div>
                </div>
                
                <div class="form-group terms-agreement">
                    <label class="terms-label">
                        <input type="checkbox" v-model="registerForm.agreeTerms">
                        <span>我同意 <a href="#" @click.prevent="showTerms">服务条款</a> 和 <a href="#" @click.prevent="showPrivacy">隐私政策</a></span>
                    </label>
                    <div class="error-message" v-if="registerErrors.agreeTerms">
                        {{ registerErrors.agreeTerms }}
                    </div>
                </div>
                
                <button class="auth-btn primary" @click="register" :disabled="registering">
                    <i class="fas fa-user-plus"></i>
                    {{ registering ? '注册中...' : '注册账户' }}
                </button>
                
                <div class="divider">
                    <span>已有账户？</span>
                </div>
                
                <button class="auth-btn secondary" @click="authMode = 'login'">
                    <i class="fas fa-sign-in-alt"></i>
                    返回登录
                </button>
            </div>
            
            <!-- 忘记密码表单 -->
            <div class="auth-form" v-if="authMode === 'forgot'">
                <div class="auth-header">
                    <div class="logo">
                        <i class="fas fa-robot"></i>
                        <h1>重置密码</h1>
                    </div>
                    <p class="welcome-text">请输入您的邮箱地址，我们将发送重置密码的链接</p>
                </div>
                
                <div class="form-group">
                    <label for="forgotEmail">
                        <i class="fas fa-envelope"></i> 邮箱地址
                    </label>
                    <input 
                        type="email" 
                        id="forgotEmail" 
                        v-model="forgotForm.email" 
                        placeholder="请输入注册时使用的邮箱"
                    >
                    <div class="error-message" v-if="forgotErrors.email">
                        {{ forgotErrors.email }}
                    </div>
                </div>
                
                <button class="auth-btn primary" @click="resetPassword" :disabled="resetting">
                    <i class="fas fa-paper-plane"></i>
                    {{ resetting ? '发送中...' : '发送重置链接' }}
                </button>
                
                <div class="divider">
                    <span>或</span>
                </div>
                
                <button class="auth-btn secondary" @click="authMode = 'login'">
                    <i class="fas fa-arrow-left"></i>
                    返回登录
                </button>
            </div>
            
            <!-- 系统公告 -->
            <div class="system-notice">
                <div class="notice-header">
                    <i class="fas fa-bullhorn"></i>
                    <h3>系统公告</h3>
                </div>
                <div class="notice-content">
                    <p><i class="fas fa-check-circle"></i> 新增AI水军集群检测功能</p>
                    <p><i class="fas fa-check-circle"></i> 支持多平台评论数据分析</p>
                    <p><i class="fas fa-check-circle"></i> 实时可视化风险报告</p>
                    <p><i class="fas fa-check-circle"></i> 智能证据链生成系统</p>
                </div>
            </div>
        </div>
        
        <!-- 通知消息 -->
        <div v-if="authNotifications.length > 0" class="auth-notifications">
            <div v-for="notification in authNotifications" 
                 :key="notification.id"
                 class="auth-notification"
                 :class="'notification-' + notification.type">
                <i :class="getNotificationIcon(notification.type)"></i>
                <span>{{ notification.message }}</span>
                <button class="close-notification" @click="removeAuthNotification(notification.id)">
                    &times;
                </button>
            </div>
        </div>
        
        <!-- 版权信息 -->
        <div class="copyright">
            <p>© 2024 AI水军检测系统 | 版本 2.0.1 | 技术支持: detection@system.com</p>
            <p>本系统仅供内部测试使用，请遵守相关法律法规</p>
        </div>
    `
});

// 挂载认证应用
console.log('开始挂载认证应用...');
authApp.mount('#auth-app');

// 主应用初始化函数
function initMainApp() {
    console.log('开始初始化主应用...');
    
    // 确保DOM元素存在
    const appElement = document.getElementById('app');
    if (!appElement) {
        console.error('主应用容器 #app 不存在');
        return;
    }
    
    console.log('主应用容器找到，创建应用...');
    
    const mainApp = createApp({
        data() {
            return {
                // API服务状态
                apiStatus: {
                    healthy: true,
                    lastChecked: null,
                    message: '后端服务连接正常'
                },
                
                // 用户信息
                currentRole: 'analyst',
                userName: '',
                userEmail: '',
                showUserDropdown: false,
                
                // 当前活动标签页
                activeTab: 'dashboard',
                
                // 系统管理子标签页
                managementTab: 'users',
                
                // 仪表盘统计数据
                stats: {
                    totalComments: 0,
                    aigcComments: 0,
                    waterArmyClusters: 0,
                    suspectedUsers: 0
                },
                
                // 最近活动
                recentActivities: [],
                
                // 数据管理
                searchQuery: '',
                filterPlatform: '',
                filterDateStart: '',
                filterDateEnd: '',
                comments: [],
                currentPage: 1,
                itemsPerPage: 10,
                
                // AI检测分析
                detectionMode: 'batch',
                detectionScope: 'all',
                detectionAlgorithm: 'ensemble',
                detectionInProgress: false,
                detectionProgress: 0,
                singleCommentText: '',
                aigcDetectionResults: {
                    total: 0,
                    aigcCount: 0,
                    averageProbability: 0,
                    clustersFound: 0
                },
                detectionDetails: [],
                selectedUsersForDetection: [],
                
                // 可视化分析
                visualizationType: 'network',
                riskFilter: 'all',
                timeRange: '7d',
                networkNodes: [],
                networkLinks: [],
                selectedNode: null,
                
                // 系统管理
                systemUsers: [],
                detectionTasks: [],
                systemSettings: {
                    systemName: 'AI水军检测系统',
                    aigcThreshold: 70,
                    autoDetectionInterval: '21600',
                    dataRetentionDays: 90
                },
                systemLogs: [],
                newUser: {
                    username: '',
                    email: '',
                    password: '',
                    confirmPassword: '',
                    role: 'analyst'
                },
                
                // 模态框
                showImportModal: false,
                showAddUserModal: false,
                showUserAnalysisModal: false,
                importType: 'file',
                selectedFile: null,
                apiEndpoint: '',
                apiKey: '',
                apiLimit: 1000,
                manualPlatform: 'taobao',
                manualContent: '',
                manualUserId: '',
                importProgress: 0,
                importStatus: '',
                importing: false,
                
                // 当前分析的详情
                currentAnalysisResult: null,
                currentUserAnalysis: null,
                
                // 图表实例
                charts: {
                    aigcChart: null,
                    riskChart: null,
                    timelineChart: null,
                    heatmapChart: null,
                    distributionChart: null
                },
                
                // 系统通知
                notifications: [],
                notificationId: 1,
                
                // 数据模拟
                mockComments: [
                    { 
                        id: 1, 
                        userId: 'U1001', 
                        content: '这个产品真的太好了，质量超乎想象，强烈推荐给大家！已经回购三次了，每次都非常满意！', 
                        platform: 'taobao', 
                        timestamp: '2024-03-15T10:23:00Z', 
                        aigcProbability: 0.92, 
                        riskLevel: 'high',
                        ipAddress: '192.168.1.100',
                        productId: 'P1001',
                        rating: 5
                    },
                    { 
                        id: 2, 
                        userId: 'U1002', 
                        content: '物流速度很快，包装也很精美，物超所值。客服态度也很好，有问必答。', 
                        platform: 'jd', 
                        timestamp: '2024-03-15T09:45:00Z', 
                        aigcProbability: 0.45, 
                        riskLevel: 'low',
                        ipAddress: '192.168.1.101',
                        productId: 'P1002',
                        rating: 4
                    },
                    { 
                        id: 3, 
                        userId: 'U1003', 
                        content: '一般般，没有想象中那么好，有点失望。包装也有点简陋，希望改进。', 
                        platform: 'douyin', 
                        timestamp: '2024-03-15T08:12:00Z', 
                        aigcProbability: 0.12, 
                        riskLevel: 'low',
                        ipAddress: '192.168.1.102',
                        productId: 'P1003',
                        rating: 3
                    },
                    { 
                        id: 4, 
                        userId: 'U1004', 
                        content: '五星好评！下次还会再来购买，服务态度很好。快递也很给力，一天就到了。', 
                        platform: 'taobao', 
                        timestamp: '2024-03-14T22:34:00Z', 
                        aigcProbability: 0.87, 
                        riskLevel: 'high',
                        ipAddress: '192.168.1.100',
                        productId: 'P1001',
                        rating: 5
                    },
                    { 
                        id: 5, 
                        userId: 'U1005', 
                        content: '价格实惠，质量也不错，性价比很高。适合学生党购买，推荐！', 
                        platform: 'weibo', 
                        timestamp: '2024-03-14T20:15:00Z', 
                        aigcProbability: 0.32, 
                        riskLevel: 'low',
                        ipAddress: '192.168.1.103',
                        productId: 'P1004',
                        rating: 4
                    },
                    { 
                        id: 6, 
                        userId: 'U1006', 
                        content: '卖家发货速度快，商品与描述一致，很满意。会推荐给朋友的！', 
                        platform: 'taobao', 
                        timestamp: '2024-03-14T18:42:00Z', 
                        aigcProbability: 0.76, 
                        riskLevel: 'medium',
                        ipAddress: '192.168.1.100',
                        productId: 'P1005',
                        rating: 5
                    },
                    { 
                        id: 7, 
                        userId: 'U1007', 
                        content: '不太喜欢这个颜色，但是质量还可以。尺寸稍微有点偏大，建议买小一码。', 
                        platform: 'jd', 
                        timestamp: '2024-03-14T16:33:00Z', 
                        aigcProbability: 0.21, 
                        riskLevel: 'low',
                        ipAddress: '192.168.1.104',
                        productId: 'P1006',
                        rating: 3
                    },
                    { 
                        id: 8, 
                        userId: 'U1008', 
                        content: '非常棒的产品，已经推荐给朋友了！包装很用心，没有任何损坏。', 
                        platform: 'douyin', 
                        timestamp: '2024-03-14T15:21:00Z', 
                        aigcProbability: 0.68, 
                        riskLevel: 'medium',
                        ipAddress: '192.168.1.105',
                        productId: 'P1007',
                        rating: 5
                    },
                    { 
                        id: 9, 
                        userId: 'U1009', 
                        content: '客服态度很好，解决问题很及时。物流也很快，总体很满意。', 
                        platform: 'taobao', 
                        timestamp: '2024-03-14T14:08:00Z', 
                        aigcProbability: 0.15, 
                        riskLevel: 'low',
                        ipAddress: '192.168.1.106',
                        productId: 'P1008',
                        rating: 4
                    },
                    { 
                        id: 10, 
                        userId: 'U1010', 
                        content: '包装破损了，但是商品没有损坏。客服答应补发包装，态度很好。', 
                        platform: 'weibo', 
                        timestamp: '2024-03-14T12:55:00Z', 
                        aigcProbability: 0.09, 
                        riskLevel: 'low',
                        ipAddress: '192.168.1.107',
                        productId: 'P1009',
                        rating: 3
                    },
                    { 
                        id: 11, 
                        userId: 'U1001', 
                        content: '第二次购买了，质量一如既往的好，强烈推荐！物流也很快。', 
                        platform: 'taobao', 
                        timestamp: '2024-03-13T11:30:00Z', 
                        aigcProbability: 0.88, 
                        riskLevel: 'high',
                        ipAddress: '192.168.1.100',
                        productId: 'P1001',
                        rating: 5
                    },
                    { 
                        id: 12, 
                        userId: 'U1004', 
                        content: '物美价廉，性价比超高，已经推荐给同事了。发货速度很快！', 
                        platform: 'taobao', 
                        timestamp: '2024-03-13T10:15:00Z', 
                        aigcProbability: 0.85, 
                        riskLevel: 'high',
                        ipAddress: '192.168.1.100',
                        productId: 'P1001',
                        rating: 5
                    },
                    { 
                        id: 13, 
                        userId: 'U1006', 
                        content: '商品质量不错，包装很严实，没有任何问题。会继续关注的！', 
                        platform: 'taobao', 
                        timestamp: '2024-03-12T09:45:00Z', 
                        aigcProbability: 0.72, 
                        riskLevel: 'medium',
                        ipAddress: '192.168.1.100',
                        productId: 'P1005',
                        rating: 5
                    },
                    { 
                        id: 14, 
                        userId: 'U1011', 
                        content: '这个价位能买到这样的质量，真的很值！客服也很专业。', 
                        platform: 'taobao', 
                        timestamp: '2024-03-12T08:30:00Z', 
                        aigcProbability: 0.91, 
                        riskLevel: 'high',
                        ipAddress: '192.168.1.108',
                        productId: 'P1010',
                        rating: 5
                    },
                    { 
                        id: 15, 
                        userId: 'U1012', 
                        content: '感觉一般，没有宣传的那么好，可能是我期待太高了。', 
                        platform: 'jd', 
                        timestamp: '2024-03-11T16:20:00Z', 
                        aigcProbability: 0.18, 
                        riskLevel: 'low',
                        ipAddress: '192.168.1.109',
                        productId: 'P1011',
                        rating: 2
                    }
                ],
                
                // 模拟网络节点数据
                mockNetworkNodes: [
                    { id: 'cluster_1', x: 200, y: 100, label: '集群A\n(高风险)', riskLevel: 'high', userCount: 8, commentCount: 24, avgProbability: 0.85, mainPlatform: 'taobao', behaviorPattern: '集中发布五星好评', firstSeen: '2024-03-10', lastActive: '2024-03-15' },
                    { id: 'cluster_2', x: 400, y: 50, label: '集群B\n(中风险)', riskLevel: 'medium', userCount: 5, commentCount: 15, avgProbability: 0.65, mainPlatform: 'jd', behaviorPattern: '相似内容批量发布', firstSeen: '2024-03-12', lastActive: '2024-03-15' },
                    { id: 'cluster_3', x: 600, y: 150, label: '集群C\n(低风险)', riskLevel: 'low', userCount: 3, commentCount: 9, avgProbability: 0.35, mainPlatform: 'douyin', behaviorPattern: '正常用户行为', firstSeen: '2024-03-14', lastActive: '2024-03-15' },
                    { id: 'cluster_4', x: 350, y: 250, label: '集群D\n(高风险)', riskLevel: 'high', userCount: 12, commentCount: 36, avgProbability: 0.92, mainPlatform: 'taobao', behaviorPattern: '相同IP多账号操作', firstSeen: '2024-03-08', lastActive: '2024-03-15' },
                    { id: 'cluster_5', x: 500, y: 300, label: '集群E\n(中风险)', riskLevel: 'medium', userCount: 6, commentCount: 18, avgProbability: 0.58, mainPlatform: 'weibo', behaviorPattern: '时间规律性发布', firstSeen: '2024-03-11', lastActive: '2024-03-15' }
                ],
                
                // 模拟网络连接数据
                mockNetworkLinks: [
                    { source: { x: 200, y: 100 }, target: { x: 400, y: 50 }, strength: 0.8 },
                    { source: { x: 200, y: 100 }, target: { x: 350, y: 250 }, strength: 0.6 },
                    { source: { x: 400, y: 50 }, target: { x: 600, y: 150 }, strength: 0.4 },
                    { source: { x: 350, y: 250 }, target: { x: 500, y: 300 }, strength: 0.7 },
                    { source: { x: 600, y: 150 }, target: { x: 500, y: 300 }, strength: 0.3 }
                ]
            };
        },
        
        computed: {
            // 格式化数字显示
            formatNumber() {
                return function(num) {
                    if (num >= 10000) {
                        return (num / 10000).toFixed(1) + '万';
                    }
                    return num.toString();
                };
            },
            
            // 计算总页数
            totalPages() {
                return Math.ceil(this.filteredComments.length / this.itemsPerPage);
            },
            
            // 过滤评论数据
            filteredComments() {
                let filtered = this.comments;
                
                // 按搜索词过滤
                if (this.searchQuery) {
                    const query = this.searchQuery.toLowerCase();
                    filtered = filtered.filter(comment => 
                        comment.content.toLowerCase().includes(query) || 
                        comment.userId.toLowerCase().includes(query) ||
                        (comment.productId && comment.productId.toLowerCase().includes(query))
                    );
                }
                
                // 按平台过滤
                if (this.filterPlatform) {
                    filtered = filtered.filter(comment => comment.platform === this.filterPlatform);
                }
                
                // 按日期范围过滤
                if (this.filterDateStart) {
                    filtered = filtered.filter(comment => {
                        const commentDate = new Date(comment.timestamp);
                        const startDate = new Date(this.filterDateStart);
                        return commentDate >= startDate;
                    });
                }
                
                if (this.filterDateEnd) {
                    filtered = filtered.filter(comment => {
                        const commentDate = new Date(comment.timestamp);
                        const endDate = new Date(this.filterDateEnd);
                        return commentDate <= endDate;
                    });
                }
                
                return filtered;
            },
            
            // 分页后的评论数据
            paginatedComments() {
                const start = (this.currentPage - 1) * this.itemsPerPage;
                const end = start + this.itemsPerPage;
                return this.filteredComments.slice(start, end);
            },
            
            // 获取选中的用户ID列表
            selectedUserIds() {
                return this.selectedUsersForDetection.map(user => user.userId);
            },
            
            // 计算是否全选
            allSelected() {
                if (this.detectionDetails.length === 0) return false;
                return this.detectionDetails.every(item => item.selected);
            },
            
            // 用户表单验证
            isValidUserForm() {
                return (
                    this.newUser.username.trim() &&
                    this.newUser.email.trim() &&
                    this.newUser.password.trim() &&
                    this.newUser.password === this.newUser.confirmPassword &&
                    this.newUser.role
                );
            }
        },
        
        mounted() {
            console.log('主应用已挂载');
            // 加载用户信息
            this.loadUserInfo();
            
            // 加载初始数据
            this.loadInitialData();
            
            // 初始化图表
            this.$nextTick(() => {
                this.initCharts();
            });
            
            // 定期更新数据
            this.startDataRefresh();
            
            // 添加全局ESC键监听
            this.addEscapeListener();
            
            // 显示欢迎通知
            this.showNotification('欢迎使用AI水军检测系统！', 'success');
        },
        
        methods: {
            // 加载用户信息
            loadUserInfo() {
                const userData = localStorage.getItem('currentUser');
                if (userData) {
                    try {
                        const user = JSON.parse(userData);
                        this.userName = user.name || user.username;
                        this.userEmail = user.email;
                        
                        // 根据用户角色设置默认角色
                        if (user.role) {
                            this.currentRole = user.role;
                            this.changeRole();
                        }
                    } catch (e) {
                        console.error('加载用户信息失败:', e);
                    }
                }
            },
            
            // 切换用户下拉菜单
            toggleUserDropdown() {
                this.showUserDropdown = !this.showUserDropdown;
            },
            
            // 查看个人信息
            viewProfile() {
                this.showUserDropdown = false;
                const userData = localStorage.getItem('currentUser');
                if (userData) {
                    const user = JSON.parse(userData);
                    const profileInfo = `
个人信息详情：
用户名: ${user.username}
邮箱: ${user.email}
角色: ${this.getRoleName(user.role)}
注册时间: ${user.createdAt ? new Date(user.createdAt).toLocaleDateString('zh-CN') : '未知'}
状态: ${user.status === 'active' ? '活跃' : '禁用'}
                    `;
                    alert(profileInfo);
                }
            },
            
            // 获取角色名称
            getRoleName(role) {
                const roleMap = {
                    'admin': '系统管理员',
                    'analyst': '安全分析师',
                    'visitor': '访客'
                };
                return roleMap[role] || role;
            },
            
            // 修改密码
            changePassword() {
                this.showUserDropdown = false;
                const oldPassword = prompt('请输入当前密码:');
                if (oldPassword === null) return;
                
                const newPassword = prompt('请输入新密码（至少8位）:');
                if (newPassword === null) return;
                
                if (newPassword.length < 8) {
                    this.showNotification('密码至少需要8位', 'error');
                    return;
                }
                
                const confirmPassword = prompt('请确认新密码:');
                if (confirmPassword === null) return;
                
                if (newPassword !== confirmPassword) {
                    this.showNotification('两次输入的密码不一致', 'error');
                    return;
                }
                
                // 模拟修改密码
                this.showNotification('密码修改成功！', 'success');
                this.addSystemLog('用户管理', 'update', '修改密码');
            },
            
            // 退出登录
            logout() {
                if (confirm('确定要退出登录吗？')) {
                    // 清除认证信息
                    localStorage.removeItem('auth_token');
                    sessionStorage.removeItem('auth_token');
                    localStorage.removeItem('currentUser');
                    
                    // 重新加载页面
                    window.location.reload();
                }
            },
            
            // 加载初始数据
            loadInitialData() {
                // 加载评论数据
                this.comments = [...this.mockComments];
                
                // 加载最近活动
                this.loadRecentActivities();
                
                // 加载系统用户
                this.loadSystemUsers();
                
                // 加载检测任务
                this.loadDetectionTasks();
                
                // 加载系统日志
                this.loadSystemLogs();
                
                // 计算统计数据
                this.calculateStats();
                
                // 初始化检测详情
                this.initDetectionDetails();
                
                // 初始化网络数据
                this.updateNetworkData();
            },
            
            // 加载最近活动
            loadRecentActivities() {
                this.recentActivities = [
                    { id: 1, time: '2024-03-15 10:30', taskName: '淘宝评论检测', status: 'completed', statusText: '已完成', result: '发现23个可疑集群' },
                    { id: 2, time: '2024-03-15 09:15', taskName: '京东AIGC分析', status: 'running', statusText: '进行中', result: '已检测45%' },
                    { id: 3, time: '2024-03-14 16:45', taskName: '微博水军扫描', status: 'completed', statusText: '已完成', result: '标记156个可疑用户' },
                    { id: 4, time: '2024-03-14 14:20', taskName: '系统数据备份', status: 'completed', statusText: '已完成', result: '备份成功' },
                    { id: 5, time: '2024-03-14 11:10', taskName: '抖音评论监控', status: 'completed', statusText: '已完成', result: '发现12个异常账号' }
                ];
            },
            
            // 加载系统用户
            loadSystemUsers() {
                this.systemUsers = [
                    { id: 1, username: 'admin', role: 'admin', roleName: '系统管理员', email: 'admin@system.com', createdAt: '2024-01-10', lastLogin: '2024-03-15 09:30', status: 'active' },
                    { id: 2, username: 'analyst1', role: 'analyst', roleName: '安全分析师', email: 'analyst1@system.com', createdAt: '2024-02-15', lastLogin: '2024-03-15 10:15', status: 'active' },
                    { id: 3, username: 'analyst2', role: 'analyst', roleName: '安全分析师', email: 'analyst2@system.com', createdAt: '2024-02-20', lastLogin: '2024-03-14 16:40', status: 'active' },
                    { id: 4, username: 'visitor1', role: 'visitor', roleName: '访客', email: 'visitor1@company.com', createdAt: '2024-03-01', lastLogin: '2024-03-15 08:20', status: 'active' },
                    { id: 5, username: 'analyst3', role: 'analyst', roleName: '安全分析师', email: 'analyst3@system.com', createdAt: '2024-03-05', lastLogin: '2024-03-14 14:30', status: 'inactive' }
                ];
            },
            
            // 加载检测任务
            loadDetectionTasks() {
                this.detectionTasks = [
                    { id: 1, name: '日常评论检测', description: '每日定时检测新评论中的水军行为', createdAt: '2024-03-15 08:00', createdBy: 'admin', schedule: '每天08:00', status: 'running', statusText: '进行中', progress: 65 },
                    { id: 2, name: 'AIGC专项分析', description: '对疑似AIGC内容进行深度分析', createdAt: '2024-03-14 14:30', createdBy: 'analyst1', schedule: '手动触发', status: 'completed', statusText: '已完成', progress: 100 },
                    { id: 3, name: '实时监控任务', description: '实时监控各平台评论动态', createdAt: '2024-03-14 10:15', createdBy: 'admin', schedule: '7×24小时', status: 'running', statusText: '进行中', progress: 85 },
                    { id: 4, name: '周度汇总报告', description: '生成每周水军检测报告', createdAt: '2024-03-13 16:45', createdBy: 'analyst2', schedule: '每周一09:00', status: 'pending', statusText: '待开始', progress: 0 },
                    { id: 5, name: '数据清洗任务', description: '清理过期和无效评论数据', createdAt: '2024-03-12 11:30', createdBy: 'admin', schedule: '每月1日00:00', status: 'completed', statusText: '已完成', progress: 100 }
                ];
            },
            
            // 加载系统日志
            loadSystemLogs() {
                this.systemLogs = [
                    { id: 1, timestamp: '2024-03-15 10:30:25', username: 'analyst1', operation: '检测任务', type: 'create', details: '启动AI检测分析', ipAddress: '192.168.1.100' },
                    { id: 2, timestamp: '2024-03-15 09:45:12', username: 'admin', operation: '用户管理', type: 'update', details: '修改用户权限', ipAddress: '192.168.1.101' },
                    { id: 3, timestamp: '2024-03-15 08:20:33', username: 'analyst2', operation: '数据导入', type: 'create', details: '导入评论数据100条', ipAddress: '192.168.1.102' },
                    { id: 4, timestamp: '2024-03-14 17:15:48', username: 'admin', operation: '系统设置', type: 'update', details: '更新AIGC检测阈值', ipAddress: '192.168.1.101' },
                    { id: 5, timestamp: '2024-03-14 14:30:05', username: 'analyst1', operation: '数据管理', type: 'delete', details: '删除可疑评论5条', ipAddress: '192.168.1.100' },
                    { id: 6, timestamp: '2024-03-14 11:45:22', username: 'visitor1', operation: '查看报表', type: 'create', details: '查看仪表盘数据', ipAddress: '192.168.1.103' }
                ];
            },
            
            // 计算统计数据
            calculateStats() {
                this.stats.totalComments = this.comments.length;
                this.stats.aigcComments = this.comments.filter(c => c.aigcProbability > 0.7).length;
                
                // 模拟水军集群数
                this.stats.waterArmyClusters = 5;
                
                // 可疑用户数（高风险评论的用户）
                const highRiskUsers = new Set();
                this.comments.forEach(c => {
                    if (c.riskLevel === 'high') {
                        highRiskUsers.add(c.userId);
                    }
                });
                this.stats.suspectedUsers = highRiskUsers.size;
                
                // 更新检测结果概览
                this.calculateDetectionResults();
            },
            
            // 初始化检测详情
            initDetectionDetails() {
                this.detectionDetails = this.comments.map(comment => ({
                    id: comment.id,
                    userId: comment.userId,
                    content: comment.content.length > 50 ? comment.content.substring(0, 50) + '...' : comment.content,
                    fullContent: comment.content,
                    probability: comment.aigcProbability,
                    riskLevel: comment.riskLevel,
                    platform: comment.platform,
                    timestamp: comment.timestamp,
                    detectedAt: new Date().toISOString(),
                    selected: false
                }));
                
                this.calculateDetectionResults();
            },
            
            // 计算检测结果
            calculateDetectionResults() {
                const highRiskComments = this.detectionDetails.filter(d => d.probability > 0.7);
                
                this.aigcDetectionResults.total = this.detectionDetails.length;
                this.aigcDetectionResults.aigcCount = highRiskComments.length;
                
                const totalProbability = this.detectionDetails.reduce((sum, d) => sum + d.probability, 0);
                this.aigcDetectionResults.averageProbability = this.detectionDetails.length > 0 
                    ? totalProbability / this.detectionDetails.length 
                    : 0;
                
                // 根据高风险评论数量估算集群数
                this.aigcDetectionResults.clustersFound = Math.ceil(highRiskComments.length / 3);
            },
            
            // 初始化图表
            initCharts() {
                // AIGC检测比例图表
                const aigcCtx = this.$refs.aigcChart?.getContext('2d');
                if (aigcCtx) {
                    this.charts.aigcChart = new Chart(aigcCtx, {
                        type: 'doughnut',
                        data: {
                            labels: ['正常评论', 'AIGC疑似', '待检测'],
                            datasets: [{
                                data: [
                                    this.stats.totalComments - this.stats.aigcComments - 2,
                                    this.stats.aigcComments,
                                    2
                                ],
                                backgroundColor: ['#4CAF50', '#FF5722', '#757575'],
                                borderWidth: 2,
                                borderColor: '#ffffff'
                            }]
                        },
                        options: {
                            responsive: true,
                            cutout: '65%',
                            plugins: {
                                legend: {
                                    position: 'bottom',
                                    labels: {
                                        padding: 20,
                                        usePointStyle: true
                                    }
                                },
                                tooltip: {
                                    callbacks: {
                                        label: function(context) {
                                            const label = context.label || '';
                                            const value = context.raw || 0;
                                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                            const percentage = Math.round((value / total) * 100);
                                            return `${label}: ${value} (${percentage}%)`;
                                        }
                                    }
                                }
                            },
                            animation: {
                                animateScale: true,
                                animateRotate: true
                            }
                        }
                    });
                }
                
                // 风险等级分布图表
                const riskCtx = this.$refs.riskChart?.getContext('2d');
                if (riskCtx) {
                    const highRisk = this.comments.filter(c => c.riskLevel === 'high').length;
                    const mediumRisk = this.comments.filter(c => c.riskLevel === 'medium').length;
                    const lowRisk = this.comments.filter(c => c.riskLevel === 'low').length;
                    
                    this.charts.riskChart = new Chart(riskCtx, {
                        type: 'bar',
                        data: {
                            labels: ['高风险', '中风险', '低风险'],
                            datasets: [{
                                label: '用户数量',
                                data: [highRisk, mediumRisk, lowRisk],
                                backgroundColor: [
                                    'rgba(255, 87, 34, 0.8)',
                                    'rgba(255, 152, 0, 0.8)',
                                    'rgba(76, 175, 80, 0.8)'
                                ],
                                borderColor: [
                                    'rgb(255, 87, 34)',
                                    'rgb(255, 152, 0)',
                                    'rgb(76, 175, 80)'
                                ],
                                borderWidth: 2,
                                borderRadius: 8,
                                borderSkipped: false
                            }]
                        },
                        options: {
                            responsive: true,
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    grid: {
                                        drawBorder: false
                                    },
                                    title: {
                                        display: true,
                                        text: '用户数量',
                                        font: {
                                            size: 14,
                                            weight: 'bold'
                                        }
                                    }
                                },
                                x: {
                                    grid: {
                                        display: false
                                    },
                                    title: {
                                        display: true,
                                        text: '风险等级',
                                        font: {
                                            size: 14,
                                            weight: 'bold'
                                        }
                                    }
                                }
                            },
                            plugins: {
                                legend: {
                                    display: false
                                }
                            }
                        }
                    });
                }
                
                // 时间线图表
                this.initTimelineChart();
                
                // 分布图表
                this.initDistributionChart();
            },
            
            // 初始化时间线图表
            initTimelineChart() {
                const timelineCtx = this.$refs.timelineChart?.getContext('2d');
                if (timelineCtx) {
                    this.charts.timelineChart = new Chart(timelineCtx, {
                        type: 'line',
                        data: {
                            labels: ['3月10日', '3月11日', '3月12日', '3月13日', '3月14日', '3月15日'],
                            datasets: [
                                {
                                    label: '水军评论数',
                                    data: [120, 190, 300, 500, 250, 400],
                                    borderColor: '#FF5722',
                                    backgroundColor: 'rgba(255, 87, 34, 0.1)',
                                    fill: true,
                                    tension: 0.4,
                                    borderWidth: 3
                                },
                                {
                                    label: '正常评论数',
                                    data: [3200, 3400, 2800, 3000, 3500, 3800],
                                    borderColor: '#4CAF50',
                                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                                    fill: true,
                                    tension: 0.4,
                                    borderWidth: 3
                                }
                            ]
                        },
                        options: {
                            responsive: true,
                            interaction: {
                                intersect: false,
                                mode: 'index'
                            },
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    grid: {
                                        drawBorder: false
                                    },
                                    title: {
                                        display: true,
                                        text: '评论数量',
                                        font: {
                                            size: 14,
                                            weight: 'bold'
                                        }
                                    }
                                },
                                x: {
                                    grid: {
                                        display: false
                                    },
                                    title: {
                                        display: true,
                                        text: '日期',
                                        font: {
                                            size: 14,
                                            weight: 'bold'
                                        }
                                    }
                                }
                            },
                            plugins: {
                                tooltip: {
                                    mode: 'index',
                                    intersect: false
                                }
                            }
                        }
                    });
                }
            },
            
            // 初始化分布图表
            initDistributionChart() {
                const distributionCtx = this.$refs.distributionChart?.getContext('2d');
                if (distributionCtx) {
                    // 按平台分组统计
                    const platforms = ['taobao', 'jd', 'douyin', 'weibo'];
                    const platformData = platforms.map(platform => 
                        this.comments.filter(c => c.platform === platform).length
                    );
                    
                    this.charts.distributionChart = new Chart(distributionCtx, {
                        type: 'polarArea',
                        data: {
                            labels: platforms.map(p => this.getPlatformName(p)),
                            datasets: [{
                                data: platformData,
                                backgroundColor: [
                                    'rgba(255, 107, 107, 0.7)',
                                    'rgba(255, 209, 102, 0.7)',
                                    'rgba(0, 0, 0, 0.7)',
                                    'rgba(255, 56, 56, 0.7)'
                                ],
                                borderColor: [
                                    'rgb(255, 107, 107)',
                                    'rgb(255, 209, 102)',
                                    'rgb(0, 0, 0)',
                                    'rgb(255, 56, 56)'
                                ],
                                borderWidth: 2
                            }]
                        },
                        options: {
                            responsive: true,
                            scales: {
                                r: {
                                    ticks: {
                                        display: false
                                    }
                                }
                            },
                            plugins: {
                                legend: {
                                    position: 'right'
                                }
                            }
                        }
                    });
                }
            },
            
            // 更新图表数据
            updateCharts() {
                if (this.charts.aigcChart) {
                    this.charts.aigcChart.data.datasets[0].data = [
                        this.stats.totalComments - this.stats.aigcComments - 2,
                        this.stats.aigcComments,
                        2
                    ];
                    this.charts.aigcChart.update();
                }
                
                if (this.charts.riskChart) {
                    const highRisk = this.comments.filter(c => c.riskLevel === 'high').length;
                    const mediumRisk = this.comments.filter(c => c.riskLevel === 'medium').length;
                    const lowRisk = this.comments.filter(c => c.riskLevel === 'low').length;
                    
                    this.charts.riskChart.data.datasets[0].data = [highRisk, mediumRisk, lowRisk];
                    this.charts.riskChart.update();
                }
            },
            
            // 开始数据刷新
            startDataRefresh() {
                // 每60秒更新统计数据
                setInterval(() => {
                    this.calculateStats();
                    this.updateCharts();
                }, 60000);
            },
            
            // 添加ESC键监听
            addEscapeListener() {
                document.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape') {
                        this.closeAllModals();
                    }
                });
            },
            
            // 切换标签页
            changeTab(tab) {
                this.activeTab = tab;
                
                // 如果是访客角色，限制访问权限
                if (this.currentRole === 'visitor' && 
                    (tab === 'systemManagement' || tab === 'dataManagement' || tab === 'aiDetection')) {
                    this.activeTab = 'dashboard';
                    this.showNotification('访客角色无权限访问此页面', 'warning');
                }
            },
            
            // 切换用户角色
            changeRole() {
                switch(this.currentRole) {
                    case 'admin':
                        this.userName = '系统管理员';
                        break;
                    case 'analyst':
                        this.userName = '安全分析师';
                        break;
                    case 'visitor':
                        this.userName = '访客';
                        // 访客只能查看仪表盘和可视化
                        if (!['dashboard', 'visualization'].includes(this.activeTab)) {
                            this.activeTab = 'dashboard';
                            this.showNotification('已切换到仪表盘页面', 'info');
                        }
                        break;
                }
                
                this.showNotification(`角色已切换为: ${this.userName}`, 'info');
            },
            
            // 格式化日期
            formatDate(dateString) {
                try {
                    const date = new Date(dateString);
                    if (isNaN(date.getTime())) {
                        return dateString;
                    }
                    return date.toLocaleString('zh-CN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                } catch (error) {
                    return dateString;
                }
            },
            
            // 获取平台名称
            getPlatformName(platform) {
                const platformMap = {
                    'taobao': '淘宝',
                    'jd': '京东',
                    'douyin': '抖音',
                    'weibo': '微博'
                };
                return platformMap[platform] || platform;
            },
            
            // 获取风险等级名称
            getRiskLevelName(riskLevel) {
                const riskMap = {
                    'high': '高风险',
                    'medium': '中风险',
                    'low': '低风险'
                };
                return riskMap[riskLevel] || riskLevel;
            },
            
            // 获取行为指标标签
            getBehaviorLabel(key) {
                const labelMap = {
                    'comment_frequency': '评论频率',
                    'content_similarity': '内容相似度',
                    'time_pattern': '时间模式',
                    'ip_similarity': 'IP相似度',
                    'rating_pattern': '评分模式'
                };
                return labelMap[key] || key;
            },
            
            // 判断是否可疑行为
            isSuspiciousBehavior(key, value) {
                if (key === 'comment_frequency' && value === '高频') return true;
                if (key === 'content_similarity' && value > 0.8) return true;
                if (key === 'time_pattern' && value === '集中发布') return true;
                if (key === 'ip_similarity' && value > 0.7) return true;
                if (key === 'rating_pattern' && value === '极端评分') return true;
                return false;
            },
            
            // 格式化文件大小
            formatFileSize(bytes) {
                if (bytes === 0) return '0 Bytes';
                const k = 1024;
                const sizes = ['Bytes', 'KB', 'MB', 'GB'];
                const i = Math.floor(Math.log(bytes) / Math.log(k));
                return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
            },
            
            // 获取通知图标
            getNotificationIcon(type) {
                const iconMap = {
                    'success': 'fas fa-check-circle',
                    'warning': 'fas fa-exclamation-triangle',
                    'error': 'fas fa-times-circle',
                    'info': 'fas fa-info-circle'
                };
                return iconMap[type] || 'fas fa-bell';
            },
            
            // 显示通知
            showNotification(message, type = 'info') {
                const id = this.notificationId++;
                this.notifications.push({
                    id,
                    message,
                    type
                });
                
                // 5秒后自动移除
                setTimeout(() => {
                    this.removeNotification(id);
                }, 5000);
            },
            
            // 移除通知
            removeNotification(id) {
                const index = this.notifications.findIndex(n => n.id === id);
                if (index !== -1) {
                    this.notifications.splice(index, 1);
                }
            },
            
            // 打开导入模态框
            openImportModal() {
                this.showImportModal = true;
                this.importType = 'file';
                this.selectedFile = null;
                this.apiEndpoint = '';
                this.apiKey = '';
                this.apiLimit = 1000;
                this.manualPlatform = 'taobao';
                this.manualContent = '';
                this.manualUserId = '';
                this.importProgress = 0;
                this.importStatus = '';
                this.importing = false;
            },
            
            // 打开添加用户模态框
            openAddUserModal() {
                this.showAddUserModal = true;
                this.newUser = {
                    username: '',
                    email: '',
                    password: '',
                    confirmPassword: '',
                    role: 'analyst'
                };
            },
            
            // 关闭模态框
            closeModal(type) {
                switch(type) {
                    case 'import':
                        this.showImportModal = false;
                        break;
                    case 'addUser':
                        this.showAddUserModal = false;
                        break;
                    case 'userAnalysis':
                        this.showUserAnalysisModal = false;
                        this.currentUserAnalysis = null;
                        break;
                }
            },
            
            // 关闭所有模态框
            closeAllModals() {
                this.showImportModal = false;
                this.showAddUserModal = false;
                this.showUserAnalysisModal = false;
                this.currentUserAnalysis = null;
            },
            
            // 开始AI检测
            async startDetection() {
                if (this.detectionScope === 'selected' && this.selectedUsersForDetection.length === 0) {
                    this.showNotification('请至少选择一个用户进行检测', 'warning');
                    return;
                }
                
                this.detectionInProgress = true;
                this.detectionProgress = 0;
                this.showNotification('开始AI检测分析...', 'info');
                
                // 模拟进度条
                const progressInterval = setInterval(() => {
                    this.detectionProgress += 5;
                    if (this.detectionProgress >= 95) {
                        clearInterval(progressInterval);
                    }
                }, 300);
                
                try {
                    // 模拟API调用延迟
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    
                    clearInterval(progressInterval);
                    this.detectionProgress = 100;
                    
                    // 模拟检测结果
                    const mockResult = {
                        cluster_info: {
                            cluster_id: `cluster_${Date.now()}`,
                            user_count: this.selectedUsersForDetection.length || 8,
                            risk_level: 'high',
                            suspicious_indicators: [
                                '相同IP地址',
                                '相似评论内容',
                                '同时段发布',
                                '相同评分模式'
                            ],
                            creation_time: new Date().toISOString(),
                            comments: this.detectionDetails.slice(0, 5)
                        }
                    };
                    
                    this.currentAnalysisResult = mockResult;
                    
                    // 更新检测结果
                    this.updateDetectionResults(mockResult);
                    
                    // 完成检测
                    setTimeout(() => {
                        this.detectionInProgress = false;
                        this.detectionProgress = 0;
                        
                        this.showNotification(`检测完成！发现 ${mockResult.cluster_info.user_count} 个可疑用户`, 'success');
                    }, 500);
                    
                } catch (error) {
                    clearInterval(progressInterval);
                    this.detectionInProgress = false;
                    console.error('检测失败:', error);
                    this.showNotification('检测过程中出现错误', 'error');
                }
            },
            
            // 检测单条评论
            detectSingleComment() {
                if (!this.singleCommentText.trim()) {
                    this.showNotification('请输入要检测的评论内容', 'warning');
                    return;
                }
                
                // 模拟单条评论检测
                const aigcProbability = Math.random();
                const riskLevel = aigcProbability > 0.7 ? 'high' : aigcProbability > 0.4 ? 'medium' : 'low';
                
                // 添加到检测结果
                const newResult = {
                    id: Date.now(),
                    userId: '单条检测',
                    content: this.singleCommentText.length > 50 ? this.singleCommentText.substring(0, 50) + '...' : this.singleCommentText,
                    fullContent: this.singleCommentText,
                    probability: aigcProbability,
                    riskLevel: riskLevel,
                    platform: 'manual',
                    timestamp: new Date().toISOString(),
                    detectedAt: new Date().toISOString(),
                    selected: false
                };
                
                this.detectionDetails.unshift(newResult);
                this.calculateDetectionResults();
                
                // 显示结果
                let message = `检测完成！AIGC概率: ${(aigcProbability * 100).toFixed(1)}%`;
                if (riskLevel === 'high') {
                    message += ' (高风险)';
                    this.showNotification(message, 'error');
                } else if (riskLevel === 'medium') {
                    message += ' (中风险)';
                    this.showNotification(message, 'warning');
                } else {
                    message += ' (低风险)';
                    this.showNotification(message, 'success');
                }
                
                // 清空输入
                this.singleCommentText = '';
            },
            
            // 更新检测结果
            updateDetectionResults(result) {
                if (result.cluster_info) {
                    this.aigcDetectionResults.clustersFound++;
                    
                    // 更新高风险用户
                    const riskMap = {
                        'high': 'high',
                        'medium': 'medium',
                        'low': 'low'
                    };
                    
                    // 更新检测详情的风险等级
                    this.detectionDetails.forEach(detail => {
                        if (this.selectedUserIds.includes(detail.userId)) {
                            detail.riskLevel = riskMap[result.cluster_info.risk_level] || detail.riskLevel;
                            detail.probability = Math.max(detail.probability, 
                                result.cluster_info.risk_level === 'high' ? 0.8 : 
                                result.cluster_info.risk_level === 'medium' ? 0.6 : 0.3);
                        }
                    });
                    
                    // 重新计算统计
                    this.calculateStats();
                    this.updateCharts();
                }
            },
            
            // 分析单个用户行为
            async analyzeUserBehavior(userId) {
                const userComments = this.comments.filter(c => c.userId === userId);
                
                if (userComments.length === 0) {
                    this.showNotification('未找到该用户的评论数据', 'warning');
                    return;
                }
                
                // 模拟分析延迟
                await new Promise(resolve => setTimeout(resolve, 800));
                
                // 模拟分析结果
                const riskScore = userComments.length > 5 ? 0.85 : userComments.length > 2 ? 0.55 : 0.25;
                
                this.currentUserAnalysis = {
                    userId: userId,
                    ipAddress: userComments[0]?.ipAddress || '未知',
                    platform: userComments[0]?.platform || '多平台',
                    risk_score: riskScore,
                    suspicious_factors: [
                        '短时间内大量评论',
                        '评论内容相似度极高',
                        '与已知水军IP关联',
                        '评分模式单一'
                    ],
                    behavior_pattern: {
                        comment_frequency: userComments.length > 5 ? '高频' : '正常',
                        content_similarity: 0.85,
                        time_pattern: '集中发布',
                        ip_similarity: 0.9,
                        rating_pattern: '极端评分'
                    },
                    recommendations: riskScore > 0.7 ? [
                        '标记为可疑用户',
                        '加入监控列表',
                        '限制其评论频率'
                    ] : riskScore > 0.4 ? [
                        '持续监控',
                        '关注其行为变化'
                    ] : [
                        '正常用户，无需特殊处理'
                    ]
                };
                
                // 显示分析结果模态框
                this.showUserAnalysisModal = true;
            },
            
            // 查看评论详情
            viewComment(id) {
                const comment = this.comments.find(c => c.id === id);
                if (comment) {
                    const details = `
评论ID: ${comment.id}
用户ID: ${comment.userId}
平台: ${this.getPlatformName(comment.platform)}
时间: ${this.formatDate(comment.timestamp)}
评分: ${comment.rating || '未评分'}星
AIGC概率: ${(comment.aigcProbability * 100).toFixed(1)}%
风险等级: ${this.getRiskLevelName(comment.riskLevel)}
IP地址: ${comment.ipAddress || '未知'}
产品ID: ${comment.productId || '未知'}
评论内容:
${comment.content}
                    `;
                    
                    if (window.confirm(details + '\n\n是否需要分析该用户行为？')) {
                        this.analyzeUserBehavior(comment.userId);
                    }
                }
            },
            
            // 编辑评论
            editComment(id) {
                const comment = this.comments.find(c => c.id === id);
                if (comment) {
                    const newContent = prompt('编辑评论内容:', comment.content);
                    if (newContent !== null && newContent.trim() !== '') {
                        comment.content = newContent;
                        this.showNotification('评论已更新', 'success');
                        this.calculateStats();
                    }
                }
            },
            
            // 删除评论
            deleteComment(id) {
                if (confirm('确定要删除这条评论吗？')) {
                    const index = this.comments.findIndex(c => c.id === id);
                    if (index !== -1) {
                        this.comments.splice(index, 1);
                        this.calculateStats();
                        this.showNotification('评论已删除', 'success');
                        
                        // 记录到日志
                        this.addSystemLog('数据管理', 'delete', `删除评论 ${id}`);
                    }
                }
            },
            
            // 搜索数据
            searchData() {
                this.currentPage = 1;
                this.showNotification(`搜索到 ${this.filteredComments.length} 条记录`, 'info');
            },
            
            // 刷新数据
            refreshData() {
                this.comments = [...this.mockComments];
                this.initDetectionDetails();
                this.calculateStats();
                this.showNotification('数据已刷新', 'success');
                
                // 记录到日志
                this.addSystemLog('数据管理', 'create', '刷新评论数据');
            },
            
            // 导出数据
            exportData() {
                const dataStr = JSON.stringify(this.filteredComments, null, 2);
                const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
                
                const exportFileDefaultName = `水军检测数据_${new Date().toISOString().slice(0, 10)}.json`;
                
                const linkElement = document.createElement('a');
                linkElement.setAttribute('href', dataUri);
                linkElement.setAttribute('download', exportFileDefaultName);
                linkElement.click();
                
                this.showNotification('数据导出成功', 'success');
                this.addSystemLog('数据导出', 'create', `导出 ${this.filteredComments.length} 条记录`);
            },
            
            // 上一页
            prevPage() {
                if (this.currentPage > 1) {
                    this.currentPage--;
                }
            },
            
            // 下一页
            nextPage() {
                if (this.currentPage < this.totalPages) {
                    this.currentPage++;
                }
            },
            
            // 查看检测详情
            viewDetails(id) {
                const result = this.detectionDetails.find(d => d.id === id);
                if (result) {
                    this.analyzeUserBehavior(result.userId);
                }
            },
            
            // 标记为水军
            markAsWaterArmy(id) {
                const result = this.detectionDetails.find(d => d.id === id);
                if (result && confirm(`确定将用户 ${result.userId} 标记为水军吗？`)) {
                    result.riskLevel = 'high';
                    result.probability = 0.9;
                    
                    // 更新主评论数据
                    const comment = this.comments.find(c => c.id === id);
                    if (comment) {
                        comment.riskLevel = 'high';
                        comment.aigcProbability = 0.9;
                    }
                    
                    this.calculateStats();
                    this.updateCharts();
                    this.showNotification(`用户 ${result.userId} 已标记为水军`, 'success');
                    this.addSystemLog('用户管理', 'update', `标记用户 ${result.userId} 为水军`);
                }
            },
            
            // 加入黑名单
            addToBlacklist(userId) {
                if (confirm(`确定将用户 ${userId} 加入黑名单吗？`)) {
                    this.showNotification(`用户 ${userId} 已加入黑名单`, 'success');
                    this.addSystemLog('用户管理', 'create', `添加用户 ${userId} 到黑名单`);
                }
            },
            
            // 加入监控列表
            addToMonitorList() {
                if (this.currentUserAnalysis) {
                    this.showNotification(`用户 ${this.currentUserAnalysis.userId} 已加入监控列表`, 'success');
                    this.addSystemLog('用户管理', 'create', `添加用户 ${this.currentUserAnalysis.userId} 到监控列表`);
                    this.closeModal('userAnalysis');
                }
            },
            
            // 切换所有选择
            toggleAllSelection(event) {
                const checked = event.target.checked;
                this.detectionDetails.forEach(item => {
                    item.selected = checked;
                    
                    // 更新选中用户列表
                    if (checked) {
                        if (!this.selectedUsersForDetection.find(u => u.id === item.id)) {
                            this.selectedUsersForDetection.push({
                                id: item.id,
                                userId: item.userId
                            });
                        }
                    } else {
                        const index = this.selectedUsersForDetection.findIndex(u => u.id === item.id);
                        if (index !== -1) {
                            this.selectedUsersForDetection.splice(index, 1);
                        }
                    }
                });
            },
            
            // 切换用户选择状态
            toggleUserSelection(id) {
                const result = this.detectionDetails.find(d => d.id === id);
                if (result) {
                    result.selected = !result.selected;
                    
                    if (result.selected) {
                        this.selectedUsersForDetection.push({
                            id: result.id,
                            userId: result.userId
                        });
                    } else {
                        const index = this.selectedUsersForDetection.findIndex(u => u.id === id);
                        if (index !== -1) {
                            this.selectedUsersForDetection.splice(index, 1);
                        }
                    }
                }
            },
            
            // 从分析结果标记为水军
            markAsWaterArmyFromAnalysis() {
                if (this.currentUserAnalysis && confirm(`确定将用户 ${this.currentUserAnalysis.userId} 标记为水军吗？`)) {
                    const userId = this.currentUserAnalysis.userId;
                    
                    // 更新所有相关评论
                    this.comments.forEach(comment => {
                        if (comment.userId === userId) {
                            comment.riskLevel = 'high';
                            comment.aigcProbability = 0.9;
                        }
                    });
                    
                    // 更新检测详情
                    this.detectionDetails.forEach(detail => {
                        if (detail.userId === userId) {
                            detail.riskLevel = 'high';
                            detail.probability = 0.9;
                        }
                    });
                    
                    this.calculateStats();
                    this.updateCharts();
                    this.showNotification(`用户 ${userId} 已标记为水军`, 'success');
                    this.addSystemLog('用户管理', 'update', `标记用户 ${userId} 为水军`);
                    this.closeModal('userAnalysis');
                }
            },
            
            // 导出检测结果
            exportResults() {
                const resultsToExport = this.detectionDetails.filter(d => d.selected).length > 0 
                    ? this.detectionDetails.filter(d => d.selected)
                    : this.detectionDetails;
                
                const dataStr = JSON.stringify(resultsToExport, null, 2);
                const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
                
                const exportFileDefaultName = `检测结果_${new Date().toISOString().slice(0, 10)}.json`;
                
                const linkElement = document.createElement('a');
                linkElement.setAttribute('href', dataUri);
                linkElement.setAttribute('download', exportFileDefaultName);
                linkElement.click();
                
                this.showNotification(`成功导出 ${resultsToExport.length} 条检测结果`, 'success');
            },
            
            // 清空检测结果
            clearResults() {
                if (confirm('确定要清空所有检测结果吗？')) {
                    this.detectionDetails = [];
                    this.aigcDetectionResults = {
                        total: 0,
                        aigcCount: 0,
                        averageProbability: 0,
                        clustersFound: 0
                    };
                    this.selectedUsersForDetection = [];
                    this.showNotification('检测结果已清空', 'info');
                }
            },
            
            // 查看完整证据链
            viewFullEvidence() {
                if (this.currentAnalysisResult) {
                    const result = this.currentAnalysisResult;
                    const evidenceText = `
水军集群分析报告：
--------------------------------
集群ID: ${result.cluster_info?.cluster_id || 'N/A'}
风险等级: ${result.cluster_info?.risk_level || '未知'}
涉及用户数: ${result.cluster_info?.user_count || 0}
创建时间: ${this.formatDate(result.cluster_info?.creation_time || new Date())}

可疑指标:
${result.cluster_info?.suspicious_indicators?.map((item, index) => `${index + 1}. ${item}`).join('\n') || '无'}

建议操作:
1. 标记相关用户为水军
2. 持续监控该集群活动
3. 上报平台管理员
                    `;
                    
                    alert(evidenceText);
                } else {
                    this.showNotification('请先进行水军检测分析', 'warning');
                }
            },
            
            // 更新网络数据
            updateNetworkData() {
                // 根据风险过滤条件筛选节点
                let filteredNodes = [...this.mockNetworkNodes];
                if (this.riskFilter !== 'all') {
                    filteredNodes = filteredNodes.filter(node => node.riskLevel === this.riskFilter);
                }
                
                // 根据时间范围筛选（模拟）
                if (this.timeRange !== 'all') {
                    filteredNodes = filteredNodes.slice(0, Math.min(filteredNodes.length, 3));
                }
                
                this.networkNodes = filteredNodes;
                this.networkLinks = this.mockNetworkLinks.filter((link, index) => index < filteredNodes.length - 1);
            },
            
            // 获取连接线样式
            getLinkStyle(link) {
                const dx = link.target.x - link.source.x;
                const dy = link.target.y - link.source.y;
                const length = Math.sqrt(dx * dx + dy * dy);
                const angle = Math.atan2(dy, dx) * 180 / Math.PI;
                
                return {
                    top: `${link.source.y}px`,
                    left: `${link.source.x}px`,
                    width: `${length}px`,
                    transform: `rotate(${angle}deg)`,
                    opacity: link.strength
                };
            },
            
            // 选择网络节点
            selectNetworkNode(node) {
                this.selectedNode = node;
                this.showNotification(`已选择集群: ${node.label}`, 'info');
            },
            
            // 查看集群详情
            viewClusterDetails(node) {
                this.selectedNode = node;
                this.showNotification(`正在加载集群 ${node.label} 的详细信息...`, 'info');
            },
            
            // 导出集群数据
            exportClusterData(node) {
                const dataStr = JSON.stringify(node, null, 2);
                const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
                
                const exportFileDefaultName = `集群数据_${node.id}_${new Date().toISOString().slice(0, 10)}.json`;
                
                const linkElement = document.createElement('a');
                linkElement.setAttribute('href', dataUri);
                linkElement.setAttribute('download', exportFileDefaultName);
                linkElement.click();
                
                this.showNotification(`集群 ${node.label} 数据导出成功`, 'success');
            },
            
            // 更新可视化
            updateVisualization() {
                this.updateNetworkData();
                
                // 更新图表
                this.$nextTick(() => {
                    if (this.visualizationType === 'timeline' && !this.charts.timelineChart) {
                        this.initTimelineChart();
                    } else if (this.visualizationType === 'distribution' && !this.charts.distributionChart) {
                        this.initDistributionChart();
                    }
                });
            },
            
            // 触发文件上传
            triggerFileUpload() {
                document.getElementById('fileUpload')?.click();
            },
            
            // 处理文件选择
            handleFileSelect(event) {
                const file = event.target.files[0];
                if (file) {
                    this.selectedFile = file;
                    
                    // 验证文件类型
                    const validTypes = ['application/json', 'text/csv', 'application/vnd.ms-excel', 
                                      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
                    if (!validTypes.includes(file.type) && 
                        !file.name.match(/\.(json|csv|xlsx|xls)$/i)) {
                        this.showNotification('不支持的文件类型，请选择JSON、CSV或Excel文件', 'error');
                        this.selectedFile = null;
                        return;
                    }
                }
            },
            
            // 处理文件拖放
            handleFileDrop(event) {
                event.preventDefault();
                const file = event.dataTransfer.files[0];
                if (file) {
                    this.selectedFile = file;
                    this.handleFileSelect({ target: { files: [file] } });
                }
            },
            
            // 移除文件
            removeFile() {
                this.selectedFile = null;
                const fileInput = document.getElementById('fileUpload');
                if (fileInput) {
                    fileInput.value = '';
                }
            },
            
            // 确认导入数据
            async confirmImport() {
                if (this.importType === 'file' && !this.selectedFile) {
                    this.showNotification('请选择要上传的文件', 'warning');
                    return;
                }
                
                if (this.importType === 'api' && (!this.apiEndpoint || !this.apiKey)) {
                    this.showNotification('请填写完整的API信息', 'warning');
                    return;
                }
                
                if (this.importType === 'manual' && !this.manualContent.trim()) {
                    this.showNotification('请输入评论内容', 'warning');
                    return;
                }
                
                this.importing = true;
                this.importProgress = 0;
                this.importStatus = '开始导入...';
                
                // 模拟导入过程
                const progressInterval = setInterval(() => {
                    this.importProgress += 5;
                    
                    if (this.importProgress <= 30) {
                        this.importStatus = '正在读取数据...';
                    } else if (this.importProgress <= 60) {
                        this.importStatus = '正在解析数据...';
                    } else if (this.importProgress <= 90) {
                        this.importStatus = '正在保存到数据库...';
                    } else {
                        this.importStatus = '导入完成！';
                    }
                    
                    if (this.importProgress >= 100) {
                        clearInterval(progressInterval);
                        
                        // 模拟新增数据
                        let newComments = [];
                        
                        if (this.importType === 'manual') {
                            // 手动输入
                            const newComment = {
                                id: this.comments.length + 1,
                                userId: this.manualUserId || `U${1000 + this.comments.length + 1}`,
                                content: this.manualContent,
                                platform: this.manualPlatform,
                                timestamp: new Date().toISOString(),
                                aigcProbability: Math.random() * 0.5,
                                riskLevel: 'low',
                                ipAddress: '192.168.1.200',
                                productId: `P${1000 + Math.floor(Math.random() * 100)}`,
                                rating: Math.floor(Math.random() * 3) + 3
                            };
                            newComments.push(newComment);
                            
                        } else {
                            // 文件或API导入（模拟批量数据）
                            const count = this.importType === 'api' ? Math.min(this.apiLimit, 50) : 10;
                            for (let i = 0; i < count; i++) {
                                const platforms = ['taobao', 'jd', 'douyin', 'weibo'];
                                const newComment = {
                                    id: this.comments.length + i + 1,
                                    userId: `U${2000 + i}`,
                                    content: `导入的评论内容 ${i + 1} - 需要进一步分析。这是一条测试评论，用于验证系统功能。`,
                                    platform: platforms[Math.floor(Math.random() * platforms.length)],
                                    timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
                                    aigcProbability: Math.random(),
                                    riskLevel: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
                                    ipAddress: `192.168.1.${150 + i}`,
                                    productId: `P${2000 + i}`,
                                    rating: Math.floor(Math.random() * 5) + 1
                                };
                                newComments.push(newComment);
                            }
                        }
                        
                        // 添加到评论列表
                        this.comments.push(...newComments);
                        
                        // 更新检测详情
                        newComments.forEach(comment => {
                            this.detectionDetails.push({
                                id: comment.id,
                                userId: comment.userId,
                                content: comment.content.length > 50 ? comment.content.substring(0, 50) + '...' : comment.content,
                                fullContent: comment.content,
                                probability: comment.aigcProbability,
                                riskLevel: comment.riskLevel,
                                platform: comment.platform,
                                timestamp: comment.timestamp,
                                detectedAt: new Date().toISOString(),
                                selected: false
                            });
                        });
                        
                        this.calculateStats();
                        this.updateCharts();
                        
                        setTimeout(() => {
                            this.importing = false;
                            this.closeModal('import');
                            this.showNotification(`成功导入 ${newComments.length} 条评论记录`, 'success');
                            this.addSystemLog('数据导入', 'create', `导入 ${newComments.length} 条评论`);
                        }, 1000);
                    }
                }, 100);
            },
            
            // 编辑用户
            editUser(id) {
                const user = this.systemUsers.find(u => u.id === id);
                if (user) {
                    const newEmail = prompt('请输入新的邮箱地址:', user.email);
                    if (newEmail !== null && newEmail.includes('@')) {
                        user.email = newEmail;
                        this.showNotification('用户信息已更新', 'success');
                        this.addSystemLog('用户管理', 'update', `更新用户 ${user.username} 的邮箱`);
                    } else if (newEmail !== null) {
                        this.showNotification('邮箱格式不正确', 'error');
                    }
                }
            },
            
            // 切换用户状态
            toggleUserStatus(id) {
                const user = this.systemUsers.find(u => u.id === id);
                if (user) {
                    user.status = user.status === 'active' ? 'inactive' : 'active';
                    const action = user.status === 'active' ? '启用' : '禁用';
                    this.showNotification(`用户 ${user.username} 已${action}`, 'success');
                    this.addSystemLog('用户管理', 'update', `${action}用户 ${user.username}`);
                }
            },
            
            // 删除用户
            deleteUser(id) {
                if (confirm('确定要删除这个用户吗？此操作不可恢复。')) {
                    const index = this.systemUsers.findIndex(u => u.id === id);
                    if (index !== -1) {
                        const username = this.systemUsers[index].username;
                        this.systemUsers.splice(index, 1);
                        this.showNotification(`用户 ${username} 已删除`, 'success');
                        this.addSystemLog('用户管理', 'delete', `删除用户 ${username}`);
                    }
                }
            },
            
            // 保存新用户
            saveNewUser() {
                if (!this.isValidUserForm) {
                    this.showNotification('请填写完整的用户信息', 'warning');
                    return;
                }
                
                const newId = Math.max(...this.systemUsers.map(u => u.id)) + 1;
                const newUser = {
                    id: newId,
                    username: this.newUser.username,
                    role: this.newUser.role,
                    roleName: this.newUser.role === 'admin' ? '系统管理员' : 
                              this.newUser.role === 'analyst' ? '安全分析师' : '访客',
                    email: this.newUser.email,
                    createdAt: new Date().toISOString().slice(0, 10),
                    lastLogin: null,
                    status: 'active'
                };
                
                this.systemUsers.push(newUser);
                this.closeModal('addUser');
                this.showNotification(`用户 ${newUser.username} 创建成功`, 'success');
                this.addSystemLog('用户管理', 'create', `创建新用户 ${newUser.username}`);
            },
            
            // 创建新任务
            createNewTask() {
                const taskName = prompt('请输入任务名称:');
                if (taskName) {
                    const newTask = {
                        id: Math.max(...this.detectionTasks.map(t => t.id)) + 1,
                        name: taskName,
                        description: '新创建的检测任务',
                        createdAt: new Date().toLocaleString(),
                        createdBy: this.userName,
                        schedule: '手动触发',
                        status: 'pending',
                        statusText: '待开始',
                        progress: 0
                    };
                    
                    this.detectionTasks.push(newTask);
                    this.showNotification(`任务 "${taskName}" 创建成功`, 'success');
                    this.addSystemLog('任务管理', 'create', `创建新任务 "${taskName}"`);
                }
            },
            
            // 查看任务详情
            viewTask(id) {
                const task = this.detectionTasks.find(t => t.id === id);
                if (task) {
                    alert(`任务详情：
名称: ${task.name}
描述: ${task.description}
创建时间: ${task.createdAt}
创建者: ${task.createdBy}
调度: ${task.schedule}
状态: ${task.statusText}
进度: ${task.progress}%`);
                }
            },
            
            // 查看任务结果
            viewTaskResults(id) {
                const task = this.detectionTasks.find(t => t.id === id);
                if (task) {
                    this.showNotification(`正在加载任务 "${task.name}" 的结果...`, 'info');
                    this.addSystemLog('任务管理', 'create', `查看任务 "${task.name}" 的结果`);
                }
            },
            
            // 启动任务
            startTask(id) {
                const task = this.detectionTasks.find(t => t.id === id);
                if (task) {
                    task.status = 'running';
                    task.statusText = '进行中';
                    task.progress = 10;
                    this.showNotification(`任务 "${task.name}" 已启动`, 'success');
                    this.addSystemLog('任务管理', 'update', `启动任务 "${task.name}"`);
                    
                    // 模拟任务进度
                    const progressInterval = setInterval(() => {
                        task.progress += 5;
                        if (task.progress >= 100) {
                            clearInterval(progressInterval);
                            task.status = 'completed';
                            task.statusText = '已完成';
                            this.showNotification(`任务 "${task.name}" 已完成`, 'success');
                        }
                    }, 500);
                }
            },
            
            // 停止任务
            stopTask(id) {
                const task = this.detectionTasks.find(t => t.id === id);
                if (task) {
                    task.status = 'completed';
                    task.statusText = '已完成';
                    this.showNotification(`任务 "${task.name}" 已停止`, 'info');
                    this.addSystemLog('任务管理', 'update', `停止任务 "${task.name}"`);
                }
            },
            
            // 删除任务
            deleteTask(id) {
                if (confirm('确定要删除这个任务吗？此操作不可恢复。')) {
                    const index = this.detectionTasks.findIndex(t => t.id === id);
                    if (index !== -1) {
                        const taskName = this.detectionTasks[index].name;
                        this.detectionTasks.splice(index, 1);
                        this.showNotification(`任务 "${taskName}" 已删除`, 'success');
                        this.addSystemLog('任务管理', 'delete', `删除任务 "${taskName}"`);
                    }
                }
            },
            
            // 保存系统设置
            saveSystemSettings() {
                // 在实际应用中，这里应该发送API请求保存设置
                this.showNotification('系统设置已保存', 'success');
                this.addSystemLog('系统设置', 'update', '更新系统配置');
            },
            
            // 刷新日志
            refreshLogs() {
                this.loadSystemLogs();
                this.showNotification('操作日志已刷新', 'info');
            },
            
            // 添加系统日志
            addSystemLog(operation, type, details) {
                const newLog = {
                    id: this.systemLogs.length + 1,
                    timestamp: new Date().toLocaleString('zh-CN'),
                    username: this.userName,
                    operation,
                    type,
                    details,
                    ipAddress: '192.168.1.' + Math.floor(Math.random() * 100 + 100)
                };
                
                this.systemLogs.unshift(newLog);
                
                // 限制日志数量
                if (this.systemLogs.length > 100) {
                    this.systemLogs.pop();
                }
            }
        },
        
        template: `
            <!-- 顶部导航栏 -->
            <header class="header">
                <div class="logo">
                    <i class="fas fa-robot"></i>
                    <h1>AI水军检测系统</h1>
                </div>
                <div class="user-info">
                    <div class="api-status" :class="apiStatus.healthy ? 'healthy' : 'unhealthy'">
                        <i :class="apiStatus.healthy ? 'fas fa-check-circle' : 'fas fa-exclamation-triangle'"></i>
                        <span>{{ apiStatus.message }}</span>
                    </div>
                    
                    <div class="role-selector">
                        <label for="role">当前角色:</label>
                        <select id="role" v-model="currentRole" @change="changeRole">
                            <option value="admin">系统管理员</option>
                            <option value="analyst">安全分析师</option>
                            <option value="visitor">访客</option>
                        </select>
                    </div>
                    <div class="user-dropdown">
                        <div class="user" @click="toggleUserDropdown">
                            <i class="fas fa-user-circle"></i>
                            <span>{{ userName }}</span>
                            <i class="fas fa-chevron-down dropdown-icon"></i>
                        </div>
                        <div class="dropdown-menu" v-if="showUserDropdown">
                            <div class="dropdown-header">
                                <i class="fas fa-user"></i>
                                <div class="user-details">
                                    <strong>{{ userName }}</strong>
                                    <small>{{ userEmail }}</small>
                                </div>
                            </div>
                            <div class="dropdown-divider"></div>
                            <a href="#" class="dropdown-item" @click.prevent="viewProfile">
                                <i class="fas fa-user-edit"></i>
                                个人信息
                            </a>
                            <a href="#" class="dropdown-item" @click.prevent="changePassword">
                                <i class="fas fa-key"></i>
                                修改密码
                            </a>
                            <div class="dropdown-divider"></div>
                            <a href="#" class="dropdown-item logout" @click.prevent="logout">
                                <i class="fas fa-sign-out-alt"></i>
                                退出登录
                            </a>
                        </div>
                    </div>
                </div>
            </header>

            <div class="container">
                <!-- 侧边栏导航 -->
                <nav class="sidebar">
                    <ul>
                        <li @click="changeTab('dashboard')" :class="{active: activeTab === 'dashboard'}">
                            <i class="fas fa-tachometer-alt"></i> 仪表盘
                        </li>
                        <li @click="changeTab('dataManagement')" :class="{active: activeTab === 'dataManagement'}">
                            <i class="fas fa-database"></i> 数据管理
                        </li>
                        <li @click="changeTab('aiDetection')" :class="{active: activeTab === 'aiDetection'}">
                            <i class="fas fa-search"></i> AI检测分析
                        </li>
                        <li @click="changeTab('visualization')" :class="{active: activeTab === 'visualization'}">
                            <i class="fas fa-chart-network"></i> 可视化分析
                        </li>
                        <li v-if="currentRole === 'admin' || currentRole === 'analyst'" 
                            @click="changeTab('systemManagement')" 
                            :class="{active: activeTab === 'systemManagement'}">
                            <i class="fas fa-cog"></i> 系统管理
                        </li>
                    </ul>
                </nav>

                <!-- 主内容区域 -->
                <main class="main-content">
                    <!-- 仪表盘页面 -->
                    <div v-if="activeTab === 'dashboard'" class="dashboard">
                        <h2><i class="fas fa-tachometer-alt"></i> 系统仪表盘</h2>
                        
                        <div class="stats-cards">
                            <div class="stat-card">
                                <div class="stat-icon" style="background-color: #4CAF50;">
                                    <i class="fas fa-comments"></i>
                                </div>
                                <div class="stat-info">
                                    <h3>{{ formatNumber(stats.totalComments) }}</h3>
                                    <p>总评论数</p>
                                </div>
                            </div>
                            
                            <div class="stat-card">
                                <div class="stat-icon" style="background-color: #FF5722;">
                                    <i class="fas fa-robot"></i>
                                </div>
                                <div class="stat-info">
                                    <h3>{{ formatNumber(stats.aigcComments) }}</h3>
                                    <p>AIGC疑似评论</p>
                                </div>
                            </div>
                            
                            <div class="stat-card">
                                <div class="stat-icon" style="background-color: #2196F3;">
                                    <i class="fas fa-users"></i>
                                </div>
                                <div class="stat-info">
                                    <h3>{{ stats.waterArmyClusters }}</h3>
                                    <p>水军集群数</p>
                                </div>
                            </div>
                            
                            <div class="stat-card">
                                <div class="stat-icon" style="background-color: #9C27B0;">
                                    <i class="fas fa-user-secret"></i>
                                </div>
                                <div class="stat-info">
                                    <h3>{{ formatNumber(stats.suspectedUsers) }}</h3>
                                    <p>可疑用户数</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="charts-container">
                            <div class="chart-box">
                                <h3>AIGC检测比例分布</h3>
                                <canvas ref="aigcChart"></canvas>
                            </div>
                            <div class="chart-box">
                                <h3>水军风险等级分布</h3>
                                <canvas ref="riskChart"></canvas>
                            </div>
                        </div>
                        
                        <div class="recent-activities">
                            <h3>最近检测活动</h3>
                            <table>
                                <thead>
                                    <tr>
                                        <th>时间</th>
                                        <th>任务名称</th>
                                        <th>状态</th>
                                        <th>结果</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="activity in recentActivities" :key="activity.id">
                                        <td>{{ activity.time }}</td>
                                        <td>{{ activity.taskName }}</td>
                                        <td><span :class="'status-' + activity.status">{{ activity.statusText }}</span></td>
                                        <td>{{ activity.result }}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- 数据管理页面 -->
                    <div v-if="activeTab === 'dataManagement'" class="data-management">
                        <h2><i class="fas fa-database"></i> 数据管理</h2>
                        
                        <div class="action-buttons">
                            <button class="btn btn-primary" @click="openImportModal">
                                <i class="fas fa-upload"></i> 导入评论数据
                            </button>
                            <button class="btn btn-secondary" @click="refreshData">
                                <i class="fas fa-sync-alt"></i> 刷新数据
                            </button>
                            <button class="btn btn-secondary" @click="exportData">
                                <i class="fas fa-download"></i> 导出数据
                            </button>
                        </div>
                        
                        <div class="search-box">
                            <input type="text" placeholder="搜索评论内容、用户ID..." v-model="searchQuery" @keyup.enter="searchData">
                            <select v-model="filterPlatform">
                                <option value="">所有平台</option>
                                <option value="taobao">淘宝</option>
                                <option value="jd">京东</option>
                                <option value="douyin">抖音</option>
                                <option value="weibo">微博</option>
                            </select>
                            <input type="date" v-model="filterDateStart">
                            <span>至</span>
                            <input type="date" v-model="filterDateEnd">
                            <button class="btn btn-search" @click="searchData">
                                <i class="fas fa-search"></i> 搜索
                            </button>
                        </div>
                        
                        <div class="data-table-container">
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>用户ID</th>
                                        <th>评论内容</th>
                                        <th>平台</th>
                                        <th>时间</th>
                                        <th>AIGC概率</th>
                                        <th>操作</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="comment in paginatedComments" :key="comment.id">
                                        <td>{{ comment.id }}</td>
                                        <td>{{ comment.userId }}</td>
                                        <td class="comment-content">{{ comment.content }}</td>
                                        <td><span class="platform-tag" :class="comment.platform">{{ getPlatformName(comment.platform) }}</span></td>
                                        <td>{{ formatDate(comment.timestamp) }}</td>
                                        <td>
                                            <div class="probability-display">
                                                <div class="probability-bar">
                                                    <div class="probability-fill" :style="{width: comment.aigcProbability*100 + '%'}"></div>
                                                </div>
                                                <span>{{ (comment.aigcProbability*100).toFixed(1) }}%</span>
                                            </div>
                                        </td>
                                        <td>
                                            <button class="btn-icon" @click="viewComment(comment.id)" title="查看详情">
                                                <i class="fas fa-eye"></i>
                                            </button>
                                            <button class="btn-icon" @click="editComment(comment.id)" title="编辑">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <button class="btn-icon btn-danger" @click="deleteComment(comment.id)" title="删除">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <div class="pagination">
                                <button @click="prevPage" :disabled="currentPage === 1">上一页</button>
                                <span>第 {{ currentPage }} 页 / 共 {{ totalPages }} 页 ({{ filteredComments.length }} 条记录)</span>
                                <button @click="nextPage" :disabled="currentPage === totalPages">下一页</button>
                            </div>
                        </div>
                    </div>

                    <!-- AI检测分析页面 -->
                    <div v-if="activeTab === 'aiDetection'" class="ai-detection">
                        <h2><i class="fas fa-search"></i> AI检测分析</h2>
                        
                        <div class="detection-panel">
                            <div class="detection-controls">
                                <div class="control-group">
                                    <label>检测模式:</label>
                                    <select v-model="detectionMode">
                                        <option value="single">单条评论检测</option>
                                        <option value="batch">批量检测</option>
                                        <option value="realtime">实时监测</option>
                                    </select>
                                </div>
                                
                                <div class="control-group">
                                    <label>检测范围:</label>
                                    <select v-model="detectionScope">
                                        <option value="all">全部评论</option>
                                        <option value="recent">最近7天</option>
                                        <option value="selected">仅选中用户</option>
                                    </select>
                                </div>
                                
                                <div class="control-group">
                                    <label>检测算法:</label>
                                    <select v-model="detectionAlgorithm">
                                        <option value="bert">BERT模型</option>
                                        <option value="ensemble">集成学习</option>
                                        <option value="deep">深度学习</option>
                                    </select>
                                </div>
                                
                                <button class="btn btn-primary" @click="startDetection" 
                                        :disabled="detectionInProgress || (detectionScope === 'selected' && selectedUsersForDetection.length === 0)">
                                    <i class="fas fa-play"></i> 
                                    {{ detectionInProgress ? '检测中...' : '开始检测分析' }}
                                </button>
                                
                                <div class="detection-progress" v-if="detectionInProgress">
                                    <div class="progress-bar">
                                        <div class="progress-fill" :style="{width: detectionProgress + '%'}"></div>
                                    </div>
                                    <span>{{ detectionProgress }}%</span>
                                </div>
                            </div>
                            
                            <div class="detection-input" v-if="detectionMode === 'single'">
                                <textarea v-model="singleCommentText" placeholder="输入待检测的评论内容..." rows="3"></textarea>
                                <button class="btn btn-secondary" @click="detectSingleComment">
                                    <i class="fas fa-search"></i> 立即检测
                                </button>
                            </div>
                        </div>
                        
                        <div class="results-container">
                            <div class="results-summary">
                                <h3>检测结果概览</h3>
                                <div class="summary-cards">
                                    <div class="summary-card">
                                        <div class="summary-value">{{ aigcDetectionResults.total }}</div>
                                        <div class="summary-label">检测评论总数</div>
                                    </div>
                                    <div class="summary-card">
                                        <div class="summary-value" style="color: #FF5722;">{{ aigcDetectionResults.aigcCount }}</div>
                                        <div class="summary-label">AIGC疑似评论</div>
                                    </div>
                                    <div class="summary-card">
                                        <div class="summary-value">{{ aigcDetectionResults.averageProbability.toFixed(2) }}</div>
                                        <div class="summary-label">平均AIGC概率</div>
                                    </div>
                                    <div class="summary-card">
                                        <div class="summary-value">{{ aigcDetectionResults.clustersFound }}</div>
                                        <div class="summary-label">发现集群数</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="detailed-results">
                                <div class="results-header">
                                    <h3>详细检测结果</h3>
                                    <div class="results-actions">
                                        <button class="btn btn-secondary" @click="exportResults">
                                            <i class="fas fa-download"></i> 导出结果
                                        </button>
                                        <button class="btn btn-secondary" @click="clearResults">
                                            <i class="fas fa-trash"></i> 清空结果
                                        </button>
                                    </div>
                                </div>
                                <table>
                                    <thead>
                                        <tr>
                                            <th width="50">
                                                <input type="checkbox" 
                                                       @change="toggleAllSelection" 
                                                       :checked="allSelected">
                                            </th>
                                            <th>评论ID</th>
                                            <th>用户ID</th>
                                            <th>评论内容</th>
                                            <th>AIGC概率</th>
                                            <th>风险等级</th>
                                            <th>检测时间</th>
                                            <th>操作</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="result in detectionDetails" :key="result.id">
                                            <td>
                                                <input type="checkbox" 
                                                       v-model="result.selected"
                                                       @change="toggleUserSelection(result.id)">
                                            </td>
                                            <td>{{ result.id }}</td>
                                            <td>{{ result.userId }}</td>
                                            <td class="comment-preview">{{ result.content }}</td>
                                            <td>
                                                <div class="probability-display">
                                                    <div class="probability-bar">
                                                        <div class="probability-fill" :style="{width: result.probability*100 + '%'}"></div>
                                                    </div>
                                                    <span>{{ (result.probability*100).toFixed(1) }}%</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span :class="'risk-level risk-' + result.riskLevel">{{ getRiskLevelName(result.riskLevel) }}</span>
                                            </td>
                                            <td>{{ formatDate(result.detectedAt) }}</td>
                                            <td>
                                                <button class="btn-icon" @click="viewDetails(result.id)" title="查看详情">
                                                    <i class="fas fa-info-circle"></i>
                                                </button>
                                                <button class="btn-icon" @click="markAsWaterArmy(result.id)" title="标记为水军">
                                                    <i class="fas fa-flag"></i>
                                                </button>
                                                <button class="btn-icon" @click="addToBlacklist(result.userId)" title="加入黑名单">
                                                    <i class="fas fa-ban"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <!-- 可视化分析页面 -->
                    <div v-if="activeTab === 'visualization'" class="visualization">
                        <h2><i class="fas fa-chart-network"></i> 可视化分析</h2>
                        
                        <div class="visualization-controls">
                            <div class="control-group">
                                <label>可视化类型:</label>
                                <select v-model="visualizationType" @change="updateVisualization">
                                    <option value="network">水军网络关系图</option>
                                    <option value="timeline">时间线分析</option>
                                    <option value="heatmap">热力图分析</option>
                                    <option value="distribution">分布图分析</option>
                                </select>
                            </div>
                            
                            <div class="control-group">
                                <label>风险等级过滤:</label>
                                <select v-model="riskFilter" @change="updateVisualization">
                                    <option value="all">全部</option>
                                    <option value="high">高风险</option>
                                    <option value="medium">中风险</option>
                                    <option value="low">低风险</option>
                                </select>
                            </div>
                            
                            <div class="control-group">
                                <label>时间范围:</label>
                                <select v-model="timeRange" @change="updateVisualization">
                                    <option value="7d">最近7天</option>
                                    <option value="30d">最近30天</option>
                                    <option value="90d">最近90天</option>
                                    <option value="all">全部时间</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="visualization-area">
                            <div class="network-container" v-if="visualizationType === 'network'">
                                <h3>水军集群网络关系图</h3>
                                <div class="network-graph" ref="networkGraph">
                                    <!-- 动态生成网络节点 -->
                                    <div v-for="(node, index) in networkNodes" 
                                         :key="'node-' + index"
                                         class="network-node"
                                         :class="'cluster-' + node.riskLevel"
                                         :style="{top: node.y + 'px', left: node.x + 'px'}"
                                         @click="selectNetworkNode(node)">
                                        <div class="node-label">{{ node.label }}</div>
                                    </div>
                                    <!-- 连接线 -->
                                    <div v-for="(link, index) in networkLinks" 
                                         :key="'link-' + index"
                                         class="connection"
                                         :style="getLinkStyle(link)"></div>
                                </div>
                                <div class="network-legend">
                                    <div class="legend-item">
                                        <div class="legend-color cluster-high"></div>
                                        <span>高风险集群</span>
                                    </div>
                                    <div class="legend-item">
                                        <div class="legend-color cluster-medium"></div>
                                        <span>中风险集群</span>
                                    </div>
                                    <div class="legend-item">
                                        <div class="legend-color cluster-low"></div>
                                        <span>低风险集群</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="chart-container" v-if="visualizationType === 'timeline'">
                                <h3>水军活动时间线</h3>
                                <canvas ref="timelineChart"></canvas>
                            </div>
                            
                            <div class="chart-container" v-if="visualizationType === 'heatmap'">
                                <h3>水军活动热力图</h3>
                                <canvas ref="heatmapChart"></canvas>
                            </div>
                            
                            <div class="chart-container" v-if="visualizationType === 'distribution'">
                                <h3>评论分布分析</h3>
                                <canvas ref="distributionChart"></canvas>
                            </div>
                        </div>
                        
                        <div class="evidence-chain" v-if="selectedNode">
                            <h3>证据链查看 - {{ selectedNode.label }}</h3>
                            <div class="evidence-container">
                                <div class="evidence-item">
                                    <div class="evidence-header">
                                        <h4>集群ID: {{ selectedNode.id }}</h4>
                                        <span :class="'risk-level risk-' + selectedNode.riskLevel">{{ getRiskLevelName(selectedNode.riskLevel) }}</span>
                                    </div>
                                    <div class="evidence-content">
                                        <p><strong>关联用户数:</strong> {{ selectedNode.userCount }} 人</p>
                                        <p><strong>评论数量:</strong> {{ selectedNode.commentCount }} 条</p>
                                        <p><strong>平均AIGC概率:</strong> {{ (selectedNode.avgProbability * 100).toFixed(1) }}%</p>
                                        <p><strong>主要平台:</strong> {{ selectedNode.mainPlatform }}</p>
                                        <p><strong>行为模式:</strong> {{ selectedNode.behaviorPattern }}</p>
                                        <p><strong>首次发现时间:</strong> {{ formatDate(selectedNode.firstSeen) }}</p>
                                        <p><strong>最近活跃时间:</strong> {{ formatDate(selectedNode.lastActive) }}</p>
                                    </div>
                                    <div class="evidence-actions">
                                        <button class="btn btn-primary" @click="viewClusterDetails(selectedNode)">
                                            <i class="fas fa-search"></i> 查看详情
                                        </button>
                                        <button class="btn btn-secondary" @click="exportClusterData(selectedNode)">
                                            <i class="fas fa-download"></i> 导出数据
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 系统管理页面 -->
                    <div v-if="activeTab === 'systemManagement'" class="system-management">
                        <h2><i class="fas fa-cog"></i> 系统管理</h2>
                        
                        <div class="management-tabs">
                            <button :class="{active: managementTab === 'users'}" @click="managementTab = 'users'">
                                <i class="fas fa-users"></i> 用户管理
                            </button>
                            <button :class="{active: managementTab === 'tasks'}" @click="managementTab = 'tasks'">
                                <i class="fas fa-tasks"></i> 任务管理
                            </button>
                            <button :class="{active: managementTab === 'system'}" @click="managementTab = 'system'">
                                <i class="fas fa-cogs"></i> 系统设置
                            </button>
                            <button :class="{active: managementTab === 'logs'}" @click="managementTab = 'logs'">
                                <i class="fas fa-history"></i> 操作日志
                            </button>
                        </div>
                        
                        <!-- 用户管理 -->
                        <div v-if="managementTab === 'users'" class="users-management">
                            <div class="section-header">
                                <h3>用户列表</h3>
                                <button class="btn btn-primary" @click="openAddUserModal">
                                    <i class="fas fa-user-plus"></i> 添加用户
                                </button>
                            </div>
                            
                            <table class="management-table">
                                <thead>
                                    <tr>
                                        <th>用户名</th>
                                        <th>角色</th>
                                        <th>邮箱</th>
                                        <th>创建时间</th>
                                        <th>最后登录</th>
                                        <th>状态</th>
                                        <th>操作</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="user in systemUsers" :key="user.id">
                                        <td>{{ user.username }}</td>
                                        <td><span :class="'role-tag role-' + user.role">{{ user.roleName }}</span></td>
                                        <td>{{ user.email }}</td>
                                        <td>{{ user.createdAt }}</td>
                                        <td>{{ user.lastLogin || '从未登录' }}</td>
                                        <td>
                                            <span :class="'status-' + user.status">
                                                {{ user.status === 'active' ? '活跃' : '禁用' }}
                                            </span>
                                        </td>
                                        <td>
                                            <button class="btn-icon" @click="editUser(user.id)" title="编辑">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <button class="btn-icon" 
                                                    :class="user.status === 'active' ? 'btn-warning' : 'btn-success'"
                                                    @click="toggleUserStatus(user.id)" 
                                                    :title="user.status === 'active' ? '禁用' : '启用'">
                                                <i :class="user.status === 'active' ? 'fas fa-ban' : 'fas fa-check'"></i>
                                            </button>
                                            <button class="btn-icon btn-danger" @click="deleteUser(user.id)" title="删除">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        
                        <!-- 任务管理 -->
                        <div v-if="managementTab === 'tasks'" class="tasks-management">
                            <div class="section-header">
                                <h3>检测任务管理</h3>
                                <button class="btn btn-primary" @click="createNewTask">
                                    <i class="fas fa-plus"></i> 创建新任务
                                </button>
                            </div>
                            
                            <div class="tasks-list">
                                <div class="task-item" v-for="task in detectionTasks" :key="task.id">
                                    <div class="task-info">
                                        <h4>{{ task.name }}</h4>
                                        <p>{{ task.description }}</p>
                                        <div class="task-meta">
                                            <span><i class="fas fa-calendar"></i> {{ task.createdAt }}</span>
                                            <span><i class="fas fa-user"></i> {{ task.createdBy }}</span>
                                            <span v-if="task.schedule"><i class="fas fa-clock"></i> {{ task.schedule }}</span>
                                        </div>
                                    </div>
                                    <div class="task-status">
                                        <span :class="'task-status-' + task.status">{{ task.statusText }}</span>
                                        <div v-if="task.status === 'running'" class="task-progress">
                                            <div class="progress-bar">
                                                <div class="progress-fill" :style="{width: task.progress + '%'}"></div>
                                            </div>
                                            <span>{{ task.progress }}%</span>
                                        </div>
                                    </div>
                                    <div class="task-actions">
                                        <button class="btn-icon" @click="viewTask(task.id)" title="查看详情">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                        <button v-if="task.status === 'pending'" class="btn-icon" @click="startTask(task.id)" title="启动任务">
                                            <i class="fas fa-play"></i>
                                        </button>
                                        <button v-if="task.status === 'running'" class="btn-icon" @click="stopTask(task.id)" title="停止任务">
                                            <i class="fas fa-stop"></i>
                                        </button>
                                        <button v-if="task.status === 'completed'" class="btn-icon" @click="viewTaskResults(task.id)" title="查看结果">
                                            <i class="fas fa-chart-bar"></i>
                                        </button>
                                        <button class="btn-icon btn-danger" @click="deleteTask(task.id)" title="删除任务">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- 系统设置 -->
                        <div v-if="managementTab === 'system'" class="system-settings">
                            <div class="settings-section">
                                <h3><i class="fas fa-sliders-h"></i> 系统配置</h3>
                                <div class="settings-form">
                                    <div class="form-group">
                                        <label>系统名称:</label>
                                        <input type="text" v-model="systemSettings.systemName" placeholder="AI水军检测系统">
                                    </div>
                                    <div class="form-group">
                                        <label>AIGC检测阈值:</label>
                                        <input type="range" v-model="systemSettings.aigcThreshold" min="0" max="100" step="1">
                                        <span>{{ systemSettings.aigcThreshold }}%</span>
                                    </div>
                                    <div class="form-group">
                                        <label>自动检测间隔:</label>
                                        <select v-model="systemSettings.autoDetectionInterval">
                                            <option value="3600">1小时</option>
                                            <option value="7200">2小时</option>
                                            <option value="21600">6小时</option>
                                            <option value="43200">12小时</option>
                                            <option value="86400">24小时</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label>数据保留天数:</label>
                                        <input type="number" v-model="systemSettings.dataRetentionDays" min="30" max="365">
                                    </div>
                                    <button class="btn btn-primary" @click="saveSystemSettings">
                                        <i class="fas fa-save"></i> 保存设置
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <!-- 操作日志 -->
                        <div v-if="managementTab === 'logs'" class="system-logs">
                            <div class="section-header">
                                <h3>系统操作日志</h3>
                                <button class="btn btn-secondary" @click="refreshLogs">
                                    <i class="fas fa-sync-alt"></i> 刷新
                                </button>
                            </div>
                            <div class="logs-container">
                                <table class="logs-table">
                                    <thead>
                                        <tr>
                                            <th>时间</th>
                                            <th>用户</th>
                                            <th>操作</th>
                                            <th>详情</th>
                                            <th>IP地址</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="log in systemLogs" :key="log.id">
                                            <td>{{ log.timestamp }}</td>
                                            <td>{{ log.username }}</td>
                                            <td><span :class="'log-type-' + log.type">{{ log.operation }}</span></td>
                                            <td>{{ log.details }}</td>
                                            <td>{{ log.ipAddress }}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            <!-- 模态框 - 导入数据 -->
            <div v-if="showImportModal" class="modal-overlay" @click.self="closeModal('import')">
                <div class="modal" @click.stop>
                    <div class="modal-header">
                        <h3><i class="fas fa-upload"></i> 导入评论数据</h3>
                        <button class="close-modal" @click="closeModal('import')">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="import-options">
                            <div class="option">
                                <input type="radio" id="importFile" name="importType" value="file" v-model="importType">
                                <label for="importFile">文件上传</label>
                                <div v-if="importType === 'file'" class="option-details">
                                    <p>支持格式: CSV, JSON, Excel</p>
                                    <div class="file-upload-area" @click="triggerFileUpload" @dragover.prevent @drop="handleFileDrop">
                                        <i class="fas fa-cloud-upload-alt"></i>
                                        <p>点击或拖拽文件到此处</p>
                                        <input type="file" id="fileUpload" @change="handleFileSelect" style="display: none;" accept=".csv,.json,.xlsx,.xls">
                                    </div>
                                    <div v-if="selectedFile" class="selected-file">
                                        <i class="fas fa-file"></i>
                                        <span>{{ selectedFile.name }} ({{ formatFileSize(selectedFile.size) }})</span>
                                        <button @click="removeFile" class="btn-icon btn-danger">
                                            <i class="fas fa-times"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="option">
                                <input type="radio" id="importAPI" name="importType" value="api" v-model="importType">
                                <label for="importAPI">API接口</label>
                                <div v-if="importType === 'api'" class="option-details">
                                    <div class="form-group">
                                        <label>API地址:</label>
                                        <input type="text" v-model="apiEndpoint" placeholder="https://api.example.com/comments">
                                    </div>
                                    <div class="form-group">
                                        <label>API密钥:</label>
                                        <input type="password" v-model="apiKey" placeholder="请输入API密钥">
                                    </div>
                                    <div class="form-group">
                                        <label>数据量限制:</label>
                                        <input type="number" v-model="apiLimit" placeholder="最大记录数">
                                    </div>
                                </div>
                            </div>
                            
                            <div class="option">
                                <input type="radio" id="importManual" name="importType" value="manual" v-model="importType">
                                <label for="importManual">手动输入</label>
                                <div v-if="importType === 'manual'" class="option-details">
                                    <div class="form-group">
                                        <label>平台:</label>
                                        <select v-model="manualPlatform">
                                            <option value="taobao">淘宝</option>
                                            <option value="jd">京东</option>
                                            <option value="douyin">抖音</option>
                                            <option value="weibo">微博</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label>评论内容:</label>
                                        <textarea v-model="manualContent" rows="4" placeholder="输入评论内容..."></textarea>
                                    </div>
                                    <div class="form-group">
                                        <label>用户ID:</label>
                                        <input type="text" v-model="manualUserId" placeholder="用户ID">
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div v-if="importProgress > 0" class="import-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" :style="{width: importProgress + '%'}"></div>
                            </div>
                            <span>{{ importProgress }}% - {{ importStatus }}</span>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" @click="closeModal('import')">取消</button>
                        <button class="btn btn-primary" @click="confirmImport" :disabled="importing">
                            <i class="fas fa-upload"></i> {{ importing ? '导入中...' : '确认导入' }}
                        </button>
                    </div>
                </div>
            </div>

            <!-- 用户行为分析模态框 -->
            <div v-if="showUserAnalysisModal" class="modal-overlay" @click.self="closeModal('userAnalysis')">
                <div class="modal user-analysis-modal" @click.stop>
                    <div class="modal-header">
                        <h3><i class="fas fa-user-shield"></i> 用户行为分析报告</h3>
                        <button class="close-modal" @click="closeModal('userAnalysis')">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="analysis-results" v-if="currentUserAnalysis">
                            <div class="analysis-section">
                                <h4>用户信息</h4>
                                <div class="user-info-grid">
                                    <div><strong>用户ID:</strong> {{ currentUserAnalysis.userId }}</div>
                                    <div><strong>IP地址:</strong> {{ currentUserAnalysis.ipAddress || '未知' }}</div>
                                    <div><strong>平台:</strong> {{ currentUserAnalysis.platform || '多平台' }}</div>
                                    <div><strong>分析时间:</strong> {{ formatDate(new Date()) }}</div>
                                </div>
                            </div>
                            
                            <div class="analysis-section">
                                <h4>风险评分</h4>
                                <div class="risk-score-display">
                                    <div class="risk-score" 
                                         :class="currentUserAnalysis.risk_score > 0.7 ? 'high' : 
                                                 currentUserAnalysis.risk_score > 0.4 ? 'medium' : 'low'">
                                        {{ (currentUserAnalysis.risk_score * 100).toFixed(1) }}%
                                    </div>
                                    <div class="risk-description">
                                        <p v-if="currentUserAnalysis.risk_score > 0.7" style="color: #c62828;">
                                            <i class="fas fa-exclamation-triangle"></i> 高风险用户 - 高度疑似水军
                                        </p>
                                        <p v-else-if="currentUserAnalysis.risk_score > 0.4" style="color: #ef6c00;">
                                            <i class="fas fa-exclamation-circle"></i> 中风险用户 - 需要监控
                                        </p>
                                        <p v-else style="color: #2e7d32;">
                                            <i class="fas fa-check-circle"></i> 低风险用户 - 正常用户
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="analysis-section" v-if="currentUserAnalysis.suspicious_factors && currentUserAnalysis.suspicious_factors.length > 0">
                                <h4>可疑因素</h4>
                                <ul class="suspicious-factors">
                                    <li v-for="(factor, index) in currentUserAnalysis.suspicious_factors" 
                                        :key="index">
                                        <i class="fas fa-exclamation-circle"></i> {{ factor }}
                                    </li>
                                </ul>
                            </div>
                            
                            <div class="analysis-section" v-if="currentUserAnalysis.behavior_pattern">
                                <h4>行为模式分析</h4>
                                <table class="behavior-pattern">
                                    <thead>
                                        <tr>
                                            <th>指标</th>
                                            <th>数值</th>
                                            <th>说明</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="(value, key) in currentUserAnalysis.behavior_pattern" 
                                            :key="key">
                                            <td>{{ getBehaviorLabel(key) }}</td>
                                            <td>{{ value }}</td>
                                            <td>
                                                <span v-if="isSuspiciousBehavior(key, value)" style="color: #c62828;">
                                                    <i class="fas fa-exclamation-triangle"></i> 可疑
                                                </span>
                                                <span v-else style="color: #2e7d32;">
                                                    <i class="fas fa-check"></i> 正常
                                                </span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            
                            <div class="analysis-section" v-if="currentUserAnalysis.recommendations && currentUserAnalysis.recommendations.length > 0">
                                <h4>处理建议</h4>
                                <ul class="recommendations">
                                    <li v-for="(recommendation, index) in currentUserAnalysis.recommendations" 
                                        :key="index">
                                        <i class="fas fa-check-circle"></i> {{ recommendation }}
                                    </li>
                                </ul>
                            </div>
                        </div>
                        
                        <div v-else class="loading">
                            <i class="fas fa-spinner fa-spin"></i> 正在加载分析结果...
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" @click="closeModal('userAnalysis')">
                            关闭
                        </button>
                        <button class="btn btn-primary" 
                                v-if="currentUserAnalysis && currentUserAnalysis.risk_score > 0.7"
                                @click="markAsWaterArmyFromAnalysis">
                            <i class="fas fa-flag"></i> 标记为水军
                        </button>
                        <button class="btn btn-warning" 
                                v-if="currentUserAnalysis && currentUserAnalysis.risk_score > 0.4"
                                @click="addToMonitorList">
                            <i class="fas fa-eye"></i> 加入监控列表
                        </button>
                    </div>
                </div>
            </div>

            <!-- 添加用户模态框 -->
            <div v-if="showAddUserModal" class="modal-overlay" @click.self="closeModal('addUser')">
                <div class="modal" @click.stop>
                    <div class="modal-header">
                        <h3><i class="fas fa-user-plus"></i> 添加用户</h3>
                        <button class="close-modal" @click="closeModal('addUser')">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="user-form">
                            <div class="form-group">
                                <label>用户名:</label>
                                <input type="text" v-model="newUser.username" placeholder="输入用户名">
                            </div>
                            <div class="form-group">
                                <label>邮箱:</label>
                                <input type="email" v-model="newUser.email" placeholder="输入邮箱">
                            </div>
                            <div class="form-group">
                                <label>密码:</label>
                                <input type="password" v-model="newUser.password" placeholder="输入密码">
                            </div>
                            <div class="form-group">
                                <label>确认密码:</label>
                                <input type="password" v-model="newUser.confirmPassword" placeholder="确认密码">
                            </div>
                            <div class="form-group">
                                <label>角色:</label>
                                <select v-model="newUser.role">
                                    <option value="admin">系统管理员</option>
                                    <option value="analyst">安全分析师</option>
                                    <option value="visitor">访客</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" @click="closeModal('addUser')">取消</button>
                        <button class="btn btn-primary" @click="saveNewUser" :disabled="!isValidUserForm">
                            <i class="fas fa-save"></i> 保存用户
                        </button>
                    </div>
                </div>
            </div>

            <!-- 系统通知 -->
            <div v-if="notifications.length > 0" class="notifications">
                <div v-for="notification in notifications" 
                     :key="notification.id"
                     class="notification"
                     :class="'notification-' + notification.type">
                    <i :class="getNotificationIcon(notification.type)"></i>
                    <span>{{ notification.message }}</span>
                    <button class="close-notification" @click="removeNotification(notification.id)">
                        &times;
                    </button>
                </div>
            </div>
        `
    });
    
    // 挂载主应用
    mainApp.mount('#app');
    console.log('主应用挂载完成');
}

// 在全局暴露 initMainApp 函数
window.initMainApp = initMainApp;

// 页面加载完成后检查登录状态
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM加载完成，检查登录状态...');
    
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    const userData = localStorage.getItem('currentUser');
    
    if (token && userData) {
        console.log('用户已登录，切换到主应用');
        // 隐藏认证应用，显示主应用
        const authAppElement = document.getElementById('auth-app');
        const appElement = document.getElementById('app');
        
        if (authAppElement) authAppElement.style.display = 'none';
        if (appElement) appElement.style.display = 'block';
        
        // 初始化主应用
        initMainApp();
    } else {
        console.log('用户未登录，显示认证界面');
        // 确保认证应用显示，主应用隐藏
        const authAppElement = document.getElementById('auth-app');
        const appElement = document.getElementById('app');
        
        if (authAppElement) authAppElement.style.display = 'block';
        if (appElement) appElement.style.display = 'none';
    }
});