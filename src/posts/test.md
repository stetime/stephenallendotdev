---
title: "test title"
pubDate: "2026-01-17"
excerpt: "test excerpt"
---

# Test

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Here's some Javascript:

```js
const posts = defineCollection({
  loader: glob({ pattern: "**/[^_]*.md", base: "./src/posts" }),
  schema: z.object({
    title: z.string(),
    pubDate: z.string(),
    excerpt: z.string(),
  }),
})
```

and a bit of python into the bargain:

```python
def get_processes():
    processes = []
    for proc in psutil.process_iter(['pid', 'name', 'exe']):
        try:
            exe = proc.info['exe']
            if exe and os.path.exists(exe):
                processes.append(exe)
        except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
            continue
    return list(set(processes))
```

lets get excited!

- wow
- whoa
- incredible!
