import os
import re

def fix_tsx_files(directory):
    pattern = re.compile(r'export default function (.*?)\(')
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.tsx'):
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Replace spaces in function names
                def repl(match):
                    func_name = match.group(1).replace(' ', '')
                    return f'export default function {func_name}('
                
                new_content = pattern.sub(repl, content)
                
                if new_content != content:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Fixed: {filepath}")

if __name__ == '__main__':
    fix_tsx_files('frontend/app')
