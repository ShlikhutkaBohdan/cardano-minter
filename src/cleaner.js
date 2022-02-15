
const { _ } = require('lodash');

function pickDeep(collection, identity) {
    const picked = cleanObject(collection);
    const collections = _.pickBy(collection, _.isObject);

    _.each(collections, function(item, key) {
        let object;
        if (_.isArray(item)) {
            object = _.reduce(item, function(result, value) {
                const picked = pickDeep(value, identity);
                if (!_.isEmpty(picked)) {
                    result.push(picked);
                }
                return result;
            }, []);
        } else {
            object = pickDeep(item, identity);
        }

        if (!_.isEmpty(object)) {
            picked[key] = object;
        }

    });

    return picked;
}

function deepCleanObject(collection) {
    return pickDeep(collection, _.identity)
}

function filterNonBlank(value) {
    if (_.isNil(value) || _.isUndefined(value)) {
        return false;
    }
    if (value === 0) {
        return true;
    }
    return _.identity(value)
}

function cleanObject(obj) {
    return _.pickBy(obj, filterNonBlank)
}

module.exports={ deepCleanObject, cleanObject }
