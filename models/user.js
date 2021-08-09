const mongodb = require("../utils/mongodb");

const userSchema = mongodb.Schema({
  uid: Number,
  name: { type: String, index: true, unique: true },
  password: String,
  logintime: Date,
  regtime: { type: Date, default: Date.now },
});

userSchema.statics.generateUid = function (callback) {
  this.find()
    .sort("-uid")
    .limit(1)
    .exec(function (err, doc) {
      if (err) return callback(err);
      callback(null, doc.length ? doc[0].uid + 1 : 1);
    });
};

userSchema.statics.createUser = function (name, password, callback) {
  this.generateUid(function (err, uid) {
    if (err) return callback(err);
    const doc = new User({ name: name, password: password, uid: uid });
    doc.save(function (err) {
      if (err) return callback(err);
      callback(null, doc.uid);
    });
  });
};

userSchema.statics.userLogin = function (name, password, callback) {
  this.findOne({ name: name }, function (err, doc) {
    if (err) return callback(err);
    if (!doc || doc.password !== password) return callback(null, false);
    doc.logintime = new Date();
    doc.save(function (err) {
      if (err) return callback(err);
      callback(null, true, doc.uid);
    });
  });
};

const User = mongodb.model("User", userSchema);

module.exports = User;
