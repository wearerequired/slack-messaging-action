const core = require( '@actions/core' );
const { WebClient } = require( '@slack/web-api' );

( async () => {
	try {
		const botToken = core.getInput( 'bot_token' );
		const channel = core.getInput( 'channel' );
		const messageId = core.getInput( 'message_id' );
		const payload = core.getInput( 'payload' );
		const slack = new WebClient( botToken );

		if ( ! channel && ! core.getInput( 'channel_id' ) ) {
			core.setFailed( `You must provide either a 'channel' or a 'channel_id'.` );
			return;
		}

		const channelId =
			core.getInput( 'channel_id' ) || ( await lookUpChannelId( { slack, channel } ) );

		if ( ! channelId ) {
			core.setFailed( `Slack channel ${ channel } could not be found.` );
			return;
		}

		const apiMethod = Boolean( messageId ) ? 'update' : 'postMessage';

		const args = JSON.parse( payload );
		args.channel = channelId;

		if ( messageId ) {
			args.ts = messageId;
		}

		// Send the message.
		const response = await slack.chat[ apiMethod ]( args );

		core.setOutput( 'message_id', response.ts );
	} catch ( error ) {
		core.setFailed( error );
	}
} )();

async function lookUpChannelId( { slack, channel } ) {
	let result;
	const formattedChannel = channel.replace( /[#@]/g, '' );

	// Async iteration is similar to a simple for loop.
	// Use only the first two parameters to get an async iterator.
	for await ( const page of slack.paginate( 'conversations.list', {
		types: 'public_channel, private_channel',
	} ) ) {
		// You can inspect each page, find your result, and stop the loop with a `break` statement
		const match = page.channels.find( ( c ) => c.name === formattedChannel );
		if ( match ) {
			result = match.id;
			break;
		}
	}

	return result;
}
