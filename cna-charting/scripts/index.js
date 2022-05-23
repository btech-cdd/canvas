function deselectRadios(name) {
    let elements = document.querySelectorAll(`input[name=${name}]`)
    for (let i=0; i<elements.length; i++) {
      elements[i].checked = false;
    }
}
