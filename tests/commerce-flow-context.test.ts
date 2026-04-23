import test from 'node:test';
import assert from 'node:assert/strict';

import { buildPublicFlowContext } from '../lib/commerce/flow-context.ts';

test('buildPublicFlowContext reads utm parameters and referrer', () => {
  const searchParams = new URLSearchParams({
    utm_source: 'google',
    utm_medium: 'cpc',
    utm_campaign: 'renewals',
  });
  const headers = new Headers({
    referer: 'https://www.google.com/search?q=tmh',
  });

  assert.deepEqual(
    buildPublicFlowContext({
      searchParams,
      headers,
      pathname: '/renewal',
    }),
    {
      utmSource: 'google',
      utmMedium: 'cpc',
      utmCampaign: 'renewals',
      referrer: 'https://www.google.com/search?q=tmh',
      landingPath: '/renewal',
    },
  );
});
