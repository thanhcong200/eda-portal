module.exports = ({ env }) => ({
  upload: {
    config: {
      provider: "@strapi/provider-upload-aws-s3",
      providerOptions: {
        accessKeyId: env("AWS_ACCESS_KEY_ID"),
        secretAccessKey: env("AWS_ACCESS_SECRET"),
        region: "ap-southeast-1",
        params: {
          ACL: env("AWS_ACL", "public-read"),
          signedUrlExpires: env("AWS_SIGNED_URL_EXPIRES", 15 * 60),
          Bucket: env("AWS_BUCKET"),
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
