import auth from 'auth!sofe';

document.getElementById('response')
  .innerText = JSON.stringify(
    auth.getSession()
  );
