type Options = {
	vus?: number;
	duration?: string;
	noConnectionReuse: boolean;
	userAgent: string;
	stages?: Stage[];
	thresholds?: Thresholds;
};

type Thresholds = {
	http_req_duration: string[];
	http_req_failed: string[];
	checks: string[];
};

type Stage = {
	duration: string;
	target: number;
};

const USER_AGENT = "k6-performance-test";

const defaultOptions: Options = {
	vus: Number(__ENV.VIRTUAL_USERS) || 1,
	duration: __ENV.DURATION || "30s",
	noConnectionReuse: true,
	userAgent: USER_AGENT,
};

const thresholds: Thresholds = {
	http_req_duration: ["p(95)<1000"], // 95% of requests should be below 1000ms
	http_req_failed: ["rate<0.10"], // Error rate should be less than 10%
	checks: ["rate>0.95"], // 95% of checks should pass
};

const stages: Record<string, Stage> = {
	smoke: {
		duration: "30s",
		target: 1,
	},
	stress: {
		duration: "60s",
		target: 10,
	},
	loadLow: {
		duration: "30s",
		target: 5,
	},
	loadMed: {
		duration: "60s",
		target: 10,
	},
	loadHigh: {
		duration: "90s",
		target: 15,
	},
};

export function getOptions(stage?: keyof typeof stages): Options {
	const stageConfig = stage ? stages[stage as keyof typeof stages] : undefined;
	if (stageConfig) {
		return {
			thresholds,
			stages: [stageConfig],
			noConnectionReuse: true,
			userAgent: USER_AGENT,
		};
	}
	return {
		...defaultOptions,
		thresholds,
	};
}
