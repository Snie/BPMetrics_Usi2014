/**
 * Created by nicololinder on 24/11/14.
 */

var hidden = false;

function hideSideBar(){
    if(hidden){
        document.getElementById("sideBar").style.display = "none";
    }
    else{
        document.getElementById("sideBar").style.display = "block";
    }
    hidden = !hidden;
}

document.addEventListener('DOMContentLoaded', function() {
    //document.getElementById("logo").onclick = hideSideBar;
});

$(document).ready(function() {
    $('#logo').click(function() {
        $('#sideBar').animate({
            'marginLeft' : "-=150px" //moves left
        });
    });


});