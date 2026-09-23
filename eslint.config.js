import config from '@wearerequired/eslint-config';

export default [
	...config,
	{
		ignores: [ 'dist/' ],
	},
];
