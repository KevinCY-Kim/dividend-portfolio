// DOM 요소가 존재하는지 확인한 후 이벤트 리스너 추가
const registerBtn = document.querySelector(".btn-primary2");
if (registerBtn) {
  registerBtn.addEventListener("click", function (e) {
    var email = document.getElementById('email').value;
    var pw = document.getElementById('password').value;
    var nick = document.getElementById('nickname').value;

    
    if (email == '') {
      alert('이메일을 입력하세요.');
      e.preventDefault();
    } else if (/[A-Z가-힣ㄱ-ㅎ]/.test(email)) {
      alert('이메일은 영소문자와 숫자만 가능합니다.');
      e.preventDefault();
    } else if (/\S+@\S+\.\S+/.test(email) == false) {
      alert('이메일 형식이 아닙니다.');
      e.preventDefault();
    } else {
      if(localStorage.getItem(email)!=null){
        alert(`이미 이메일 ${email}은(는) 존재하는 이메일입니다`)
        e.preventDefault();
      }
    }
    
    if (nick == '') {
      alert('닉네임을 입력하세요.');
      e.preventDefault();
    } 
    
    if (pw == '') {
        alert('비밀번호를 입력하세요.');
        e.preventDefault();
    } else if (/[A-Z가-힣ㄱ-ㅎ]/.test(pw)) {
        alert('비밀번호는 영소문자와 숫자만 가능합니다.');
        e.preventDefault();
    } else {
      localStorage.setItem(email, [pw, nick])
    }

  });
}
