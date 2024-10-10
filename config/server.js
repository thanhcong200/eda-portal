module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  url: env('BACKEND_URL', ''),
  app: {
    keys: env.array('APP_KEYS'),
  },
  webhooks: {
    populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
  },
  http: {
    serverOptions: {
      requestTimeout: 30*60*1000,
      headersTimeout: 30*60*1000,
      timeout: 30*60*1000,
    }
  },
});
