## About

Discord interaction for [cloudflare workers](https://developers.cloudflare.com/workers/) to query GitHub pull requests, issues, and commits and display them in your Discord server.

## Secrets

- `GITHUB_TOKEN` GitHub access token to make queries with
- `DISCORD_CLIENT_SECRET` [Discord Application](https://discord.com/developers/applications) public key

Use [`wrangler secret SECRET_NAME`](https://developers.cloudflare.com/workers/cli-wrangler/commands#secret) to modify secrets for your worker.

## Configuration (wrangler.toml)

- `DEFAULT_REPO_OWNER` Repository owner name to default to, if none is provided.
- `DEFAULT_REPO` Repository name to default to, if none is provided.

Note: Make sure to also update this in the `model.json` field descriptions.

## Contributing

If you wish to contribute, feel free to fork the repository and submit a pull request. I use [ESLint](https://eslint.org/) to enforce a consistent code style.

```
git clone https://github.com/almostSouji/github-interaction-worker.git
npm install
```

Remember to always lint your work before making a commit to ensure everything is lined up and consistent with the rest of the codebase.

## Testing changes

Please test the application locally or on your own CF worker before submitting a PR.

```
yarn lint:fix
yarn build
npx wrangler deploy ./src/index.ts
```

## Deploying commands

If you are changing the command model, you will need to [register the command(s)](https://discord.com/developers/docs/interactions/application-commands#registering-a-command) with an external tool (curl, postman, insomnia, thunder, etc.)

## Author

**github-interaction-worker** © [almostSouji](https://github.com/almostSouji).  
Authored and maintained by almostSouji.

> GitHub [@almostSouji](https://github.com/almostSouji)
