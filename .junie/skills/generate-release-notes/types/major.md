# Template: Major/Breaking Release

Use this template for releases with breaking changes (Node.js version, major challenge overhauls, major UI redesigns).

```markdown
> This release brings significant changes to existing challenges (⚡) which might break canned CTF setups as well as solution guides made for previous versions of OWASP Juice Shop! It also contains technical breaking changes or renamings (⚠️) which might require migrating to a newer Node.js version or updating existing customization files.

## 👟 Runtime
* Removed support for Node.js <old_version>.x (⚠️)
* Added support for Node.js <new_version>.x

## 🅰️ Frontend
* Updated frontend to Angular <version>.x and Angular Material <version>.x (kudos to @<contributor>)

## 🎯 Challenges
* Added new <name> ⭐⭐⭐⭐⭐-challenge (kudos to @<contributor>)
* Significant overhaul of <category> challenges (⚡)

## 🎨 User Interface
* Redesigned <screen_name> for better accessibility and modern look

## 🛒 Shop
* Added <count> new products
* Added <count> new customer user(s)

## 🧹 Technical Debt Reduction
* Migrated <feature> to <new_tech>

## 🐛 Bugfixes
* #<pr_number>: Fixed <description> (kudos to @<username>)
```
