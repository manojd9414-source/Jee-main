function calculateScore(){

let n=parseInt(document.getElementById("qCount").value)

let score=0
let attempted=0
let correct=0
let wrong=0
let unattempted=0

for(let i=0;i<n;i++){

let type=document.getElementById("type"+i).value
let correctAns=document.getElementById("key"+i).value.trim()

let user=""

if(type=="MCQ"){

let r=document.querySelector(`input[name=q${i}]:checked`)
if(r) user=r.value

if(user==""){
unattempted++
continue
}

attempted++

if(user==correctAns){

score+=4
correct++

}else{

score-=1
wrong++

}

}

else{

user=document.getElementById("num"+i).value.trim()

if(user==""){
unattempted++
continue
}

attempted++

if(user==correctAns){

score+=4
correct++

}else{

wrong++

}

}

}

let accuracy = attempted>0 ? ((correct/attempted)*100).toFixed(2) : 0

let timePerQuestion = attempted>0 ? Math.floor((1200-time)/attempted) : 0

let min=Math.floor(timePerQuestion/60)
let sec=timePerQuestion%60

document.getElementById("result").classList.remove("hidden")

document.getElementById("result").innerHTML=`

<h2 style="color:#00d4ff;font-family:Orbitron;">Score : ${score}</h2>

<p>Attempted : ${attempted}</p>

<p style="color:#00ff9d;">Correct : ${correct}</p>

<p style="color:#ff6b35;">Wrong : ${wrong}</p>

<p>Unattempted : ${unattempted}</p>

<hr>

<p>Accuracy : ${accuracy}%</p>

<p>Avg Time / Question : ${min}m ${sec}s</p>

`

}
document.getElementById("type"+i).onchange=function(){

if(this.value=="MCQ"){

document.getElementById("mcq"+i).style.display="block"
document.getElementById("num"+i).style.display="none"

}else{

document.getElementById("mcq"+i).style.display="none"
document.getElementById("num"+i).style.display="inline"

}

}function calculateScore(){

let n=parseInt(document.getElementById("qCount").value)

let score=0
let attempted=0
let correct=0
let wrong=0
let unattempted=0

for(let i=0;i<n;i++){

let type=document.getElementById("type"+i).value
let correctAns=document.getElementById("key"+i).value.trim()

let user=""

if(type=="MCQ"){

let r=document.querySelector(`input[name=q${i}]:checked`)
if(r) user=r.value

if(user==""){
unattempted++
continue
}

attempted++

if(user==correctAns){

score+=4
correct++

}else{

score-=1
wrong++

}

}

else{

user=document.getElementById("num"+i).value.trim()

if(user==""){
unattempted++
continue
}

attempted++

if(user==correctAns){

score+=4
correct++

}else{

wrong++

}

}

}

let accuracy = attempted>0 ? ((correct/attempted)*100).toFixed(2) : 0

document.getElementById("result").innerHTML=`

<h2>Score : ${score}</h2>

<p>Attempted : ${attempted}</p>
<p>Correct : ${correct}</p>
<p>Wrong : ${wrong}</p>
<p>Unattempted : ${unattempted}</p>

<hr>

<p>Accuracy : ${accuracy}%</p>

`

document.getElementById("result").classList.remove("hidden")

}

