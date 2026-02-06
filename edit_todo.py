import sys
import re
import os

todo_file = sys.argv[1]
print(f"Processing {todo_file}")

try:
    with open(todo_file, 'r', encoding='utf-8') as f:
        lines = f.readlines()
except UnicodeDecodeError:
    with open(todo_file, 'r', encoding='gbk') as f:
        lines = f.readlines()

new_lines = []
for line in lines:
    if not line.startswith('pick '):
        new_lines.append(line)
        continue
    
    # line format: pick <hash> <message>
    parts = line.strip().split(' ', 2)
    if len(parts) < 3:
        new_lines.append(line)
        continue
        
    sha = parts[1]
    msg = parts[2]
    
    # Logic to fix message
    prefix = None
    if msg.startswith('功能') or msg.startswith('feat'): prefix = 'feat'
    elif msg.startswith('配置') or msg.startswith('chore'): prefix = 'chore'
    elif msg.startswith('构建') or msg.startswith('build'): prefix = 'build'
    elif msg.startswith('修复') or msg.startswith('fix'): prefix = 'fix'
    elif msg.startswith('优化') or msg.startswith('refactor'): prefix = 'refactor'
    elif msg.startswith('清理'): prefix = 'chore'
    elif msg.startswith('新特性'): prefix = 'feat'
    elif msg.startswith('design'): prefix = 'style'
    
    if prefix:
        # Check if already has standard format (lowercase type:)
        if not re.match(r'^[a-z]+\(?.*\)?:\s', msg):
            # Remove old prefix text
            clean_msg = re.sub(r'^(功能|配置|构建|修复|优化|清理|新特性|design|feat|chore|build|fix|refactor|style)[:：]?\s*', '', msg)
            new_msg = f"{prefix}: {clean_msg}"
            
            new_lines.append(line) # Pick the commit
            
            # Escape quotes
            safe_msg = new_msg.replace('"', '\\"')
            # On Windows/PowerShell, escaping might be tricky, but python subprocess usually handles args.
            # Here we are writing a command to a shell script (the todo list is executed by git's shell).
            # Git Bash uses sh.
            new_lines.append(f'exec git commit --amend -m "{safe_msg}"\n')
            continue

    new_lines.append(line)

with open(todo_file, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
