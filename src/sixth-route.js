{
  let route = {
    register: () => {

    },
    default : () => {

    }
  };


  window.addEventListener('popstate', (event) => {
    console.log('event', event);
  });

  window.addEventListener('hashchange',() => {
    console.log('event', event);

  })

  sixth.route = route;
}