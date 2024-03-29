module.exports = (request, options) => {
  if (request.search(/nodemailer/gi) > -1) {
    return `${options.rootDir}/mocks/nodemailer.ts`;
  }
  return options.defaultResolver(request, options);
};
