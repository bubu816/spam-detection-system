from flask import jsonify, request
import json


def register_routes(app):
    @app.route('/api/test', methods=['GET'])
    def test_api():
        """测试接口"""
        return jsonify({
            "message": "API运行正常",
            "endpoints": [
                "/api/detect_cluster",
                "/api/analyze_behavior"
            ]
        })

    @app.route('/api/detect_cluster', methods=['POST'])
    def detect_cluster():
        """
        检测水军集群
        请求示例: {"users": ["user1", "user2", "user3", "user4"]}
        """
        try:
            data = request.json
            users = data.get('users', [])

            # 简单模拟检测逻辑
            if len(users) > 3:
                result = {
                    "cluster_id": 101,
                    "users": users,
                    "size": len(users),
                    "risk_level": "high",
                    "description": "检测到疑似水军集群"
                }
            else:
                result = {
                    "cluster_id": None,
                    "users": users,
                    "size": len(users),
                    "risk_level": "low",
                    "description": "未发现明显水军特征"
                }

            return jsonify({
                "success": True,
                "data": result
            })

        except Exception as e:
            return jsonify({
                "success": False,
                "error": str(e)
            }), 500

    @app.route('/api/analyze_behavior', methods=['POST'])
    def analyze_behavior():
        """
        分析用户行为
        请求示例: {"user_id": "u123", "comments": ["好", "很好"], "ips": ["192.168.1.1", "192.168.1.1"]}
        """
        try:
            data = request.json
            user_id = data.get('user_id', 'unknown')
            comments = data.get('comments', [])
            ips = data.get('ips', [])

            # 简单模拟分析逻辑
            ip_variety = len(set(ips))  # IP种类数
            total_ips = len(ips) if ips else 1
            ip_similarity = 1 - (ip_variety / total_ips)  # IP相似度

            is_suspicious = ip_similarity > 0.7 or len(comments) > 10

            result = {
                "user_id": user_id,
                "comment_count": len(comments),
                "ip_variety": ip_variety,
                "ip_similarity": round(ip_similarity, 2),
                "is_suspicious": is_suspicious,
                "risk_score": round(min(ip_similarity * 100, 100), 1)
            }

            return jsonify({
                "success": True,
                "data": result
            })

        except Exception as e:
            return jsonify({
                "success": False,
                "error": str(e)
            }), 500