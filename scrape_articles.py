import requests
from bs4 import BeautifulSoup
import json
import re

def get_main_page():
    """获取主页面内容"""
    url = "https://edu.cnr.cn/eduzt/ywkwsfsd/"
    try:
        response = requests.get(url, timeout=10)
        response.encoding = 'gb2312'
        return response.text
    except Exception as e:
        print(f"获取主页面失败: {e}")
        return None

def parse_articles(html):
    """解析主页面中的文章信息"""
    soup = BeautifulSoup(html, 'html.parser')
    articles = []
    
    # 查找所有包含文章信息的容器
    containers = soup.find_all('div', class_='container')
    
    for container in containers:
        try:
            # 获取文章链接
            link_tag = container.find('a')
            if not link_tag or 'href' not in link_tag.attrs:
                continue
                
            href = link_tag['href']
            if not href.startswith('http'):
                href = 'https:' + href if href.startswith('//') else 'https://www.cnr.cn' + href
            
            # 获取课程编号
            book_span = container.find('div', class_='book').find('span')
            lesson_number = book_span.get_text(strip=True) if book_span else ""
            
            # 获取标题和朗读者
            book_intro = container.find('div', class_='bookIntro')
            if book_intro:
                title_p = book_intro.find('p', class_='f18')
                reader_p = book_intro.find('p', class_='f16')
                
                title = title_p.get_text(strip=True) if title_p else ""
                reader = reader_p.get_text(strip=True) if reader_p else ""
                
                # 清理读者信息
                if "朗   读    者：" in reader:
                    reader = reader.replace("朗   读    者：", "")
            
            articles.append({
                'detail_url': href,
                'lesson_number': lesson_number,
                'title': title,
                'reader': reader
            })
            
        except Exception as e:
            print(f"解析文章信息时出错: {e}")
            continue
    
    return articles

def get_article_detail(url):
    """获取文章详情页内容，包含重试机制"""
    max_retries = 3
    retry_delay = 2  # 秒
    
    for attempt in range(max_retries):
        try:
            response = requests.get(url, timeout=10)
            
            # 检查是否为502错误
            if response.status_code == 502:
                print(f"502错误 (尝试 {attempt + 1}/{max_retries}): {url}")
                if attempt < max_retries - 1:
                    import time
                    time.sleep(retry_delay * (attempt + 1))  # 指数退避
                    continue
                else:
                    return None
            
            response.encoding = 'gb2312'
            return response.text
            
        except requests.exceptions.RequestException as e:
            print(f"网络错误 (尝试 {attempt + 1}/{max_retries}) {url}: {e}")
            if attempt < max_retries - 1:
                import time
                time.sleep(retry_delay * (attempt + 1))
                continue
            else:
                return None
        except Exception as e:
            print(f"其他错误 {url}: {e}")
            return None
    
    return None

def parse_article_detail(html, base_info):
    """解析文章详情页内容"""
    soup = BeautifulSoup(html, 'html.parser')
    
    # 获取文章标题
    title_tag = soup.find('h1')
    content_title = title_tag.get_text(strip=True) if title_tag else base_info['title']
    
    # 获取作者信息 - 从meta标签获取
    author = ""
    author_meta = soup.find('meta', {'name': 'author'})
    if author_meta and 'content' in author_meta.attrs:
        author = author_meta['content'].strip()
    
    # 获取朗读者信息
    reader = ""
    source_div = soup.find('div', class_='source')
    if source_div:
        source_text = source_div.get_text(strip=True)
        if "朗读者:" in source_text:
            reader = source_text.replace("朗读者:", "").strip()
    
    # 获取音频URL
    audio_url = ""
    audio_div = soup.find('div', class_='HiRadioPlayer')
    if audio_div and 'data-url' in audio_div.attrs:
        audio_url = audio_div['data-url']
        if audio_url and not audio_url.startswith('http'):
            audio_url = 'https:' + audio_url if audio_url.startswith('//') else audio_url
    
    # 获取文章内容
    content = ""
    content_div = soup.find('div', class_='article-content')
    if content_div:
        # 找到<!--content-->注释后的内容
        comments = content_div.find_all(string=lambda text: isinstance(text, str) and 'content' in text)
        if comments:
            # 获取注释后的所有段落
            paragraphs = content_div.find_all('p')
            content = '\n'.join([p.get_text(strip=True) for p in paragraphs if p.get_text(strip=True)])
    
    # 如果没有找到内容，尝试其他方式
    if not content:
        main_div = soup.find('div', class_='article-main')
        if main_div:
            paragraphs = main_div.find_all('p')
            content = '\n'.join([p.get_text(strip=True) for p in paragraphs if p.get_text(strip=True)])
    
    result = {
        'lesson_number': base_info['lesson_number'],
        'title': content_title,
        'author': author,  # 可能为空
        'reader': reader,  # 从详情页获取朗读者
        'content': content,
        'audio_url': audio_url,
        'detail_url': base_info['detail_url']
    }
    
    return result

def main():
    print("开始抓取文章数据...")
    
    # 获取主页面
    main_html = get_main_page()
    if not main_html:
        print("无法获取主页面")
        return
    
    # 解析文章列表
    articles = parse_articles(main_html)
    print(f"找到 {len(articles)} 篇文章")
    
    # 尝试加载现有数据以继续处理
    all_articles_data = []
    start_index = 0
    try:
        with open('all_articles_data.json', 'r', encoding='utf-8') as f:
            existing_data = json.load(f)
            if existing_data:
                all_articles_data = existing_data
                start_index = len(existing_data)
                print(f"发现已有 {start_index} 篇文章数据，从第 {start_index + 1} 篇继续处理")
    except (FileNotFoundError, json.JSONDecodeError):
        print("未发现现有数据，从头开始处理")
        all_articles_data = []
        start_index = 0
    
    # 处理所有文章
    total_articles = len(articles)
    for i, article in enumerate(articles[start_index:], start=start_index):
        print(f"\n[{i+1}/{total_articles}] 处理文章: {article['title']}")
        
        try:
            # 获取详情页
            detail_html = get_article_detail(article['detail_url'])
            if detail_html:
                # 解析详情页
                article_data = parse_article_detail(detail_html, article)
                all_articles_data.append(article_data)
                print(f"✓ 成功获取: {article_data['title']}")
            else:
                # 保存502错误的文章信息用于人工校对
                failed_article = {
                    'lesson_number': article['lesson_number'],
                    'title': article['title'],
                    'author': "",
                    'reader': article.get('reader', ""),
                    'content': "",
                    'audio_url': "",
                    'detail_url': article['detail_url'],
                    'error': "502 Bad Gateway"
                }
                all_articles_data.append(failed_article)
                print(f"✗ 502错误文章已保存: {article['title']}")
        except Exception as e:
            print(f"✗ 处理文章时出错: {article['title']}, 错误: {e}")
        
        # 每处理5篇文章保存一次进度
        if (i + 1) % 5 == 0:
            print(f"💾 保存进度 ({i+1}/{total_articles})...")
            with open('all_articles_data.json', 'w', encoding='utf-8') as f:
                json.dump(all_articles_data, f, ensure_ascii=False, indent=2)
        
        # 添加短暂延迟，避免请求过于频繁
        import time
        time.sleep(0.5)  # 减少延迟以加快速度
    
    # 保存所有数据到文件
    if all_articles_data:
        with open('all_articles_data.json', 'w', encoding='utf-8') as f:
            json.dump(all_articles_data, f, ensure_ascii=False, indent=2)
        print(f"\n✅ 成功抓取 {len(all_articles_data)} 篇文章，数据已保存到 all_articles_data.json")
        
        # 显示统计信息
        print(f"\n📊 统计信息:")
        print(f"- 总文章数: {len(all_articles_data)}")
        print(f"- 有作者信息的文章: {len([a for a in all_articles_data if a['author']])}")
        print(f"- 有音频链接的文章: {len([a for a in all_articles_data if a['audio_url']])}")
        
        # 显示前几篇文章的标题作为预览
        print(f"\n📋 前5篇文章预览:")
        for i, article in enumerate(all_articles_data[:5]):
            print(f"  {i+1}. {article['title']} (第{article['lesson_number']}课)")
    else:
        print("❌ 没有成功抓取任何文章数据")

if __name__ == "__main__":
    main()