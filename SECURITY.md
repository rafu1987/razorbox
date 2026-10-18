# Security policy

## Supported versions

razorbox is in pre-release. Security fixes go into the latest published
version only.

| Version | Supported |
| ------- | --------- |
| latest `0.7.x` | Yes |
| older | No |

## Reporting a vulnerability

Please do not open a public issue for security problems.

Report it privately through GitHub instead:
[Report a vulnerability](https://github.com/rafu1987/razorbox/security/advisories/new)
(repository **Security** tab → **Report a vulnerability**).

Include the razorbox version, browser, a minimal reproduction and the impact
you expect. You can expect a first reply within 7 days. Once a fix is
released, the advisory is published and you are credited unless you prefer
otherwise.

## Scope

razorbox renders user-supplied URLs and markup, so these are in scope:

- Script execution through item URLs, captions or data attributes
  (for example `javascript:` or `data:` URLs reaching an iframe or link)
- Bypassing URL validation for iframes, maps, PDFs or video providers
- Bypassing `videoPrivacy` (privacy-enhanced YouTube domain, Vimeo `dnt=1`)

Out of scope, because they are documented as trusted input:

- Markup passed as `{ type: 'html', html: '...' }` to `open()`
- Captions rendered with `captionHtml: true`
- Content inside third-party iframes you choose to embed
