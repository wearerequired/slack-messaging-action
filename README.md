# Slack Messaging Action

A GitHub Action for sending (and updating) messages of any format from GitHub Actions to Slack. Inspired by [Slack Notify Build](https://github.com/marketplace/actions/slack-notify-build).

A [Slack bot token](https://api.slack.com/docs/token-types) is required to use this action, and the associated app must be granted permission to post in the channel, private group or DM you specify.

## Usage

```yaml
uses: wearerequired/slack-messaging-action@v1
with:
  bot_token: ${{ secrets.SLACK_BOT_TOKEN }}
  channel: deployments
  payload: '{"icon_emoji":":rocket:","username":"Deployer","text":"Hello world"}'
```

In `payload` you can provide your own [composed message in JSON](https://api.slack.com/messaging/composing) which will be sent to Slack. Make sure you use a quoted JSON string payload as the example above. Also, escaped characters like line-breaks needs to be escaped twice (`\n` becomes `\\n`).

### Updating an existing message

If you need to send multiple Slack build updates and you prefer to update a single message instead of posting multiple messages, you can pass a `message_id` to future steps.

Note: You must assign a step `id` to the first Slack notification step in order to reference it for future steps:

```yaml
- name: Notify Slack about deployment start
  if: success()
  id: slack # IMPORTANT: Reference this step ID value in future Slack steps.
  uses: wearerequired/slack-messaging-action@v1
  with:
    bot_token: ${{ secrets.SLACK_BOT_TOKEN }}
    channel: deployments
    payload: '{"icon_emoji":":rocket:","username":"Deployer","text":"Deployment in process..."}'

- name: Deployment

- name: Notify Slack about deployment success
  if: success() # You can use the conditional checks to determine which build notification to send.
  uses: voxmedia/github-action-slack-notify-build@v1
  with:
    bot_token: ${{ secrets.SLACK_BOT_TOKEN }}
    message_id: ${{ steps.slack.outputs.message_id }} # Updates existing message from the first step.
    channel: deployments
    payload: '{"icon_emoji":":rocket:","username":"Deployer","text":"Deployment was successful."}'

- name: Notify Slack about deployment fail
  if: failure() # You can use the conditional checks to determine which build notification to send.
  uses: voxmedia/github-action-slack-notify-build@v1
  with:
    bot_token: ${{ secrets.SLACK_BOT_TOKEN }}
    message_id: ${{ steps.slack.outputs.message_id }} # Updates existing message from the first step.
    channel: deployments
    payload: '{"icon_emoji":":rocket:","username":"Deployer","text":"Deployment has failed."}'
```

## Inputs

### `bot_token`

A [bot token](https://api.slack.com/docs/token-types) associated with a Slack app. **Required**

_Note_: The following bot token scopes are required: `chat:write`, `chat:write.customize`, `chat:write.public`, `channels:read`, and `groups:read`.

### `channel`

The name of the channel to post the message to. **Required** if no `channel_id` is provided.

_Note_: If your workspace has many channels, supplying only a `channel` may cause rate limiting issues with this GitHub Action. Consider supplying a `channel_id` instead.

### `channel_id`

The ID of the channel to post the message to. **Required** if no `channel` is provided, or if you need to send to a DM.

### `payload`

The [JSON payload of a message](https://api.slack.com/messaging/composing) to send. **Required**  

_Note_: `channel` and `ts` are set to the values of the respective inputs.

### `message_id`

The ID of a previous Slack message to update instead of posting a new message. Typically passed using the `steps` context:

```yaml
message_id: ${{ steps.<your_first_slack_step_id>.outputs.message_id }}
```

## Outputs

### `message_id`

Returns the unique message ID, which is a timestamp which can be passed to future Slack API calls as `ts`.

## License

The scripts and documentation in this project are released under the [MIT license](LICENSE).
