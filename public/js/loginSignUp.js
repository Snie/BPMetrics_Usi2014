/**
 * Created by nicololinder on 21/11/14.
 */

function checkLogin(userName, password){
    if(userName && password){
        return true;
    }
    else{
        missingLoginField();
        return false;
    }
}

function emailValidate(email){
    for(i =0; i < email.length; i++){
        if(email[i] == "@"){
            return true;
        }
    }
    missingSignUpField();
    return false;
}

// HERE ARE THE AJAX REQUESTS //

function logInReq(body){
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/login", true);
    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) return xhr.responseText;

        }
    };
    xhr.send(JSON.stringify(body));
}

function signUpReq(data){
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/signup", true);
    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            if (xhr.status == 200){

            }

        }
    };
    xhr.send(JSON.stringify(data));

}

// HERE ENDS THE AJAX REQUESTS //

function checkSignUp(firstName, lastName, userName, email, password, password2){
    if(firstName && lastName && userName && email && password && password2 && password == password2){
        return true;
    }
    else{
        missingSignUpField();
        return false;
    }
}
function missingLoginField(){
    document.getElementById("loginUserName").style.borderBottomColor= "#FF5722";
    document.getElementById("loginPassword").style.borderBottomColor= "#FF5722";
}

function missingSignUpField(){
      document.getElementById("signUpFirstName").style.borderBottomColor= "#FF5722";
      document.getElementById("signUpLastName").style.borderBottomColor= "#FF5722";
      document.getElementById("signUpUserName").style.borderBottomColor= "#FF5722";
      document.getElementById("signUpEmail").style.borderBottomColor= "#FF5722";
      document.getElementById("signUpPassword").style.borderBottomColor= "#FF5722";
      document.getElementById("signUp2ndPassword").style.borderBottomColor= "#FF5722";
}

function onSubmit(e){
    e.preventDefault();
    if(e.target.getAttribute("id") == "loginSubmit"){

        userName = document.getElementById("loginUserName").value;
        password = document.getElementById("loginPassword").value;

        if(checkLogin(userName, password)) {
            var body = {
                username: userName,
                password: password,
            };
            
            var result = logInReq(body);
            document.innerHTML = result;
        }

    }
    else{
        firstName = document.getElementById("signUpFirstName").value;
        lastName = document.getElementById("signUpLastName").value;
        userName = document.getElementById("signUpUserName").value;
        email = document.getElementById("signUpEmail").value;
        password = document.getElementById("signUpPassword").value;
        password2 = document.getElementById("signUp2ndPassword").value;

        if(checkSignUp(firstName, lastName, userName, email, password, password2) && emailValidate(email)){
            var body = {
                firstname: firstName,
                lastname: lastName,
                username: userName,
                password: password,
                email: email
//                photo: ""
            };
            console.log(body);
            signUpReq(body);
        }
    }
}


document.addEventListener('DOMContentLoaded', function() {
    if( document.getElementById("loginSubmit")) {
         document.getElementById("loginSubmit").onclick = onSubmit;
    }
    else {
         document.getElementById("signUpSubmit").onclick = onSubmit;
    }
});