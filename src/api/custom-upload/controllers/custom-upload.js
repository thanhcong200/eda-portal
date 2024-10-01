const { createResponse } = require("../../../common/util");
module.exports = {
    async customFileUpload(ctx) {
      const { files } = ctx.request;
  
      if (!files) {
        return ctx.badRequest('No files uploaded');
      }

      try {
        const forms = Array.isArray(files.files) ? files.files : [files.files];
        const uploadedFiles = await strapi.plugins['upload'].services.upload.upload({
          data: {}, // Optional: Any additional metadata you want to pass
          files: forms,
        });
  
        ctx.send(createResponse(uploadedFiles));
      } catch (err) {
        ctx.badRequest('Upload failed', { error: err.message });
      }
    },
  };
  