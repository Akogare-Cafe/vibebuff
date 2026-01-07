#!/bin/bash

cd /Users/kavyrattana/Coding/vibebuff

python3 scripts/scraper/venv/bin/python -c "
import json
import subprocess
import re
import time

def slugify(name):
    slug = name.lower()
    slug = re.sub(r'[^a-z0-9\s-]', '', slug)
    slug = re.sub(r'[\s_]+', '-', slug)
    slug = re.sub(r'-+', '-', slug)
    slug = slug.strip('-')
    return slug

def determine_category(tool):
    name = tool.get('name', '').lower()
    url = tool.get('url', '').lower()
    
    if any(x in name or x in url for x in ['postgres', 'mysql', 'sqlite', 'mongo', 'redis', 'supabase', 'neon', 'planetscale', 'database', 'db']):
        return 'database'
    if any(x in name or x in url for x in ['github', 'gitlab', 'git', 'bitbucket']):
        return 'version_control'
    if any(x in name or x in url for x in ['slack', 'discord', 'telegram', 'whatsapp', 'email', 'gmail', 'teams']):
        return 'communication'
    if any(x in name or x in url for x in ['notion', 'linear', 'jira', 'asana', 'todoist', 'trello', 'clickup']):
        return 'productivity'
    if any(x in name or x in url for x in ['vercel', 'netlify', 'railway', 'render', 'fly', 'aws', 'azure', 'gcp', 'cloudflare']):
        return 'deployment'
    if any(x in name or x in url for x in ['stripe', 'twilio', 'sendgrid', 'mailchimp']):
        return 'api'
    if any(x in name or x in url for x in ['sentry', 'datadog', 'axiom', 'analytics']):
        return 'analytics'
    if any(x in name or x in url for x in ['filesystem', 'file', 'drive', 'dropbox', 'storage']):
        return 'file_system'
    if any(x in name or x in url for x in ['browser', 'puppeteer', 'playwright', 'selenium']):
        return 'devtools'
    if any(x in name or x in url for x in ['openai', 'anthropic', 'llm', 'langchain', 'ollama']):
        return 'ai'
    if any(x in name or x in url for x in ['docs', 'documentation', 'context7']):
        return 'documentation'
    if any(x in name or x in url for x in ['test', 'jest', 'pytest']):
        return 'testing'
    if any(x in name or x in url for x in ['auth', 'security', 'vault']):
        return 'security'
    
    return 'other'

data = json.load(open('scripts/scraper/data/vibe_tools.json'))
known_tools = data.get('known_tools', [])
mcp_tools = [t for t in known_tools if t.get('category') == 'mcp']

print(f'Syncing {len(mcp_tools)} MCP servers to Convex...')
print()

success = 0
errors = 0

for i, tool in enumerate(mcp_tools):
    name = tool.get('name', '')
    url = tool.get('url', '')
    
    if not name or not url:
        continue
    
    metadata = tool.get('metadata', {})
    description = ''
    if metadata:
        description = metadata.get('description') or metadata.get('og_title') or ''
    if not description:
        description = f'{name} - MCP server for AI assistants'
    
    description = description[:500].replace('\"', '\\\\\"').replace('\n', ' ')
    short_desc = description[:97] + '...' if len(description) > 100 else description
    
    github_url = None
    if 'github.com' in url:
        github_url = url
    elif metadata and metadata.get('github_url'):
        github_url = metadata['github_url']
    
    category = determine_category(tool)
    
    tags = ['mcp', 'ai', 'automation']
    if category != 'other':
        tags.append(category.replace('_', '-'))
    
    is_official = 'modelcontextprotocol' in url.lower()
    
    args = {
        'name': name,
        'slug': slugify(name),
        'description': description,
        'shortDescription': short_desc,
        'websiteUrl': url if 'github.com' not in url else None,
        'githubUrl': github_url,
        'category': category,
        'transportTypes': ['stdio'],
        'tags': tags,
        'isOfficial': is_official,
        'isVerified': False,
        'isFeatured': False,
    }
    
    args_json = json.dumps(args)
    
    print(f'[{i+1}/{len(mcp_tools)}] {name}...')
    
    try:
        result = subprocess.run(
            ['npx', 'convex', 'run', 'mcpServers:upsertMcpServer', args_json],
            capture_output=True,
            text=True,
            timeout=30
        )
        
        if result.returncode == 0:
            success += 1
            print(f'  -> OK')
        else:
            errors += 1
            print(f'  -> ERROR: {result.stderr[:100]}')
    except Exception as e:
        errors += 1
        print(f'  -> ERROR: {str(e)[:100]}')
    
    time.sleep(0.2)

print()
print('=' * 50)
print(f'SYNC COMPLETE')
print(f'Success: {success}')
print(f'Errors: {errors}')
"
