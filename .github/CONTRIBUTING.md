# Contributing

Thanks for taking the time 🎉<br />
New entries, corrections and site fixes are all welcome. By joining in, you agree to our [Code of Conduct](./CODE_OF_CONDUCT.md).

---

## Ways to contribute

- ✏️ **Fix an entry** - open a [correction](https://github.com/NotAFlightRisk/enshittification/issues/new?template=correction.yml), or send a pull request
- 💩 **Suggest a change to add** - open a [suggestion](https://github.com/NotAFlightRisk/enshittification/issues/new?template=suggestion.yml) with a source
- 🐛 **Report a bug in the site** - open a [bug report](https://github.com/NotAFlightRisk/enshittification/issues/new?template=bug_report.yml)
- 🔒 **Report a vulnerability** - please _don't_ open a public issue, see [SECURITY.md](./SECURITY.md)

---

## Adding or fixing an entry

Every service is one YAML file in [`data/services/`](../data/services), and every company is in [`data/companies.yaml`](../data/companies.yaml). Copy an entry that's like yours and change it. The fields are checked by `npm run validate`, which tells you what's missing and on which line.

A wrong fact is worse than a missing one, so:

1. **Find the primary source first.** The company's own post, help page or filing. Decent press only when there isn't one. Never a forum post on its own, a "best of" list or another tracker. `npm run cdx -- <url-prefix> <word>` searches the Wayback Machine's index for real URLs, so you never have to type one from memory.
2. **Write it from the page itself**, not from memory or a search summary. Digits for every number, and the date in the first sentence of `what_changed`.
3. **Copy a `quote`** from the page that backs the claim, word for word.
4. **Archive it.** Put the Wayback snapshot in `archive`. If there isn't one, set `archive: pending` on an extra source and the twice-daily job saves it. Every entry needs at least one real snapshot before it can go in.
5. **Run the checks** until both are clean:

```bash
npm run validate
npm run check:sources -- <service>
```

`check:sources` reads every source's snapshot and makes sure each quote is in it, and that every number in the entry turns up in one of its sources. It only proves the text is there, not that it's true, so someone still reads the source before anything merges.

Titles say what happened in plain words with no adjectives ("YouTube hides the public dislike count", not "YouTube kills dislikes"). Keep the jokes for the issues.

---

## Working on the site

```bash
git clone git@github.com:NotAFlightRisk/enshittification.git
cd enshittification
npm install
npm run dev
```

Then `npm run check` (types), `npm test` (tests) and `npm run format` before you push. There's a bit more in the [Development](./README.md#development) section of the README.

---

## Pull requests

1. **Open an issue first** for anything bigger than an entry or a fix. Saves you writing code we might not merge.
2. **Fork it**, and branch off `main`.
3. **Keep it focused.** One service, or one logical change, per PR.
4. **Fill in the template**, Category included, since that's what labels it.

Don't worry about getting it perfect first time, we're happy to help get it over the line.

---

### Commit messages

We use [Conventional Commits](https://www.conventionalcommits.org/), and the release notes are generated from them:

```
feat(data): add Netflix's 2026 price rise
fix(data): correct the date on YouTube's ad blocker crackdown
fix: keep strip labels on screen
```

Types are `feat`, `fix`, `docs`, `refactor`, `test`, `perf`, `build`, `ci` and `chore`. Breaking changes get a `!` (like `feat!:`).

---

## Licensing

By contributing, you agree that your code is licensed under the [MIT License](../LICENSE), and your data under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), like the rest of the project.
