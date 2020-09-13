const express = require("express");
const app = express();
const port = 5000;//아무 번호나 해도 됨
//body-parser를 이용해서 클라이언으의 req.body정보를 받아올 수 있음
const bodyParser = require('body-parser')

const config = require('./config/key');

const { User } = require("./models/User")


//application/x-www-form-urlencoded를 분석해서 가져오게 해줌
app.use(bodyParser.urlencoded({extended: true}));
//application/json을 분석해서 가져오게 해줌
app.use(bodyParser.json());

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

app.post('/register', (req,res) => {
  //회원가입할때 필요한 정보들을 client에서 가져오면
  //그것들을 데이터 베이스에 넣어준다

  const user = new User(req.body);

  //만약 정보를 저장시 에러가 나면 json형태로 에러를 알려줘야 한다
  //200은 성공했다는 의미
  user.save((err, userInfo) => {
    if (err) return res.json({ success: false, err })
    return res.status(200).json({
      success: true
    });
  });
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
