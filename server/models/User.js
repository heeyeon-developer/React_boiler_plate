const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
//salt rounds 는 salt가 몇글자인지 나타내는 것
const saltRounds = 10;
const jwt = require('jsonwebtoken');

//스키마란 이름, 제목, 이메일 등등 모델 안에 들어있는 정보들의 구조를 짜는것
const userSchema = mongoose.Schema({
    name: {
        type: String,
        maxlength: 50
    },
    email: {
        type: String,
        trim: true,
        unique: 1//유니크한 이메일을 적을 수 있게 설정
    },
    password: {
        type: String,
        maxlength: 100
    },
    lastname: {
        type: String,
        maxlength: 50
    },
    role: {
        type: Number,
        default: 0
    },
    image: String,
    token: {
        type: String
    },
    tokenExp: {
        type: Number
    }
})
//유저의 정보를 저장하기 전에 ~~한 행동을 한다, 함수를 줘서
userSchema.pre('save', function(next){
  var user = this;
  //비밀번호를 바꿀때만 암호화를 해줘야 하기 때문에 조건을 걸어줘야 함
  //비밀번호를 암호화 시킨다
    if(user.isModified('password')) {
        //salt를 이용해서 비밀번호를 암호화 해야 함 - 먼저 salt를 만들어야 함
        bcrypt.genSalt(saltRounds, function (err, salt) {
        if (err) return next(err)
            //제대로 salt를 만들었다면 아래로 myPlaintextPassword = 내가 입력한 비밀번호
            //bcrypt.hash(myPlaintextPassword, salt, function(err, hash)
            bcrypt.hash(user.password, salt, function (err, hash) {
                if (err) return next(err)
                user.password = hash; //hash된 비밀번호로 바꿔주는 것
                next()
                // Store hash in your password DB.
            });
        });
    }else{//비밀번호를 바꾸지 않았을때는 그냥 나가기 해줘야 나감, 그렇지 않으면 계속 머물게 됨
        next()
    }
})

userSchema.methods.comparePassword = function(plainPassword, cb) {
  //plainPassword     암호화된 비밀번호     같은지 체크해야 함
  //plainpassword를 암호화 해서 디비의 비밀번호랑 비교
  bcrypt.compare(plainPassword, this.password, function(err, isMatch){
      if(err) return cb(err)
      cb(null, isMatch)
  })
};

userSchema.methods.generateToken = function (cb) {
    var user = this;
    //jsonwebtoken을 이용해서 token을 생성
    //토큰 생성시 plain object를 기대했는데 아니게 되서 오류 발생 - toHexString()을 사용
    var token = jwt.sign(user._id.toHexString(), 'secretToken');
    //user._id + 'secretToken' = token
    //-> 'secretToken'을 입력하면 user._id가 나와야 함
    user.token = token;
    user.save(function (err, user) {
        if (err) return cb(err)
        cb(null, user);
    });
}
userSchema.statics.findByToken = function(token, cb) {
    var user = this;
    //토큰을 decode 한다.
    jwt.verify(token,'secretToken',function(err, decoded){
        //유저 아이디를 이용해서 유저를 찾은 다음
        //클라이언트에서 가져온 토큰과 db에 보관된 토큰이 일치하는지 확인
        user.findOne({'_id':decoded, "token": token},function(err, user){
            if(err) return cb(err)
            cb(null,user)
        })
    })
}
const User=mongoose.model('User',userSchema)
//여기의 스키마를 다른곳에서도 쓸 수 있게 expert 해주기
module.exports = { User }