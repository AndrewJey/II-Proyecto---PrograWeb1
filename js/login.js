(function () {
  'use strict';

  var store = window.UTNStore.createStore();

  function showError(message) {
    var box = document.getElementById('login-error');
    if (!box) return;
    box.textContent = message;
    box.hidden = false;
  }

  function clearError() {
    var box = document.getElementById('login-error');
    if (!box) return;
    box.textContent = '';
    box.hidden = true;
  }

  function prepareBinding() {
    var form = document.getElementById('login-form');
    var userInput = document.getElementById('user');
    var passInput = document.getElementById('exampleInputPassword2');
    var toggleBtn = document.getElementById('toggle-pass');

    if (toggleBtn && passInput) {
      toggleBtn.addEventListener('click', function () {
        var showing = passInput.type === 'text';
        passInput.type = showing ? 'password' : 'text';
        toggleBtn.setAttribute('aria-pressed', String(!showing));
        toggleBtn.textContent = showing ? 'Ver' : 'Ocultar';
      });
    }

    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        clearError();
        var result = store.authenticate(userInput ? userInput.value : '', passInput ? passInput.value : '');
        if (result.ok) {
          window.location.href = 'DashDoard.html';
        } else {
          showError(result.error);
          if (userInput && !userInput.value.trim()) {
            userInput.focus();
          } else if (passInput) {
            passInput.focus();
          }
        }
      });
    }
  }

  window.prepareBinding = prepareBinding;
  document.addEventListener('DOMContentLoaded', prepareBinding);
})();
