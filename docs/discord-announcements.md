# Discord announcements

Repository maintainers can post a Repertoire /64 update through the manual **Post Discord announcement** GitHub Actions workflow. The Discord webhook remains a GitHub Actions secret and must never be committed, pasted into an issue, added to a workflow input, or shared in Discord.

## One-time setup

1. In the Discord server, create a webhook for the announcements channel.
2. In the GitHub repository, open **Settings → Secrets and variables → Actions**.
3. Create a repository secret named `DISCORD_WEBHOOK_URL`.
4. Paste the complete webhook URL into the secret value. The integration accepts only an exact URL in this form:

   ```text
   https://discord.com/api/webhooks/WEBHOOK_ID/WEBHOOK_TOKEN
   ```

The workflow rejects HTTP URLs, alternate Discord hosts, query strings, fragments, credentials, custom ports, and unexpected webhook paths. The webhook is never passed through a command-line argument or printed to the workflow log.

## Post an update

1. Open **Actions → Post Discord announcement → Run workflow**.
2. Enter a title and message.
3. Optionally add up to five links, one per line. Use either an HTTPS URL by itself or a label followed by a vertical bar and the URL:

   ```text
   Release notes | https://example.com/releases/1.4.0
   Chrome Web Store | https://chromewebstore.google.com/detail/example
   ```

4. Run the workflow and confirm the **Validate and post to Discord** step succeeds.

All links—including links written inside the title or message—must use HTTPS and cannot contain embedded credentials or custom ports. Very long combinations of text and links are rejected before posting so they stay inside Discord's embed limits. Discord mentions are disabled, so text such as `@everyone` cannot ping members.

## Test locally without posting

Run the validation tests; they use a mocked network request and never contact Discord:

```bash
node --test tests/discord-announcement.test.mjs
```

Do not test the real webhook from a personal shell history. Use the manual workflow after the GitHub secret is configured.

## If the webhook is exposed

Delete or rotate it immediately in Discord, replace the GitHub secret, and review recent messages and workflow runs. Removing a leaked value from the latest commit is not enough because it may remain in Git history, logs, caches, or forks.
