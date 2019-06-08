module.exports = class {
    constructor() {}

    toJson() {
        return {
            type: this.__proto__.constructor.name,
            fields: JSON.parse(JSON.stringify(this))
        }
    }

}