const mongoose = require('mongoose');

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
        maxlength: 5
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

const User=mongoose.model('User',userSchema)
//여기의 스키마를 다른곳에서도 쓸 수 있게 expert 해주기
module.exports = { User }