---
title: Latent Demand Product Discovery
status: best-practice
authors: ["Nikola Balic (@nibzard)"]
based_on: ["Boris Cherny (Anthropic)", "Meta Product Teams"]
category: "UX & Collaboration"
source: "https://every.to/podcast/transcript-how-to-use-claude-code-like-the-people-who-built-it"
tags: [product-discovery, extensibility, hackable-products, power-users, latent-demand]
---

## Problem

When building agent products, it's difficult to know which features will have real product-market fit before investing significant engineering effort. Traditional feature development relies on user interviews and surveys, which may not reveal how users would actually adapt tools to their needs.

## Solution

Build products that are intentionally **hackable and extensible**, then observe how power users "abuse" or repurpose features for unintended use cases. This reveals latent demand—real user needs demonstrated through behavior rather than stated preferences. Once you identify these patterns, productize them for all users.

**Key principles:**

1. **Make extension points**: Provide hooks, plugins, slash commands, configuration files that users can customize
2. **Monitor creative usage**: Watch for patterns where users hack features for purposes beyond original intent
3. **Quantify the signal**: Measure how many users are doing the "unintended" behavior
4. **Productize validated demand**: Build proper features for behaviors that show strong adoption

## How to use it

**Implementation strategy:**

- Design core functionality with clear extension APIs
- Make configuration and customization easy for power users
- Monitor analytics and user feedback for unexpected usage patterns
- Look for behaviors that multiple independent users discover
- Prioritize building features for high-frequency "hacks"

**Concrete examples from the transcript:**

1. **Facebook Dating**: Analytics showed 60% of profile views were between opposite-gender non-friends → clear dating behavior → launched Facebook Dating
2. **Facebook Marketplace**: 40% of Facebook group posts were buy-sell transactions → users treating groups as marketplaces → launched dedicated Marketplace product
3. **Claude Code hooks on Slack**: Users requested Slack notifications when Claude asks for permissions → built hooks system → users implemented it themselves

## Trade-offs

**Pros:**

- Validates real demand through behavior, not speculation
- Reduces risk of building unwanted features
- Empowers power users to innovate on your behalf
- Creates tight feedback loop between usage and development
- Features come with built-in proof of concept

**Cons:**

- Requires building extensibility infrastructure upfront
- May delay shipping "obvious" features while waiting for signal
- Power user behavior may not represent mainstream needs
- Requires analytics and monitoring systems to detect patterns
- Can lead to feature bloat if every hack becomes a product

## References

* Boris Cherny (Anthropic): "There's this really old idea in product called latent demand... you build a product in a way that is hackable, that is kind of open-ended enough that people can abuse it for other use cases. Then you see how people abuse it and then you build for that."
* [AI & I Podcast: How to Use Claude Code Like the People Who Built It](https://every.to/podcast/transcript-how-to-use-claude-code-like-the-people-who-built-it)
