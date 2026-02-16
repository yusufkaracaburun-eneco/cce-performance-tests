export type EnvironmentValues = {
	baseUrl: string;
	testStartTime: string;
};

type EnvConfig = {
	BASE_URL: string;
	[key: string]: any;
};

const environment = {
	dev: "dev",
	test: "test",
	acc: "acc",
	prod: "prod",
};

const envConfig: Record<string, EnvConfig> = {
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

export function getEnvironmentValues(): EnvironmentValues {
	return {
		baseUrl: config.BASE_URL,
		testStartTime: new Date().toISOString(),
	};
}
