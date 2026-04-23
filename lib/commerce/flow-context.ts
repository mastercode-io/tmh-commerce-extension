export interface FlowContext {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  referrer?: string;
  landingPath?: string;
}

type BuildPublicFlowContextArgs = {
  searchParams: URLSearchParams;
  headers: Headers;
  pathname: string;
};

function getTrimmedValue(value: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function buildPublicFlowContext({
  searchParams,
  headers,
  pathname,
}: BuildPublicFlowContextArgs): FlowContext {
  const utmSource = getTrimmedValue(searchParams.get('utm_source'));
  const utmMedium = getTrimmedValue(searchParams.get('utm_medium'));
  const utmCampaign = getTrimmedValue(searchParams.get('utm_campaign'));
  const utmTerm = getTrimmedValue(searchParams.get('utm_term'));
  const utmContent = getTrimmedValue(searchParams.get('utm_content'));
  const referrer = getTrimmedValue(
    headers.get('referer') ?? headers.get('referrer'),
  );
  const landingPath = pathname.trim() || undefined;

  return {
    ...(utmSource ? { utmSource } : {}),
    ...(utmMedium ? { utmMedium } : {}),
    ...(utmCampaign ? { utmCampaign } : {}),
    ...(utmTerm ? { utmTerm } : {}),
    ...(utmContent ? { utmContent } : {}),
    ...(referrer ? { referrer } : {}),
    ...(landingPath ? { landingPath } : {}),
  };
}
