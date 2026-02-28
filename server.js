// ===============================
// 1xBet Ultra Pro Max 5.0
// جاهزة للرفع على أي استضافة Node.js
// ===============================

const express = require("express");
const path = require("path");
const app = express();
app.use(express.json());

// مجلد assets للفيديو والأصوات
app.use("/assets", express.static(path.join(__dirname,"assets")));

// ===============================
// بيانات المستخدمين والمباريات
// ===============================
let users = [];
let matches = [
  {id:1, team1:"فريق A", team2:"فريق B", time:"20:00", odds:[1.5,2.5]},
  {id:2, team1:"فريق C", team2:"فريق D", time:"21:00", odds:[1.8,2.0]},
  {id:3, team1:"فريق E", team2:"فريق F", time:"22:00", odds:[1.6,2.2]},
  {id:4, team1:"فريق G", team2:"فريق H", time:"23:00", odds:[1.7,2.1]}
];

// ===============================
// تحديث الاحتمالات كل 5 ثواني
// ===============================
setInterval(()=>{
  matches.forEach(m=>{
    let change = (Math.random()*0.2 - 0.1);
    m.odds[0] = Math.round((m.odds[0]+change)*100)/100;
    m.odds[1] = Math.round((m.odds[1]-change)*100)/100;
  });
},5000);

// ===============================
// الصفحة الرئيسية
// ===============================
app.get("/", (req,res)=>{
  let matchHtml = matches.map(m=>{
    return `<div class="match" id="match-${m.id}">
      <b>${m.team1} vs ${m.team2}</b><br/>
      الوقت: ${m.time}<br/>
      احتمالات: <span id="odds-${m.id}-0">${m.odds[0]}</span> | <span id="odds-${m.id}-1">${m.odds[1]}</span><br/>
      <button class="btn-bet" onclick="bet(${m.id},0)">رهان على ${m.team1}</button>
      <button class="btn-bet" onclick="bet(${m.id},1)">رهان على ${m.team2}</button>
    </div>`;
  }).join("");

  res.send(`
<html>
<head>
<title>1xBet Ultra Pro Max 5.0</title>
<style>
body{margin:0;padding:0;font-family:Arial;color:white;overflow:hidden;}
#bgVideo{position:fixed;top:0;left:0;width:100%;height:100%;object-fit:cover;z-index:-1;}
header{background:rgba(0,0,0,0.6);padding:20px;text-align:center;font-size:28px;color:#66fcf1;text-shadow:2px2px5px #000;}
.container{position:relative;padding:20px;background:rgba(0,0,0,0.7);margin:20px;border-radius:20px;}
input,button{padding:12px;margin:5px;border-radius:8px;border:none;font-size:16px;}
button{cursor:pointer;transition:0.3s;}
button:hover{transform:scale(1.05);}
.btn-register{background:#45a29e;color:white;width:220px;font-weight:bold;}
.btn-bet{background:#c23616;color:white;width:200px;font-weight:bold;margin:5px;}
.btn-live{background:#f39c12;color:white;width:220px;font-weight:bold;}
#balance{font-size:22px;margin:10px;color:#66fcf1;text-shadow:1px1px2px #000;}
.match{margin:10px;padding:10px;border:1px solid #66fcf1;border-radius:10px;background:rgba(0,0,0,0.5);}
.win{background:rgba(0,255,0,0.3);transition:0.5s;}
.lose{background:rgba(255,0,0,0.3);transition:0.5s;}
</style>
</head>
<body>
<video autoplay muted loop id="bgVideo">
  <source src="/assets/bg.mp4" type="video/mp4">
</video>

<header>1xBet Ultra Pro Max 5.0</header>
<div class="container">
<h2>تسجيل مستخدم / تسجيل دخول</h2>
<input type="text" id="username" placeholder="اسم المستخدم"/>
<input type="password" id="password" placeholder="كلمة المرور"/>
<button class="btn-register" onclick="register()">تسجيل / دخول</button>

<h2>الرصيد</h2>
<div id="balance">-</div>

<h2>المباريات</h2>
<div id="matches">${matchHtml}</div>

<button class="btn-live" onclick="liveBet()">Live Betting</button>
</div>

<script>
let currentUser='';

setInterval(()=>{
  fetch('/matches').then(r=>r.json()).then(data=>{
    data.forEach(m=>{
      document.getElementById('odds-'+m.id+'-0').innerText=m.odds[0];
      document.getElementById('odds-'+m.id+'-1').innerText=m.odds[1];
    });
  });
},5000);

function register(){
  const username=document.getElementById('username').value;
  const password=document.getElementById('password').value;
  if(username==''||password==''){alert('املأ جميع الحقول');return;}
  fetch('/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password})})
  .then(r=>r.json()).then(data=>{
    alert(data.message);
    if(data.success){currentUser=username;updateBalance();}
  });
}

function updateBalance(){
  if(currentUser=='') return;
  fetch('/balance?username='+currentUser).then(r=>r.json()).then(data=>{
    document.getElementById('balance').innerText=data.balance;
  });
}

function bet(matchId,team){
  if(currentUser==''){alert('سجل أولًا');return;}
  fetch('/bet',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:currentUser,matchId,team,amount:10})})
  .then(r=>r.json()).then(data=>{
    alert(data.message);
    updateBalance();
    let matchDiv=document.getElementById('match-'+matchId);
    if(data.message.includes('فزت')){
      matchDiv.classList.add('win');
      playSound('win');
      setTimeout(()=>{matchDiv.classList.remove('win');},1500);
    }else{
      matchDiv.classList.add('lose');
      playSound('lose');
      setTimeout(()=>{matchDiv.classList.remove('lose');},1500);
    }
  });
}

function liveBet(){alert('Live Betting جاري العمل عليه! الاحتمالات تتغير كل 5 ثواني 🎮');}

function playSound(type){
  let audio=new Audio(type==='win'?'/assets/win.mp3':'/assets/lose.mp3');
  audio.play().catch(e=>console.log('Audio blocked until user interaction'));
}
</script>
</body>
</html>
  `);
});

// ===============================
// APIs
// ===============================
app.get("/matches",(req,res)=>res.json(matches));

app.post("/login",(req,res)=>{
  const {username,password}=req.body;
  let user=users.find(u=>u.username==username);
  if(!user){users.push({username,password,balance:100,history:[]});return res.json({message:'تم إنشاء الحساب',success:true});}
  if(user.password!==password) return res.json({message:'كلمة المرور خاطئة',success:false});
  res.json({message:'تم تسجيل الدخول',success:true});
});

app.get("/balance",(req,res)=>{
  const username=req.query.username;
  const user=users.find(u=>u.username==username);
  if(!user) return res.json({balance:'غير موجود'});
  res.json({balance:user.balance});
});

app.post("/bet",(req,res)=>{
  const {username,matchId,team,amount}=req.body;
  const user=users.find(u=>u.username==username);
  if(!user) return res.json({message:'المستخدم غير موجود'});
  if(amount>user.balance) return res.json({message:'رصيد غير كاف'});
  user.balance-=amount;
  let match=matches.find(m=>m.id==matchId);
  let odds=match.odds[team];
  let win=Math.random()<0.5;
  if(win){let gain=Math.round(amount*odds*100)/100;user.balance+=gain;user.history.push({matchId,team,result:'فزت',gain});return res.json({message:'فزت! ربحت '+gain});}
  user.history.push({matchId,team,result:'خسرت',gain:0});
  res.json({message:'خسرت 😢'});
});

// ===============================
// تشغيل السيرفر عالميًا باستخدام PORT من البيئة
// ===============================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));