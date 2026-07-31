import { Chess } from "./vendor/chess.js";

const PIECES={wp:"♙",wn:"♘",wb:"♗",wr:"♖",wq:"♕",wk:"♔",bp:"♟",bn:"♞",bb:"♝",br:"♜",bq:"♛",bk:"♚"};
const FILES=["a","b","c","d","e","f","g","h"];
const STORAGE_KEY="repertoire64-github-pages-progress";
let courses=[];
let activeSide="All";
let course=null;
let ply=0;
let selected=null;
let progress=readProgress();

const $=(selector)=>document.querySelector(selector);
const $$=(selector)=>[...document.querySelectorAll(selector)];

function readProgress(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||"{}")}catch{return{}}}
function saveProgress(nextPly,correct=false,attempt=false){
  const old=progress[course.id]||{step:0,correct:0,attempts:0,mastery:0};
  const correctCount=old.correct+(correct?1:0);
  const attempts=old.attempts+(attempt?1:0);
  progress[course.id]={step:Math.max(old.step,nextPly),correct:correctCount,attempts,mastery:Math.min(100,Math.round(nextPly/course.mainline.length*70)+(attempts?Math.round(correctCount/attempts*30):0))};
  localStorage.setItem(STORAGE_KEY,JSON.stringify(progress));
  renderCatalog();
}
function cleanSan(value){return value.replace(/[+#?!]/g,"")}
function gameAt(targetPly){const game=new Chess();for(const step of course.mainline.slice(0,targetPly))game.move(step.san);return game}

function configureStoreLinks(){
  const url=window.REPERTOIRE_CONFIG?.chromeWebStoreUrl?.trim()||"";
  $$(".js-store-link").forEach(link=>{
    if(url){link.href=url;link.classList.remove("disabled")}
    else{link.removeAttribute("href");link.classList.add("disabled");link.setAttribute("aria-disabled","true")}
  });
  if(url)$("#store-note").textContent="Install the reviewed Chrome Web Store version in one click.";
}

async function loadCourses(){
  const response=await fetch("./data/openings.json");
  if(!response.ok)throw new Error("Opening library could not load.");
  courses=await response.json();
  chooseCourse("italian-game",false);
  renderCatalog();
}

function renderCatalog(){
  const query=$("#search").value.trim().toLowerCase();
  const visible=courses.filter(item=>(activeSide==="All"||item.side===activeSide)&&(!query||`${item.name} ${item.idea} ${item.responseTo}`.toLowerCase().includes(query)));
  $("#course-grid").innerHTML=visible.map(item=>{
    const mastery=progress[item.id]?.mastery||0;
    return `<button class="course-card ${course?.id===item.id?"active":""}" data-course="${item.id}"><span class="side ${item.side.toLowerCase()}">${item.side}${item.side==="Black"?` vs ${item.responseTo}`:""}</span><h3>${item.name}</h3><p>${item.idea}</p><div class="bar"><i style="width:${mastery}%"></i></div><small>${mastery}% mastered · ${item.complexity}</small></button>`;
  }).join("");
  $$(".course-card").forEach(button=>button.addEventListener("click",()=>{chooseCourse(button.dataset.course,true);location.hash="trainer"}));
}

function chooseCourse(id,restore=true){
  course=courses.find(item=>item.id===id)||courses[0];
  ply=restore?Math.min(progress[id]?.step||0,course.mainline.length):0;
  selected=null;
  $("#course-name").textContent=course.name;
  $("#course-idea").textContent=course.idea;
  $("#course-why").textContent=course.whyLearn;
  $("#course-structure").textContent=course.structure;
  $("#course-plan").textContent=course.plan;
  $("#video-link").href=course.video.url;
  $("#video-link").textContent=`${course.video.source} video lesson ↗`;
  renderTrainer(ply?"Welcome back. Continue from your saved step.":"Start at the normal initial position. Select the piece, then its destination.");
  renderCatalog();
}

function renderBoard(){
  const game=gameAt(ply);
  const position=game.board();
  const ranks=course.side==="White"?[0,1,2,3,4,5,6,7]:[7,6,5,4,3,2,1,0];
  const files=course.side==="White"?[0,1,2,3,4,5,6,7]:[7,6,5,4,3,2,1,0];
  $("#board").innerHTML=ranks.flatMap(row=>files.map(column=>{
    const square=`${FILES[column]}${8-row}`;
    const piece=position[row][column];
    return `<button class="square ${(row+column)%2?"dark":"light"} ${selected===square?"selected":""}" data-square="${square}" aria-label="${square}">${piece?PIECES[`${piece.color}${piece.type}`]:""}</button>`;
  })).join("");
  $$(".square").forEach(button=>button.addEventListener("click",()=>playSquare(button.dataset.square)));
}

function playSquare(square){
  const step=course.mainline[ply];
  if(!step){renderTrainer("Main line complete. Test the opponent alternatives below.");return}
  if(step.role==="opponent"){renderTrainer("Use the opponent-response button first.");return}
  const game=gameAt(ply);
  const expected=game.moves({verbose:true}).find(move=>cleanSan(move.san)===cleanSan(step.san));
  if(!selected){
    const piece=game.get(square);
    if(!piece||piece.color!==(course.side==="White"?"w":"b")){renderTrainer("Select one of your own pieces first.");return}
    selected=square;renderTrainer(`Selected ${square}. Now choose its destination.`);return
  }
  const correct=selected===expected?.from&&square===expected?.to;
  selected=null;
  saveProgress(correct?ply+1:ply,correct,true);
  if(correct){ply+=1;renderTrainer(`Correct. ${step.explanation}`)}
  else renderTrainer(`Not quite. The course move is ${step.san}. Ask what it changes in the center, then try again.`);
}

function renderTrainer(message){
  renderBoard();
  const step=course.mainline[ply];
  $("#progress-label").textContent=`${ply} / ${course.mainline.length} half-moves`;
  $("#progress-bar").style.width=`${Math.round(ply/course.mainline.length*100)}%`;
  $("#lesson-copy").textContent=message;
  $("#turn-label").textContent=step?`${step.role==="player"?"YOUR MOVE":"OPPONENT RESPONSE"} · MOVE ${Math.floor(step.ply/2)+1}`:"MAIN LINE COMPLETE";
  $("#lesson-title").textContent=!step?"Main line complete.":step.role==="player"?"Find the right move on the board.":`The opponent chooses ${step.san}.`;
  $("#opponent-move").hidden=!step||step.role!=="opponent";
  if(step?.role==="opponent")$("#opponent-move").textContent=`Play ${step.san} and explain why →`;
  $("#hint").innerHTML=step?.role==="player"?`Hint: the move is <strong>${step.san}</strong>.`:"";
  $("#move-list").innerHTML=course.mainline.map(item=>`<button data-ply="${item.ply}" class="${item.ply<ply?"done":item.ply===ply?"current":""}">${item.ply%2===0?`${Math.floor(item.ply/2)+1}.`:"…"} ${item.san}</button>`).join("");
  $$("#move-list button").forEach(button=>button.addEventListener("click",()=>{ply=Number(button.dataset.ply);selected=null;renderTrainer(ply?course.mainline[ply-1].explanation:"The normal initial position.");}));
  $("#branch-grid").innerHTML=course.branches.map(branch=>`<article><small>IF THEY PLAY</small><h4>${branch.opponentMove}</h4><button data-branch="${branch.id}">Find the reply</button><p data-answer="${branch.id}" hidden><strong>Answer ${branch.answer}.</strong> ${branch.explanation}</p></article>`).join("");
  $$("#branch-grid button").forEach(button=>button.addEventListener("click",()=>{button.hidden=true;document.querySelector(`[data-answer="${button.dataset.branch}"]`).hidden=false}));
}

$("#opponent-move").addEventListener("click",()=>{const step=course.mainline[ply];if(step?.role==="opponent"){ply+=1;saveProgress(ply);selected=null;renderTrainer(step.explanation)}});
$("#back").addEventListener("click",()=>{ply=Math.max(0,ply-1);selected=null;renderTrainer("Step back and compare what changed.")});
$("#restart").addEventListener("click",()=>{ply=0;selected=null;renderTrainer("Restarted from the normal initial position.")});
$("#search").addEventListener("input",renderCatalog);
$("#filters").addEventListener("click",event=>{const button=event.target.closest("button");if(!button)return;activeSide=button.dataset.side;$$(".filters button").forEach(item=>item.classList.toggle("active",item===button));renderCatalog()});

$("#player-form").addEventListener("submit",async event=>{
  event.preventDefault();
  const username=$("#username").value.trim();
  if(!/^[a-z0-9_-]{2,25}$/i.test(username)){ $("#player-status").textContent="Enter a valid Chess.com username.";return }
  $("#player-status").textContent="Reading public Chess.com ratings…";
  $("#player-report").hidden=true;
  try{
    const [profileResponse,statsResponse]=await Promise.all([
      fetch(`https://api.chess.com/pub/player/${encodeURIComponent(username)}`),
      fetch(`https://api.chess.com/pub/player/${encodeURIComponent(username)}/stats`)
    ]);
    if(!profileResponse.ok||!statsResponse.ok)throw new Error("That public Chess.com account was not found.");
    const [profile,stats]=await Promise.all([profileResponse.json(),statsResponse.json()]);
    const ratings=[["Rapid",stats.chess_rapid?.last?.rating],["Blitz",stats.chess_blitz?.last?.rating],["Bullet",stats.chess_bullet?.last?.rating],["Daily",stats.chess_daily?.last?.rating]].filter(([,rating])=>rating);
    const primary=ratings.find(([name])=>name==="Rapid")?.[1]||ratings[0]?.[1]||"—";
    $("#player-report").innerHTML=`<div><small>PLAYER</small><strong>${profile.username||username}</strong></div><div><small>PRIMARY ELO</small><strong>${primary}</strong></div>${ratings.slice(0,3).map(([name,rating])=>`<div><small>${name.toUpperCase()}</small><strong>${rating}</strong></div>`).join("")}`;
    $("#player-report").hidden=false;
    $("#player-status").textContent="Public rating data loaded.";
  }catch(error){$("#player-status").textContent=error.message||"Chess.com is temporarily unavailable."}
});

configureStoreLinks();
loadCourses().catch(error=>{$("#course-grid").innerHTML=`<p>${error.message}</p>`});
