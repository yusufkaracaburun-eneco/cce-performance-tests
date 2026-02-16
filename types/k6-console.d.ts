/**
 * k6 provides console at runtime; this declaration satisfies TypeScript when lib does not include DOM.
 */
declare const console: {
	log(...args: unknown[]): void;
	info(...args: unknown[]): void;
	error(...args: unknown[]): void;
	warn(...args: unknown[]): void;
	debug(...args: unknown[]): void;
};
