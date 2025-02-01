(() => {
    'use strict'
  
    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    const forms = document.querySelectorAll('.needs-validation')
  
    // Loop over them and prevent submission
    Array.from(forms).forEach(form => {
      form.addEventListener('submit', event => {
        if (!form.checkValidity()) {
          event.preventDefault()
          event.stopPropagation()
        }
  
        form.classList.add('was-validated')
      }, false)
    })
  })();

let taxInfo = document.getElementsByClassName("tax-info");
let taxSwitch = document.getElementById("tax-switch");
let taxSwitchLabel = document.getElementById("tax-switch-label");
const toggleTaxDisplay = ()=>{
  for(tax of taxInfo){
    if(tax.style.display === 'none'){
      tax.style.display = 'block';
    }else{
      tax.style.display = 'none'
    }
  }
};

taxSwitchLabel.addEventListener("click", ()=> {
  toggleTaxDisplay()
});

taxSwitch.addEventListener("click", ()=> {
  toggleTaxDisplay()
});