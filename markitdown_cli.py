#!/usr/bin/env python3
import sys
import html
import re
import json

# 尝试导入markitdown，如果失败则使用fallback
MARKITDOWN_AVAILABLE = False
markitdown = None

try:
    import markitdown
    MARKITDOWN_AVAILABLE = True
    print("markitdown imported successfully", file=sys.stderr)
except ImportError as e:
    print(f"markitdown import failed: {e}, using fallback", file=sys.stderr)
except Exception as e:
    print(f"markitdown error: {e}, using fallback", file=sys.stderr)

def main():
    if len(sys.argv) < 2:
        print("Usage: markitdown_cli.py <input_file>", file=sys.stderr)
        sys.exit(1)
    input_file = sys.argv[1]
    with open(input_file, "r", encoding="utf-8") as f:
        content = f.read()
    
    # 首先尝试使用markitdown
    if MARKITDOWN_AVAILABLE and markitdown:
        try:
            print("Attempting to use markitdown...", file=sys.stderr)
            result = None
            
            # 检查markitdown的可用方法
            available_methods = [attr for attr in dir(markitdown) if not attr.startswith('_')]
            print(f"Available markitdown methods: {available_methods}", file=sys.stderr)
            
            # 方式1: 直接调用 convert 函数
            if hasattr(markitdown, 'convert'):
                print("Using markitdown.convert()", file=sys.stderr)
                result = markitdown.convert(content)
            # 方式2: 使用 MarkItDown 类
            elif hasattr(markitdown, 'MarkItDown'):
                print("Using markitdown.MarkItDown()", file=sys.stderr)
                md_converter = markitdown.MarkItDown()
                result = md_converter.convert(content)
            # 方式3: 使用 markdownify 函数
            elif hasattr(markitdown, 'markdownify'):
                print("Using markitdown.markdownify()", file=sys.stderr)
                result = markitdown.markdownify(content)
            # 方式4: 尝试直接调用模块
            elif callable(markitdown):
                print("Using markitdown as callable", file=sys.stderr)
                result = markitdown(content)
            else:
                print("No suitable markitdown method found", file=sys.stderr)
                result = None
            
            # 处理结果
            if result:
                print("markitdown processing successful", file=sys.stderr)
                if hasattr(result, 'text_content'):
                    print(result.text_content)
                elif hasattr(result, 'markdown'):
                    print(result.markdown)
                elif isinstance(result, str):
                    print(result)
                else:
                    print(str(result))
                return
            else:
                print("markitdown returned no result", file=sys.stderr)
                
        except Exception as e:
            print(f"markitdown processing failed: {e}", file=sys.stderr)
    
    # 如果markitdown不可用或失败，使用fallback
    print("Using fallback HTML to text conversion", file=sys.stderr)
    result = simple_html_to_text(content)
    print(result)

def simple_html_to_text(html_content):
    """改进的HTML到文本转换fallback"""
    if not html_content:
        return ""
    
    # 移除脚本、样式和noscript
    html_content = re.sub(r'<script[^>]*>.*?</script>', '', html_content, flags=re.DOTALL | re.IGNORECASE)
    html_content = re.sub(r'<style[^>]*>.*?</style>', '', html_content, flags=re.DOTALL | re.IGNORECASE)
    html_content = re.sub(r'<noscript[^>]*>.*?</noscript>', '', html_content, flags=re.DOTALL | re.IGNORECASE)
    
    # 处理特殊标签，保留一些结构
    html_content = re.sub(r'<h([1-6])[^>]*>', r'\n# \1 ', html_content, flags=re.IGNORECASE)
    html_content = re.sub(r'</h[1-6]>', '\n\n', html_content, flags=re.IGNORECASE)
    html_content = re.sub(r'<p[^>]*>', '\n', html_content, flags=re.IGNORECASE)
    html_content = re.sub(r'</p>', '\n\n', html_content, flags=re.IGNORECASE)
    html_content = re.sub(r'<br[^>]*>', '\n', html_content, flags=re.IGNORECASE)
    html_content = re.sub(r'<div[^>]*>', '\n', html_content, flags=re.IGNORECASE)
    html_content = re.sub(r'</div>', '\n', html_content, flags=re.IGNORECASE)
    
    # 转换HTML实体
    text = html.unescape(html_content)
    
    # 移除剩余的HTML标签
    text = re.sub(r'<[^>]+>', '', text)
    
    # 清理空白字符
    text = re.sub(r'\n\s*\n\s*\n', '\n\n', text)  # 多个空行合并为两个
    text = re.sub(r'[ \t]+', ' ', text)  # 多个空格合并为一个
    text = re.sub(r'\n ', '\n', text)  # 移除行首空格
    text = text.strip()
    
    return text

if __name__ == "__main__":
    main()