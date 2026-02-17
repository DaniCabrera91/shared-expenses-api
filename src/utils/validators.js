const personNameRegex = /^[\p{L}\s'-]+$/u;
const aliasRegex = /^[a-zA-Z0-9._-]+$/;

const isValidPersonName = (value) => personNameRegex.test(value);
const isValidAlias = (value) => aliasRegex.test(value);

module.exports = {
  isValidPersonName,
  isValidAlias,
};
