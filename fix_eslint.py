import os
import re

def fix_eslint(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.tsx'):
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Check if it has <a>
                if '<a href="/"' in content or "<a href='/'" in content:
                    # Replace <a> with <Link>
                    content = content.replace('<a href="/">', '<Link href="/">')
                    content = content.replace('</a>', '</Link>')
                    
                    # Add import Link if not exists
                    if 'import Link' not in content:
                        content = 'import Link from "next/link";\n' + content
                        
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(content)
                    print(f"Fixed Link in: {filepath}")
                
                # Fix any in projects
                if 'any' in content and 'app\\projects' in filepath:
                    content = content.replace('project: any', 'project: Record<string, unknown>')
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(content)
                    print(f"Fixed any in: {filepath}")

if __name__ == '__main__':
    fix_eslint('frontend/app')
