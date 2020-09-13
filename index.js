const express = require("express");
const app = express();
const port = 5000;//아무 번호나 해도 됨
//body-parser를 이용해서 클라이언으의 req.body정보를 받아올 수 있음
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const config = require('./config/key');
const { auth } = require('./middleware/auth')
const { User } = require('./models/User')  //중복 선언하면 안됨..??


//application/x-www-form-urlencoded를 분석해서 가져오게 해줌
app.use(bodyParser.urlencoded({extended: true}));

//application/json을 분석해서 가져오게 해줌
app.use(bodyParser.json());
app.use(cookieParser());

const mongoose=require("mongoose")
mongoose.connect(config.mongoURI,{
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    }
  ).then(() => console.log("MongoDB Connected..."))
  .catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("Hello World!");
});


app.post('/api/users/register', (req,res) => {
  //회원가입할때 필요한 정보들을 client에서 가져오면
  //그것들을 데이터 베이스에 넣어준다
  const user = new User(req.body);
  //저장하기 전에 비밀번호 암호화 해줘야 함
  user.save((err, userInfo) => {//만약 정보를 저장시 에러가 나면 json형태로 에러를 알려줘야 한다
    if (err) return res.json({ success: false, err });
    return res.status(200).json({
      //200은 성공했다는 의미
      success: true,
    });
  });
})

app.post('/api/users/login',(req,res) => {
  // const user = new User(req.body);
  //요청된 이메일을 데이터베이스에서 있는지 찾는다.
  User.findOne({ email: req.body.email }, (err, user) => {
    if (!user) {
      return res.json({
        loginSuccess: false,
        message: "이메일이 존재하지 않습니다.",
      });
    }
    //요청된 이메일이 데이터베이스에 있다면 비밀번호가 맞는지 확인
    user.comparePassword(req.body.password, (err, isMatch) => {
      if (!isMatch)
        return res.json({
          loginSuccess: false,
          message: "비밀번호가 틀렸습니다.",
        });
      //비밀번호까지 맞다면 토큰을 생성하기
      user.generateToken((err, user) => {
        if (err) return res.status(400).send(err);
        //토큰을 저장한다 어디에? 쿠키 or 로컬스토리지 등등에 저장 가능 - 어디에 저장하는지에 따라 장단점이 다르다
        //쿠키에 저장하기 우선 - 라이브러리 설치해야 함 - cookie-parser
        res.cookie("x_auth", user.token)
        res.status(200) //성공했다는 표시
        res.json({ loginSuccess: true, userId: user._id })
      });
    });
  });
})
//auth라는 미들웨어를 이용함
app.get('/api/users/auth',auth,(req,res) => {
  //여기까지 미들웨어를 통관한것은 auth가 true 했다는 것
  req.status(200).json({
    _id: req.user._id,
    isAdmin: req.user.role === 0? false : true,
    isAuth:true,
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.lastname,
    image: req.user.image
  })
})

app.get('/api/users/logout',auth,(req, res) => {
  User.findOneAndUpdate({_id: req.user._id}, {token: ""}, (err,user)=>{
    if(err) return res.json({ success: false, err})
    return res.status(200).send({
      success:true
    })
  })
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
