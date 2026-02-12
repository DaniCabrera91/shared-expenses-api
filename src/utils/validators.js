const nameRegex = /^[\p{L}\s'-]+$/u;

const isValidName = (name) => nameRegex.test(name);

module.exports = {
  nameRegex,
  isValidName,
};
