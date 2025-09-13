#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script to generate emoji for each article in all_articles_data.json
"""

import json
import sys
from typing import Dict, List, Any

def generate_emoji(title: str) -> str:
    """根据标题生成 emoji 的函数"""
    emoji_map = {
        '春': '🌸', '夏': '☀️', '秋': '🍂', '冬': '❄️',
        '花': '🌺', '树': '🌳', '叶': '🍃', '草': '🌱',
        '雨': '🌧️', '雪': '❄️', '风': '💨', '云': '☁️',
        '太阳': '☀️', '月': '🌙', '星': '⭐', '天': '🌤️',
        '山': '⛰️', '水': '💧', '河': '🏞️', '海': '🌊',
        '动物': '🐾', '鸟': '🐦', '鱼': '🐟', '虫': '🐛',
        '兔': '🐰', '鸡': '🐔', '牛': '🐄', '马': '🐎',
        '猫': '🐱', '狗': '🐶', '熊': '🐻', '象': '🐘',
        '鼠': '🐭', '虎': '🐯', '龙': '🐉', '蛇': '🐍',
        '羊': '🐑', '猴': '🐵', '鸡': '🐓', '狗': '🐕',
        '猪': '🐷', '蛙': '🐸', '蝌蚪': '🐸', '鸭': '🦆',
        '燕': '🕊️', '鹅': '🦆', '蜗牛': '🐌', '蜘蛛': '🕷️',
        '学': '📚', '书': '📖', '写': '✏️', '画': '🎨',
        '读': '📖', '字': '🔤', '词': '📝', '诗': '📜',
        '唱': '🎵', '跳': '💃', '笑': '😊', '哭': '😢',
        '家': '🏠', '学校': '🏫', '路': '🛤️', '桥': '🌉',
        '车': '🚗', '船': '⛵', '飞机': '✈️', '火车': '🚂',
        '红': '🔴', '绿': '🟢', '蓝': '🔵', '黄': '🟡',
        '大': '🔴', '小': '🔵', '高': '⬆️', '矮': '⬇️',
        '数字': '🔢', '一': '1️⃣', '二': '2️⃣', '三': '3️⃣',
        '四': '4️⃣', '五': '5️⃣', '六': '6️⃣', '七': '7️⃣',
        '八': '8️⃣', '九': '9️⃣', '十': '🔟',
        '古诗': '📜', '故事': '📚', '童话': '🧚',
        '春天': '🌸', '夏天': '☀️', '秋天': '🍂', '冬天': '❄️',
        '梅': '🌸', '兰': '🌺', '竹': '🎋', '菊': '🌼',
        '松': '🌲', '柏': '🌲', '荷': '🪷', '莲': '🪷',
        '桃': '🍑', '李': '🍃', '梨': '🍐', '橘': '🍊',
        '苹果': '🍎', '香蕉': '🍌', '西瓜': '🍉',
        '长城': '🏯', '天安门': '🏛️', '北京': '🏛️',
        '故乡': '🏠', '家乡': '🏠', '妈妈': '👩', '爸爸': '👨',
        '爷爷': '👴', '奶奶': '👵', '老师': '👩‍🏫',
        '朋友': '👫', '小朋友': '👧', '孩子': '👶',
        '眼睛': '👁️', '耳朵': '👂', '鼻子': '👃', '嘴': '👄',
        '手': '✋', '脚': '🦶', '头': '👤', '心': '❤️',
        '爱': '❤️', '想': '💭', '看': '👀', '听': '👂',
        '说': '💬', '走': '🚶', '跑': '🏃', '飞': '🕊️',
        '游': '🏊', '泳': '🏊', '滑': '⛷️', '爬': '🧗',
        '灯': '💡', '灯笼': '🏮', '蜡烛': '🕯️', '火': '🔥',
        '电': '⚡', '雷': '⚡', '闪电': '⚡',
        '彩虹': '🌈', '星星': '⭐', '月亮': '🌙',
        '地球': '🌍', '世界': '🌎', '宇宙': '🌌',
        '音乐': '🎵', '歌': '🎤', '舞': '💃', '戏': '🎭',
        '球': '⚽', '篮球': '🏀', '足球': '⚽', '乒乓': '🏓',
        '游戏': '🎮', '玩具': '🧸', '礼物': '🎁',
        '生日': '🎂', '节日': '🎉', '春节': '🧧',
        '梦': '💤', '睡': '😴', '醒': '😃', '起': '⬆️',
        '坐': '🪑', '站': '🧍', '躺': '🛌',
        '吃': '🍽️', '喝': '🥤', '饭': '🍚', '菜': '🥬',
        '果': '🍎', '肉': '🥩', '蛋': '🥚', '奶': '🥛',
        '糖': '🍭', '蜜': '🍯', '盐': '🧂',
        '衣': '👕', '裤': '👖', '鞋': '👟', '帽': '👒',
        '伞': '☂️', '包': '🎒', '眼镜': '👓',
        '钟': '🕐', '表': '⌚', '闹钟': '⏰',
        '门': '🚪', '窗': '🪟', '墙': '🧱', '屋': '🏠',
        '床': '🛏️', '桌': '🪑', '椅': '🪑',
        '笔': '✏️', '纸': '📄', '本': '📓', '包': '🎒',
        '尺': '📏', '橡皮': '🧽', '剪刀': '✂️',
        '钱': '💰', '币': '🪙', '元': '💴',
        '买': '🛒', '卖': '🏪', '市场': '🏪',
        '医生': '👨‍⚕️', '护士': '👩‍⚕️', '病': '🤒',
        '药': '💊', '医院': '🏥',
        '警察': '👮', '消防': '🚒', '救护': '🚑',
        '工人': '👷', '农民': '👨‍🌾', '司机': '👨‍✈️',
        '邮递员': '📬', '厨师': '👨‍🍳',
        '科学': '🔬', '实验': '🧪', '发明': '💡',
        '电脑': '💻', '手机': '📱', '电视': '📺',
        '收音机': '📻', '相机': '📷'
    }
    
    # 检查标题中是否包含关键词，按长度排序以优先匹配长词
    keywords = sorted(emoji_map.keys(), key=len, reverse=True)
    for keyword in keywords:
        if keyword in title:
            return emoji_map[keyword]
    
    # 默认 emoji
    return '📖'

def load_json_file(filepath: str) -> Any:
    """Load and parse JSON file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"Error: File {filepath} not found")
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON in {filepath}: {e}")
        sys.exit(1)

def save_json_file(data: Any, filepath: str) -> None:
    """Save data to JSON file"""
    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"Successfully saved to {filepath}")
    except Exception as e:
        print(f"Error saving to {filepath}: {e}")
        sys.exit(1)

def main():
    # File paths
    articles_json_path = '/Users/zhiqli/github/chinese_reading_helper/all_articles_data.json'
    backup_path = '/Users/zhiqli/github/chinese_reading_helper/all_articles_data_backup_emoji.json'
    
    print("Loading articles data...")
    
    # Load data
    articles_data = load_json_file(articles_json_path)
    
    print(f"Loaded {len(articles_data)} articles from all_articles_data.json")
    
    # Create backup
    print("Creating backup...")
    save_json_file(articles_data, backup_path)
    
    # Add emoji to each article
    print("Generating emojis for articles...")
    emoji_stats = {}
    
    for i, article in enumerate(articles_data):
        title = article.get('title', '')
        emoji = generate_emoji(title)
        article['emoji'] = emoji
        
        # 统计 emoji 使用情况
        if emoji not in emoji_stats:
            emoji_stats[emoji] = 0
        emoji_stats[emoji] += 1
        
        if i < 10:  # 显示前10个例子
            print(f"  {title} -> {emoji}")
    
    print(f"\nEmoji distribution:")
    for emoji, count in sorted(emoji_stats.items(), key=lambda x: x[1], reverse=True):
        print(f"  {emoji}: {count} articles")
    
    # Save updated data
    print(f"\nSaving updated data...")
    save_json_file(articles_data, articles_json_path)
    
    print(f"\nEmoji generation completed successfully!")
    print(f"Updated {len(articles_data)} articles with emoji icons")

if __name__ == '__main__':
    main()