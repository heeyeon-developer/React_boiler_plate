const { User } = require('../models/User')

let auth = (req,res,next) => {
    //인증 처리를 하는곳
    //클라이언트 쿠키에서 토큰을 가져오기
    let token = req.cookies.x_auth;
    //토큰을 복호화 해서 유저 찾기
    User.findByToken(token, (err,user)=>{
        if(err) throw err;
        if(!user) return res.json({ isAuth: false, error: true})
        //index에서 req.token, req.user정보를 사용할 수 있게 넣어주는 것
        req.token = token;
        req.user = user;
        next()  //미들웨어에서 다 한후 이동하게
    })

    //유저가 있으면 인증 ok

    //유저가 없으면 인증 no

}

module.exports = { auth }