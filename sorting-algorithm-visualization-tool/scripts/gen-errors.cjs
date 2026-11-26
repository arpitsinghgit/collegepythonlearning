const {execFileSync,spawnSync}=require("child_process");
const fs=require("fs");
const TXT={colon:":",rbr:"]",rpar:")",rcur:"}",dq:'"',eqeq:"==",comma:",",str:"str",name:"name",in:"in",i4:"    ",eq:"=",nam:"nam"};
const P={
 paren:{lines:[['name = "Asha"'],['print("Hello", name',{g:"a"}]],gaps:{a:{ans:"rpar"}}},
 comma:{lines:[["nums = [1, 2",{g:"a"}," 3]"],["print(nums)"]],gaps:{a:{ans:"comma"}}},
 dict:{lines:[['ages = {"Asha": 12, "Ben": 14',{g:"a"}],["print(ages)"]],gaps:{a:{ans:"rcur"}}},
 equals:{lines:[["age = 18"],["if age ",{g:"a"}," 18:"],['    print("Adult")']],gaps:{a:{ans:"eqeq",pre:"eq"}}},
 loopin:{lines:[["for i ",{g:"a"}," range(3):"],["    print(i)"]],gaps:{a:{ans:"in"}}},
 name:{lines:[['name = "Asha"'],["print(",{g:"a"},")"]],gaps:{a:{ans:"name",pre:"nam"}}},
 defcolon:{lines:[["def greet(name)",{g:"a"}],['    print("Hi " + name)'],['greet("Asha")']],gaps:{a:{ans:"colon"}}},
 typeerror:{lines:[["age = 18"],['print("Age: " + ',{g:"a"},"(age))"]],gaps:{a:{ans:"str"}}},
 boss2:{lines:[["def greet(age)",{g:"a"}],[{g:"b"},'print("Age: " + ',{g:"c"},"(age)",{g:"d"}],["greet(18)"]],
  gaps:{a:{ans:"colon"},b:{ans:"i4"},c:{ans:"str"},d:{ans:"rpar"}}}
};
TXT.rbr="]";
const out={};
for(const [id,p] of Object.entries(P)){
  const keys=Object.keys(p.gaps);out[id]={};
  for(let mask=0;mask<(1<<keys.length);mask++){
    const missing=keys.filter((k,i)=>mask>>i&1);
    const src=p.lines.map(l=>l.map(x=>{
      if(typeof x==="string")return x;
      const g=p.gaps[x.g];
      if(missing.includes(x.g))return g.pre?TXT[g.pre]:"";
      return TXT[g.ans];
    }).join("")).join("\n")+"\n";
    fs.writeFileSync("/tmp/gen/main.py",src);
    const r=spawnSync("python3",["main.py"],{cwd:"/tmp/gen",encoding:"utf8"});
    const key=missing.sort().join("");
    if(r.status===0){out[id][key]={ok:true,out:r.stdout.split("\n").filter((x,i,a)=>!(i===a.length-1&&x===""))};}
    else{
      let L=r.stderr.replace(/\s+$/,"").split("\n").map(x=>x.replace(/\s+$/,""));
      if(!/^Traceback/.test(L[0]))L=L.map((x,i)=>i===0?x.replace(/^  /,""):x);
      const fl=[...r.stderr.matchAll(/File "[^"]*", line (\d+)/g)].pop();
      out[id][key]={line:+fl[1],con:L,msg:L[L.length-1]};
      if(/^Traceback/.test(L[0]))out[id][key].tb=[...r.stderr.matchAll(/File "[^"]*", line (\d+)/g)].map(m=>+m[1]);
    }
  }
}
fs.writeFileSync("scripts/err-new.json",JSON.stringify(out));
console.log(JSON.stringify(out,null,1));
