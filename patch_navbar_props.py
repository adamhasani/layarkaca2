import re

with open('src/components/Navbar.tsx', 'r') as f:
    content = f.read()

content = content.replace("import { mockNotifications } from '../data';", "import { Notification } from '../types';")

prop_pattern = r'interface NavbarProps \{.*?\}'
replacement_prop = """interface NavbarProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isSearching?: boolean;
  isAiSearch?: boolean;
  setIsAiSearch?: (val: boolean) => void;
  onSelectCategory?: (category: string | null) => void;
  selectedCategory?: string | null;
  notifications?: Notification[];
}"""
content = re.sub(prop_pattern, replacement_prop, content, flags=re.DOTALL)

comp_pattern = r'export function Navbar\(\{([^}]+)\}: NavbarProps\) \{'
def replacer(match):
    args = match.group(1)
    if 'notifications' not in args:
        return 'export function Navbar({' + args + ',\n  notifications = []\n}: NavbarProps) {'
    return match.group(0)

content = re.sub(comp_pattern, replacer, content)

unread_pattern = r'const unreadCount = mockNotifications.filter\(n => n.unread\).length;'
content = re.sub(unread_pattern, 'const unreadCount = notifications.filter(n => n.unread).length;', content)

map_pattern = r'mockNotifications\.map\('
content = re.sub(map_pattern, 'notifications.map(', content)

with open('src/components/Navbar.tsx', 'w') as f:
    f.write(content)

print("Patched Navbar Props")
