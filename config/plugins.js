module.exports = ({ env }) => ({
  upload: {
    config: {
      provider: "@strapi/provider-upload-aws-s3",
      providerOptions: {
        accessKeyId: env("AWS_ACCESS_KEY_ID"),
        secretAccessKey: env("AWS_ACCESS_SECRET"),
        sessionToken: env("AWS_SESSION_TOKEN"),
        region:  env("AWS_REGION", "ap-southeast-1"),
        params: {
          ACL: env("AWS_ACL", "private"),
          signedUrlExpires: env("AWS_SIGNED_URL_EXPIRES", 15 * 60),
          Bucket: env("AWS_BUCKET", "eda-webportal-static-media"),
        },
      },
      actionOptions: {
        upload: {},  
        uploadStream: {},
        delete: {},
      },
    },
  },
});
