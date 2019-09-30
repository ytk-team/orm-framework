module.exports = {
    get: (value) => {
        if (value === null) {
            return "null";
        }
        else if (value === undefined) {
            return "undefined";
        }
        else if (value.__proto__ === Number.prototype) {
            return Number.isInteger(value) ? "integer" : "number";
        }
        else if (value.__proto__ === Boolean.prototype) {
            return "boolean";
        }
        else if (value.__proto__ === String.prototype) {
            return "string";
        }
        else if (Array.isArray(value)) {
            return "array";
        }
        else {
            return "object";
        }
    }
};