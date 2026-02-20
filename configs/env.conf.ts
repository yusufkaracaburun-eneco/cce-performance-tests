export type TEnvironmentValues = {
	baseUrl: string;
	testStartTime: string;
};

interface IEnvConfig {
	readonly BASE_URL: string;
}

const environment: Readonly<Record<string, string>> = {
	dev: "dev",
	test: "test",
	acc: "acc",
	prod: "prod",
};

const envConfig: Readonly<Record<string, IEnvConfig>> = {
	[environment.dev]: {
		BASE_URL: "http://host.docker.internal:5197",
	},
	[environment.test]: {
		BASE_URL: "https://test.example.com",
	},
	[environment.acc]: {
		BASE_URL: "https://acc.example.com",
	},
	[environment.prod]: {
		BASE_URL: "https://api.example.com",
	},
};

const config = envConfig[__ENV.ENVIRONMENT] || envConfig[environment.dev];

export function getEnvironmentValues(): TEnvironmentValues {
	return {
		baseUrl: config.BASE_URL,
		testStartTime: new Date().toISOString(),
	};
}
