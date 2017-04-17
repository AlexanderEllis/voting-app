let addOptionButton = document.getElementById('addOption');
let counter = 5;

addOptionButton.addEventListener('click', function(event) {
  event.preventDefault();

  let div = document.createElement("div");

  div.className = 'form-group';

  div.innerHTML = `<label>Option ${counter}</label>
                   <input type="Text" class="form-control" placeholder="Option ${counter}" name="option${counter}">
                   `
  counter++;

  document.getElementById('newPoll').insertBefore(div, addOptionButton);
})