

// DOM 요소가 존재하는지 확인한 후 이벤트 리스너 추가
const loginBtn = document.querySelector(".btn-primary");
if (loginBtn) {
  loginBtn.addEventListener("click", function (e) {
    var email = document.getElementById('email').value;
    var pw = document.getElementById('password').value;
    var e_start = false;
    var pw_start = false;
    if (email == '') {
      alert('이메일을 입력하세요.');
      e.preventDefault();
    } else if (/[A-Z가-힣ㄱ-ㅎ]/.test(email)) {
      alert('이메일은 영소문자와 숫자만 가능합니다.');
      e.preventDefault();
    } else if (/\S+@\S+\.\S+/.test(email) == false) {
      alert('이메일 형식이 아닙니다.');
      e.preventDefault();
    } else if(localStorage.getItem(email)==null){
      alert('존재하지 않는 이메일입니다.');
      e.preventDefault();

    }
    
    if (pw == '') {
        alert('비밀번호를 입력하세요.');
        e.preventDefault();
    } else if (/[A-Z가-힣ㄱ-ㅎ]/.test(pw)) {
        alert('비밀번호는 영소문자와 숫자만 가능합니다.');
        e.preventDefault();
    } else {
      if(localStorage.getItem(email).split(',')[0] != pw){
        alert('비밀번호가 일치하지 않습니다.');
        e.preventDefault();
      }
    }
    localStorage.setItem("login", "true")
    
  });
}

