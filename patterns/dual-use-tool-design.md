---
title: Dual-Use Tool Design
status: best-practice
authors: ["Boris Cherny (Anthropic)", "Claude Code Team"]
category: "Tool Use & Environment"
source: "https://every.to/podcast/transcript-how-to-use-claude-code-like-the-people-who-built-it"
tags: [tools, ux, slash-commands, hooks, human-ai-collaboration, consistency]
---

## Problem

Building separate tools for humans and AI agents creates:

- **Maintenance overhead**: Two implementations of similar functionality
- **Inconsistent behavior**: Human tools work differently than agent tools
- **Learning curve**: Users must learn one interface, agents another
- **Feature drift**: Human and agent capabilities diverge over time
- **Testing burden**: Must validate both interfaces separately

## Solution

Design all tools to be **dual-use**—equally accessible and useful to both humans and AI agents. When a human can invoke a tool manually, the agent should be able to call it programmatically, and vice versa.

**Core principle**: "Everything you can do, Claude can do. There's nothing in between."

**Key characteristics of dual-use tools:**

1. **Same interface**: Humans and agents use identical APIs/commands
2. **Shared logic**: One implementation serves both use cases
3. **Composable**: Tools can be chained by either humans or agents
4. **Observable**: Both see the same outputs (transparency)
5. **Documented once**: Single source of truth for behavior

```pseudo
# Dual-use slash command example
define_slash_command("/commit") {
    steps: [
        "run linters",
        "generate commit message from git diff",
        "create commit with standard format"
    ],
    callable_by: ["human", "agent"],
    pre_allowed_tools: ["git add", "git commit"],
    model: "haiku"  # same for both
}

# Human invocation
$ /commit

# Agent invocation
agent.call_slash_command("/commit")
```

## How to use it

**Design principles:**

1. **Start with human ergonomics**: If it makes sense to humans, it usually makes sense to agents
2. **Make everything scriptable**: What humans can click, agents should be able to call
3. **Shared state visibility**: Both see the same terminal output, file changes, etc.
4. **Consistent permissions**: Same security rules apply to both

**Claude Code implementation examples:**

- **Slash commands**: `/commit`, `/pr`, `/feature-dev` work manually and in agent flows
- **Hooks**: Humans can trigger hooks manually; agents trigger them automatically
- **Bash mode**: `!command` visible to both human and agent in same terminal
- **Permissions**: Pre-allowed tools work the same whether human or agent invokes them

**Benefits observed:**

> "It's sort of elegant design for humans that translates really well to the models." —Boris Cherny

## Trade-offs

**Pros:**

- **Reduced maintenance**: One tool implementation serves both audiences
- **Consistency**: Identical behavior whether human or agent invokes
- **Shared improvements**: Optimizations benefit both use cases
- **Easier testing**: Single test suite validates both paths
- **Better UX**: Humans can replicate agent workflows manually
- **Transparency**: Agents use the same observable tools humans understand

**Cons:**

- **Design constraints**: Must satisfy both human ergonomics AND API cleanliness
- **May compromise optimization**: Separate tools could be more specialized
- **Complexity in edge cases**: Some behaviors might need conditional logic
- **Documentation challenge**: Must explain dual usage clearly

## References

* Boris Cherny: "Tools were built for engineers, but now it's equal parts engineers and models... everything is dual use."
* Boris Cherny: "I have a slash command for slash commit... I run it manually, but also Claude can run this for me. And this is pretty useful because we get to share this logic."
* Cat Wu: "Claude Code has access to everything that an engineer does at the terminal. Making them dual use actually makes the tools a lot easier to understand. Everything you can do, Claude can do. There's nothing in between."
* [AI & I Podcast: How to Use Claude Code Like the People Who Built It](https://every.to/podcast/transcript-how-to-use-claude-code-like-the-people-who-built-it)
