// ? Set envs from .env file
require('dotenv').config({
  path: process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env',
});
// ? Convert different types
const convert = {
  string(value) {
    return `${value}`;
  },
  int(value) {
    const isInt = value.match(/^-?\d+$/);
    if (!isInt) {
      throw new Error(`GetEnv.NoInteger: ${value} is not an integer.`);
    }

    return +value;
  },
  float(value) {
    const isInfinity = +value === Infinity || +value === -Infinity;
    if (isInfinity) {
      throw new Error(`GetEnv.Infinity: ${value} is set to +/-Infinity.`);
    }

    const isFloat = !(Number.isNaN(value) || value === '');
    if (!isFloat) {
      throw new Error(`GetEnv.NoFloat: ${value} is not a number.`);
    }

    return +value;
  },
  bool(value) {
    const isBool = value === 'true' || value === 'false';
    if (!isBool) {
      throw new Error(`GetEnv.NoBoolean: ${value} is not a boolean.`);
    }

    return value === 'true';
  },
  boolish(value) {
    try {
      return convert.bool(value);
    } catch (err) {
      const isBool = value === '1' || value === '0';
      if (!isBool) {
        throw new Error(`GetEnv.NoBoolean: ${value} is not a boolean.`);
      }

      return value === '1';
    }
  },
};

// ? export
const GetEnv = (varName, fallback) => {
  return convert.string(GetEnv.getvalue(varName, fallback));
};

GetEnv.getvalue = (varName, fallback) => {
  const value = process.env[varName];
  if (value === undefined) {
    return `${fallback}`;
  }
  return value;
};

Object.keys(convert).forEach(type => {
  GetEnv[type] = (varName, fallback) => {
    return convert[type](GetEnv.getvalue(varName, fallback));
  };
});

module.exports = GetEnv;
