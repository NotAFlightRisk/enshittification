<h1 align="center">The Enshittification Index</h1>
<p align="center">
<i>Every price rise, new ad format, paywall and API lockdown at the big services, dated and sourced</i>
<br />
<b>🌐 <a href="https://enshittification.peng.ly/">enshittification.peng.ly</a></b><br />
</p>

<details>
  <summary>Contents</summary>

- [About](#about)
- [Using the data](#using-the-data)
- [Adding an entry](#adding-an-entry)
- [Deployment](#deployment)
- [Development](#development)
- [Credits](#credits)

</details>

## About

When a service you use gets worse, the question you type has a date in it: "when did YouTube add unskippable ads", "Spotify price history". This answers it. There's a page per change that opens with the date, a timeline per service, a price history per paid plan with inflation alongside, and a [price league](https://enshittification.peng.ly/prices) of which subscriptions have gone up most since 2020.

Every entry is written from its sources, and every source has a quote and an archived copy in the Wayback Machine. A script checks each quote really is in its source, and that every number in an entry turns up in one of them, on every pull request and again every week.

It's not a score. The marks on the wall are what's been logged so far, not how bad anything got.

---

## Using the data

Everything is under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), so use it for whatever you like, just credit "The Enshittification Index" with a link back.

- [`/api/changes.json`](https://enshittification.peng.ly/api/changes.json) - every change with its sources, plans and prices
- [`/api/changes.csv`](https://enshittification.peng.ly/api/changes.csv) - one row per change
- [`/feed.xml`](https://enshittification.peng.ly/feed.xml) - new entries as an Atom feed
- [`data/`](../data) - the YAML it's all built from, one file per service

---

## Adding an entry

Each service is one YAML file in [`data/services/`](../data/services). Find the company's own post first, copy a quote from it, then run `npm run validate` and `npm run check:sources -- <service>` until both are happy. The [contributing guide](./CONTRIBUTING.md) has the full checklist.

Spotted something wrong? Every change page has a "Something wrong?" link, or open a [correction](https://github.com/NotAFlightRisk/enshittification/issues/new?template=correction.yml).

---

## Deployment

It's a static site, so it runs anywhere that serves files.

### Option 1: Cloudflare

The live site is a Cloudflare Worker serving the built files, deployed by [`deploy.yml`](./workflows/deploy.yml) on every push to `main`. In a fork, add `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` secrets and change the domain in that file.

### Option 2: Docker

There's a multi-arch image on DockerHub ([`notaflightrisk/enshittification`](https://hub.docker.com/r/notaflightrisk/enshittification)) and GHCR ([`ghcr.io/notaflightrisk/enshittification`](https://github.com/NotAFlightRisk/enshittification/pkgs/container/enshittification)). With Docker installed, just run:

```shell
docker run -p 8080:8080 notaflightrisk/enshittification
```

### Option 3: From a release

Each [release](https://github.com/NotAFlightRisk/enshittification/releases) has the built site as `site.zip`, which any static file server will serve:

```shell
unzip site.zip -d site && npx serve site
```

### Option 4: Build from source

Follow the [Development](#development) steps, then `npm run build`. The site lands in `build/`.

---

## Development

You'll need [Node](https://nodejs.org/) 22.18 or newer, plus [Git](https://git-scm.com/). It's a [SvelteKit](https://svelte.dev/docs/kit) site prerendered from the YAML, so there's nothing else to install.

```bash
git clone git@github.com:NotAFlightRisk/enshittification.git
cd enshittification
npm install
npm run dev
```

The dev server is then on [localhost:5173](http://localhost:5173).<br>
The other scripts you'll want:

| Script                               | What it does                                                             |
| ------------------------------------ | ------------------------------------------------------------------------ |
| `npm run validate`                   | Checks the YAML offline: fields, dates, price chains, archives, quotes   |
| `npm run check:sources -- <service>` | Reads every source's snapshot and checks the quotes and numbers          |
| `npm run cdx -- <url-prefix> <word>` | Finds real URLs in the Wayback Machine's index                           |
| `npm run archive`                    | Saves `pending` sources to the Wayback Machine and writes the links back |
| `npm run cpi`                        | Refreshes the US and UK inflation figures                                |
| `npm run check` / `npm test`         | Types and tests                                                          |

Or build the container with `docker build -t enshittification .`

---

## Credits

"Enshittification" is [Cory Doctorow's word](https://en.wikipedia.org/wiki/Enshittification). Inflation figures are from the [US Bureau of Labor Statistics](https://www.bls.gov/cpi/) (public domain) and the [Office for National Statistics](https://www.ons.gov.uk/economy/inflationandpriceindices) (Open Government Licence). Snapshots are kept by the [Internet Archive](https://archive.org), which is worth a donation.

##### Contributors

[![contributors badge](https://readme-contribs.as93.net/contributors/NotAFlightRisk/enshittification?shape=squircle)](https://github.com/NotAFlightRisk/enshittification/graphs/contributors)

---

<!-- License + Copyright -->
<p  align="center">
  <a href="https://github.com/NotAFlightRisk"><img width="64" src="https://pixelflare.cc/iain/gif/penguin-dance.gif" /></a><br>
  <sup>
    <i>Code under <a href="../LICENSE">MIT</a>, data under <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>, © <a href="https://peng.ly">NotAFlightRisk</a> 2026</i>
  </sup>
</p>

<!--
oooh, hello there! hope you're having a nice day :)
   |\__      |\___
 (:> __)X  (:o ___(
   |/        |/
-->
