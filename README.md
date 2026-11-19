# Askew's weekly flyer – website embed

Powers the flyer section of https://www.askewsfoods.com/flyer.

- `embed.js` – shows the current flyer(s): a PDF button plus the 12 pages with a full-size viewer.
- `flyers.json` – updated automatically each week by the flyer robot. Each flyer shows from the
  Friday 5:00 AM before it starts until the end of its Saturday.

Squarespace Code Block (added once):

```html
<div id="askews-flyer"></div>
<script src="https://askewsfoods.github.io/flyer/embed.js" defer></script>
```
