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

const defaultOptions: Options = {
	vus: Number(__ENV.VUS) || 1,
	duration: __ENV.DURATION || "2s",
	noConnectionReuse: true,
	userAgent: "k6-performance-test",
};

const thresholds: Thresholds = {
	http_req_duration: ["p(95)<1000"], // 95% of requests should be below 1000ms
	http_req_failed: ["rate<0.05"], // Error rate should be less than 5%
	checks: ["rate>0.95"], // 95% of checks should pass
};

const stages: Record<string, Stage> = {
	smoke: {
		duration: "1s",
		target: 1,
	},
	stress: {
		duration: "1s",
		target: 10,
	},
	loadLow: {
		duration: "1s",
		target: 5,
	},
	loadMed: {
		duration: "1s",
		target: 10,
	},
	loadHigh: {
		duration: "1s",
		target: 15,
	},
};

export function getOptions(stage: string = "smoke"): Options {
	const stageConfig = stages[stage];
	if (stageConfig) {
		// k6 does not allow duration and stages simultaneously; omit duration and vus when using stages
		const { duration: _d, vus: _v, ...rest } = defaultOptions;
		return {
			...rest,
			thresholds,
			stages: [stageConfig],
		};
	}
	return {
		...defaultOptions,
		thresholds,
	};
}
