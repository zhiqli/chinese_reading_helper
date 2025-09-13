#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script to merge grade and semester information from list.json into all_articles_data.json
"""

import json
import sys
from typing import Dict, List, Any

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

def create_lookup_dict(list_data: List[Dict]) -> Dict[str, Dict[str, str]]:
    """Create lookup dictionary from list.json data"""
    lookup = {}
    
    for item in list_data:
        lesson_number = item.get('课文序号', '')
        title = item.get('课文标题', '')
        grade = item.get('年级', '')
        semester = item.get('学期', '')
        
        # Create multiple lookup keys for better matching
        keys = []
        
        # Key by lesson number
        if lesson_number:
            keys.append(lesson_number)
        
        # Key by title
        if title:
            keys.append(title)
        
        # Key by lesson number + title
        if lesson_number and title:
            keys.append(f"{lesson_number}|{title}")
        
        # Store grade and semester info for all keys
        grade_semester_info = {
            'grade': grade,
            'semester': semester
        }
        
        for key in keys:
            if key and key not in lookup:  # Only store if not already exists (first wins)
                lookup[key] = grade_semester_info
    
    return lookup

def find_match(article: Dict[str, str], lookup: Dict[str, Dict[str, str]]) -> Dict[str, str]:
    """Find matching grade and semester for an article"""
    lesson_number = article.get('lesson_number', '')
    title = article.get('title', '')
    
    # Try different matching strategies
    search_keys = []
    
    # Exact lesson number match
    if lesson_number:
        search_keys.append(lesson_number)
    
    # Exact title match
    if title:
        search_keys.append(title)
    
    # Combined lesson number + title
    if lesson_number and title:
        search_keys.append(f"{lesson_number}|{title}")
    
    # Try to find match
    for key in search_keys:
        if key in lookup:
            return lookup[key]
    
    # Try partial title matching (for cases where titles might have slight differences)
    if title:
        for lookup_key, info in lookup.items():
            if title in lookup_key or lookup_key in title:
                return info
    
    return {'grade': '', 'semester': ''}

def merge_data(articles: List[Dict], list_data: List[Dict]) -> List[Dict]:
    """Merge grade and semester information into articles"""
    print(f"Processing {len(articles)} articles with {len(list_data)} reference entries...")
    
    # Create lookup dictionary
    lookup = create_lookup_dict(list_data)
    print(f"Created lookup dictionary with {len(lookup)} entries")
    
    # Track statistics
    matched_count = 0
    unmatched_count = 0
    unmatched_articles = []
    
    # Process each article
    for i, article in enumerate(articles):
        match_info = find_match(article, lookup)
        
        # Add grade and semester to article
        article['grade'] = match_info['grade']
        article['semester'] = match_info['semester']
        
        # Track statistics
        if match_info['grade'] and match_info['semester']:
            matched_count += 1
        else:
            unmatched_count += 1
            unmatched_articles.append({
                'index': i,
                'lesson_number': article.get('lesson_number', ''),
                'title': article.get('title', '')
            })
    
    # Print statistics
    print(f"\nResults:")
    print(f"Matched articles: {matched_count}")
    print(f"Unmatched articles: {unmatched_count}")
    
    if unmatched_articles:
        print(f"\nFirst 10 unmatched articles:")
        for article in unmatched_articles[:10]:
            print(f"  - {article['lesson_number']}: {article['title']}")
        if len(unmatched_articles) > 10:
            print(f"  ... and {len(unmatched_articles) - 10} more")
    
    return articles

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
    list_json_path = '/Users/zhiqli/github/chinese_reading_helper/list.json'
    articles_json_path = '/Users/zhiqli/github/chinese_reading_helper/all_articles_data.json'
    backup_path = '/Users/zhiqli/github/chinese_reading_helper/all_articles_data_backup.json'
    
    print("Loading JSON files...")
    
    # Load data
    list_data = load_json_file(list_json_path)
    articles_data = load_json_file(articles_json_path)
    
    print(f"Loaded {len(list_data)} entries from list.json")
    print(f"Loaded {len(articles_data)} articles from all_articles_data.json")
    
    # Create backup
    print("\nCreating backup...")
    save_json_file(articles_data, backup_path)
    
    # Merge data
    print("\nMerging data...")
    merged_data = merge_data(articles_data, list_data)
    
    # Save merged data
    print("\nSaving merged data...")
    save_json_file(merged_data, articles_json_path)
    
    print("\nMerge completed successfully!")

if __name__ == '__main__':
    main()