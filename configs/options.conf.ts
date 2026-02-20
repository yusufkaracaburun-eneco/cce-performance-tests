type TOptions = {
	readonly vus?: number;
	readonly duration?: string;
	readonly noConnectionReuse: boolean;
	readonly userAgent: string;
	stages?: TStage[];
	readonly thresholds?: TThresholds;
};

type TThresholdExpression =
	| string
	| {
			threshold: string;
			abortOnFail?: boolean;
			delayAbortEval?: string;
	  };

type TThresholds = {
	http_req_blocked?: TThresholdExpression[];
	http_req_connecting?: TThresholdExpression[];
	http_req_duration?: TThresholdExpression[];
	http_req_failed?: TThresholdExpression[];
	http_req_receiving?: TThresholdExpression[];
	http_req_sending?: TThresholdExpression[];
	http_req_tls_handshaking?: TThresholdExpression[];
	http_req_waiting?: TThresholdExpression[];
	http_reqs?: TThresholdExpression[];
	iteration_duration?: TThresholdExpression[];
	checks?: TThresholdExpression[];
	http_errors?: TThresholdExpression[];
	request_success_rate?: TThresholdExpression[];
	request_waiting_time?: TThresholdExpression[];
	request_duration_custom?: TThresholdExpression[];
	business_logic_time?: TThresholdExpression[];
	business_success_rate?: TThresholdExpression[];
};

type TStage = {
	readonly duration: string;
	readonly target: number;
};

const USER_AGENT = "k6-performance-test";

const defaultOptions: TOptions = {
	vus: Number(__ENV.VIRTUAL_USERS) || 1,
	duration: __ENV.DURATION || "30s",
	noConnectionReuse: true,
	userAgent: USER_AGENT,
};

/**
 * Default k6 thresholds: pass/fail criteria for built-in metrics.
 * If any expression evaluates to false at the end of the test, the test fails (non-zero exit code).
 * For full interpretation and all available metrics, see docs/METRICS_AND_THRESHOLDS.md.
 *
 * @see https://grafana.com/docs/k6/latest/using-k6/thresholds/
 * @see https://grafana.com/docs/k6/latest/using-k6/metrics/reference/
 */
const thresholds: TThresholds = {
	http_req_blocked: ["p(95)<100"],
	http_req_connecting: ["p(95)<200"],
	http_req_duration: ["p(90)<500", "p(95)<1000", "p(99)<2000", "avg<800"],
	http_req_failed: ["rate<0.01"],
	http_req_receiving: ["p(95)<500"],
	http_req_sending: ["p(95)<200"],
	http_req_tls_handshaking: ["p(95)<500"],
	http_req_waiting: ["p(95)<500", "avg<300"],
	iteration_duration: ["p(95)<2000"],
	checks: ["rate>0.95"],
};

const stages: Record<string, TStage> = {
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

export function getOptions(stage?: keyof typeof stages): TOptions {
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
