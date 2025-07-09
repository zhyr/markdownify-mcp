#!/usr/bin/env python3
import sys
try:
    import markitdown
except ImportError:
    print("markitdown not installed", file=sys.stderr)
    sys.exit(1)

def main():
    if len(sys.argv) < 2:
        print("Usage: markitdown_cli.py <input_file>", file=sys.stderr)
        sys.exit(1)
    input_file = sys.argv[1]
    with open(input_file, "r", encoding="utf-8") as f:
        content = f.read()
    # 假设 markitdown 0.0.1a1 有一个 main API
    md = markitdown.markdownify(content)
    print(md)

if __name__ == "__main__":
    main()