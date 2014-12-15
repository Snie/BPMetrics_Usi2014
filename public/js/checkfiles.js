function checkfiles(origin){
    var fileList = origin.files;
    var valid_ext1 = ["bpmn", "bpmn20"];
    var valid_ext2 = ["xml"];
    for(var x = 0; x <fileList.length; x++){
        var file = fileList[x];
        var fileName = file.name;
        var splitted = fileName.split(".");
        if (splitted.length > 3 || valid_ext1.indexOf(splitted[1]) == -1 ){
            document.getElementById('uploaded').value='';
            alert("Wrong extension");
        }
        else {
            if (splitted.length == 3){
                if (valid_ext2.indexOf(splitted[2]) == -1){
                    document.getElementById('uploaded').value='';
                    alert("Wrong extension");
                }
            }
        }
    }
};
