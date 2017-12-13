// import auth from 'auth!sofe';

document.getElementById('response')
  .textContent = JSON.stringify(
    auth.getSession()
  );
