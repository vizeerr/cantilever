function includeNavbar() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            document.body.insertAdjacentHTML('afterbegin', this.responseText);
        }
    };
    xhttp.open("GET", "/components/navbar.html", true);
    xhttp.send();
}


function includeFooter() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            document.body.insertAdjacentHTML('beforeend', this.responseText);
        }
    };
    xhttp.open("GET", "/components/footer.html", true);
    xhttp.send();
}
