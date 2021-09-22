const mongodb = require("../utils/mongodb");

const counterSchema = mongodb.Schema({
    name: String,
    seq: Number
});

counterSchema.set('autoIndex', false);

counterSchema.statics.getNextFor = function (name, callback) {
    this.findOneAndUpdate({ name: name }, { $inc: { seq: 1 } }, { new: true, upsert: true }, function (err, doc) {
        if (err) {
            return callback(err);
        }
        callback(null, doc.seq);
    });
}

const Counter = mongodb.model('Counter', counterSchema);

module.exports = function (name, callback) {
    if (!callback) {
        callback = function () { };
    }
    Counter.getNextFor(name, callback);
};