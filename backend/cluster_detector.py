"""
水军集群检测算法（简化版）
真实项目中会用图神经网络或聚类算法
"""


def detect_clusters(users_data):
    """
    检测水军集群

    参数:
        users_data: 用户数据列表，每个元素是用户信息字典
        [
            {"user_id": "u1", "ip": "192.168.1.1", "comment_count": 5},
            {"user_id": "u2", "ip": "192.168.1.1", "comment_count": 5},
            ...
        ]

    返回:
        检测到的集群列表
    """
    # 简单实现：按IP分组
    ip_groups = {}

    for user in users_data:
        ip = user.get('ip', 'unknown')
        if ip not in ip_groups:
            ip_groups[ip] = []
        ip_groups[ip].append(user['user_id'])

    # 找出超过2人的IP组
    clusters = []
    for ip, users in ip_groups.items():
        if len(users) >= 2:  # 简单规则：同一IP有多个用户
            clusters.append({
                "cluster_id": hash(ip) % 1000,  # 简单生成集群ID
                "users": users,
                "common_ip": ip,
                "size": len(users),
                "risk_level": "high" if len(users) > 3 else "medium"
            })

    return clusters


def simple_cluster_test():
    """测试函数"""
    test_data = [
        {"user_id": "user1", "ip": "192.168.1.1", "comment_count": 5},
        {"user_id": "user2", "ip": "192.168.1.1", "comment_count": 8},
        {"user_id": "user3", "ip": "192.168.1.2", "comment_count": 2},
        {"user_id": "user4", "ip": "192.168.1.1", "comment_count": 12},
        {"user_id": "user5", "ip": "192.168.1.3", "comment_count": 1},
    ]

    clusters = detect_clusters(test_data)
    print("🔍 检测到的集群:")
    for cluster in clusters:
        print(f"  集群 {cluster['cluster_id']}: {cluster['users']} (IP: {cluster['common_ip']})")

    return clusters


if __name__ == "__main__":
    simple_cluster_test()