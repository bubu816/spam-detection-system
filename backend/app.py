from flask import Flask, jsonify
from backend import api_routes

app = Flask(__name__)

# 注册API路由
api_routes.register_routes(app)

@app.route('/')
def home():
    return """
    <h1>水军检测系统后端</h1>
    <p>API服务运行中！</p>
    <p>可用接口：</p>
    <ul>
        <li>GET /health - 健康检查</li>
        <li>POST /api/detect_cluster - 集群检测</li>
        <li>POST /api/analyze_behavior - 行为分析</li>
        <li>GET /api/test - 测试接口</li>
    </ul>
    """

@app.route('/health')
def health_check():
    return jsonify({"status": "healthy", "service": "spam_detection_backend"})

if __name__ == '__main__':
    print("✅ 水军检测系统后端启动中...")
    print("🌐 访问地址: http://127.0.0.1:5000")
    print("📚 API文档请查看代码注释")
    app.run(debug=True, host='0.0.0.0', port=5000)