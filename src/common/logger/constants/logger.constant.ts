export const LOGGER_NAME = 'system';

export const LOGGER_HTTP_FORMAT =
  "':res[x-request-id]' - ':remote-addr' - ':remote-user' - '[:date[iso]]' - 'HTTP/:http-version' - '[:status]' - ':method' - ':url' - 'Request Header :: :req-headers' - 'Request Params :: :req-params' - 'Response Header :: :res[header]' - ':response-time ms' - ':referrer' - ':user-agent'\n------------------------------------------------------";
export const LOGGER_HTTP_NAME = 'http';

export const SKIP_HTTP_LOGGER_INFORMATION = 'SKIP_HTTP_LOGGER_INFORMATION';
export const SKIP_HTTP_LOGGER = 'SKIP_HTTP_LOGGER';
