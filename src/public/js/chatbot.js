(function(){
  const root = document.getElementById("chat-widget");
  if (!root) return;
  root.innerHTML = `
    <div class="chatbox" style="border:1px solid #ddd;padding:8px;border-radius:8px;max-width:480px">
      <div id="chatlog" style="height:200px; overflow:auto; border:1px solid #eee; padding:8px; margin-bottom:8px"></div>
      <input id="chatmsg" placeholder="무엇을 도와드릴까요?" style="width:75%"/>
      <button id="chatsend">Send</button>
    </div>`;
  const log = root.querySelector("#chatlog");
  const input = root.querySelector("#chatmsg");
  root.querySelector("#chatsend").onclick = async ()=>{
    const msg = input.value.trim(); if(!msg) return;
    log.innerHTML += `<div><b>나:</b> ${msg}</div>`;
    input.value="";
    try{
      const r = await fetch("/api/chat",{ method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ message: msg }) });
      const j = await r.json();
      log.innerHTML += `<div><b>봇:</b> ${j.reply || '(no response)'}</div>`;
      log.scrollTop = log.scrollHeight;
    }catch(e){
      log.innerHTML += `<div style="color:red">에러: ${e.message}</div>`;
    }
  };
})();
