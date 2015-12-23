import auth from 'auth!sofe';

document.writeln(
  JSON.stringify(
    auth.getSession()
  )
)
