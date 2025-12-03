"""
用户行为分析工具（简化版）
"""


def analyze_user(user_id, comments, ips):
    """
    分析单个用户行为

    参数:
        user_id: 用户ID
        comments: 评论列表
        ips: IP地址列表

    返回:
        分析结果字典
    """
    # 基础统计
    comment_count = len(comments)
    unique_ips = len(set(ips))

    # 计算IP集中度
    if ips:
        ip_counts = {}
        for ip in ips:
            ip_counts[ip] = ip_counts.get(ip, 0) + 1
        most_common_ip_count = max(ip_counts.values())
        ip_concentration = most_common_ip_count / len(ips)
    else:
        ip_concentration = 0

    # 简单风险评估
    risk_score = 0
    risk_factors = []

    if ip_concentration > 0.8:
        risk_score += 30
        risk_factors.append("IP集中度过高")

    if comment_count > 20:
        risk_score += 40
        risk_factors.append("评论数量异常")

    if unique_ips == 1 and comment_count > 5:
        risk_score += 30
        risk_factors.append("单一IP多评论")

    # 确定风险等级
    if risk_score >= 70:
        risk_level = "high"
    elif risk_score >= 40:
        risk_level = "medium"
    else:
        risk_level = "low"

    return {
        "user_id": user_id,
        "comment_count": comment_count,
        "unique_ips": unique_ips,
        "ip_concentration": round(ip_concentration, 3),
        "risk_score": min(risk_score, 100),
        "risk_level": risk_level,
        "risk_factors": risk_factors,
        "is_suspicious": risk_level in ["high", "medium"]
    }


def simple_analysis_test():
    """测试函数"""
    test_cases = [
        ("正常用户", "user_normal", ["好看", "不错"], ["192.168.1.1", "192.168.1.2"]),
        ("疑似水军", "user_suspicious", ["好"] * 15, ["192.168.1.100"] * 15),
    ]

    for name, user_id, comments, ips in test_cases:
        result = analyze_user(user_id, comments, ips)
        print(f"\n👤 {name} ({user_id}):")
        print(f"   评论数: {result['comment_count']}")
        print(f"   IP集中度: {result['ip_concentration']}")
        print(f"   风险分: {result['risk_score']}")
        print(f"   风险等级: {result['risk_level']}")
        print(f"   可疑: {'是' if result['is_suspicious'] else '否'}")


if __name__ == "__main__":
    simple_analysis_test()