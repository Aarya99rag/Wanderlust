window.addEventListener("DOMContentLoaded", function() {
    window.addEventListener("scroll", reveal);
  
    function reveal() {
      var reveals = document.querySelectorAll(".reveal");
      for (var i = 0; i < reveals.length; i++) {
        var windowheight = window.innerHeight;
        var revealtop = reveals[i].getBoundingClientRect().top;
        var revealpoint = 150;
        if (revealtop < windowheight - revealpoint) {
          reveals[i].classList.add("active");
        } else {
          reveals[i].classList.remove("active");
        }
      }
    }
  });
  

  let taxToggle = document.getElementById("flexSwitchCheckDefault");

  taxToggle.addEventListener("click", () => {
      let taxInfo = document.getElementsByClassName("tax");

      // Loop through each element with the 'tax-info' class
      for (let i = 0; i < taxInfo.length; i++) {
          taxInfo[i].classList.toggle("tax-info");
      }
  });