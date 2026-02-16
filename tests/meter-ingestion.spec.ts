import { check } from 'k6';
import { getOptions } from '../configs/options.conf.ts';
import { generateMeterPayload } from '../lib/builders/index.ts';
import { MeterType } from '../lib/builders/base/meter-payload-types.ts';
import { MeterIngestionClient } from '../lib/api/index.ts';
import { ErrorHandler } from '../lib/error-handler.ts';
import { EnvironmentValues, getEnvironmentValues } from '../configs/env.conf.ts';

const errorHandler = new ErrorHandler((err) => console.error(JSON.stringify(err)));

export const options = getOptions();

export function setup(): EnvironmentValues {
  const options = getEnvironmentValues();
  console.info(`>>> Meter ingestion test started: ${options.testStartTime}`);
  return options;
}

export default function (data: ReturnType<typeof setup>) {
  const vuId = __VU;
  const iterId = __ITER;
  console.info(`>>> Meter ingestion test started: ${data.testStartTime}`);
  const client = new MeterIngestionClient(data.baseUrl);

  const payload = generateMeterPayload(vuId, iterId, MeterType.ELECTRICITY);
  const { data: responseData, res } = client.publish(payload);

  const mainChecks = check(res, {
    'status is 200 or 2xx': (r) => r.status >= 200 && r.status < 300,
    'response has body': (r) => {
      if (r.body === null) return false;
      if (typeof r.body === 'string') return r.body.length > 0;
      return true;
    },
    'response time < 1000ms': (r) => r.timings.duration < 1000,
  });

  let jsonCheck = true;
  if (res.status >= 200 && res.status < 300 && responseData != null) {
    jsonCheck = check(responseData, {
      'response is valid JSON': () => typeof responseData === 'object',
    });
  }

  errorHandler.logError(!(mainChecks && jsonCheck), res, { vuId, iterId });
}

export function teardown(data: ReturnType<typeof setup>) {
  const testEndTime = new Date().toISOString();
  console.info(
    `Meter ingestion test completed. Started: ${data.testStartTime}, Ended: ${testEndTime}`
  );
}
