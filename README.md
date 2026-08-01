# Repertoire /64 for GitHub Pages

Upload the contents of this folder to the root of a GitHub repository, or to a `docs` folder. In **Settings → Pages**, choose **Deploy from a branch** and select the matching branch and folder.

GitHub Pages uses `index.html` as the entry file. All paths in this edition are relative, so it works at both `username.github.io` and `username.github.io/repository-name/`.

After the Chrome Web Store listing is published, paste its URL into `site-config.js`. The site will then replace the pending state with working **Add to Chrome** links.

This static edition includes:

- All 300 free opening courses: 150 for White and 150 for Black.
- The interactive move trainer.
- An official Lichess analysis link for every course's exact legal line, plus an optional reputable-channel video search.
- Device-local course progress.
- Direct read-only Chess.com PubAPI rating lookup.
- The extension privacy policy.

Optional ChatGPT account sync is available only on the hosted Repertoire /64 application because GitHub Pages cannot run the required server and database.

Every course and advanced explanation is free. The hosted edition additionally supports optional account-based progress sync and deeper completed-game analysis.

## Community

- [Official Discord support and bug reports](https://discord.gg/RRT3jMGvCg)
- [Apply to join the moderator or support team](https://docs.google.com/forms/d/e/1FAIpQLSdIKH8JLNTk0vL2k8OIpFuJzBn8XvbKlanTcReGq10v-xXERg/viewform?usp=publish-editor)

Never send passwords, login codes, Discord tokens, API keys, wallet seed phrases, or payment information through either channel.

## Maintainer safeguards

- Every push and pull request runs the static-site, Discord, secret, CSP, link, JavaScript, and extension-archive checks in GitHub Actions.
- Discord updates are sent only through the manual **Post Discord announcement** workflow after the repository secret `DISCORD_WEBHOOK_URL` is configured.
- Never commit or paste a webhook URL. Follow [the secure setup guide](./docs/discord-announcements.md).
