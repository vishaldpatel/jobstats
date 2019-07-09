function getJSON(url) {
  return new Promise((resolve, reject) => {
    let request = new XMLHttpRequest();
    request.onreadystatechange = () => {
      if (request.readyState === XMLHttpRequest.DONE) {
        if (request.status === 200) {
          // Great success!
          resolve(JSON.parse(request.responseText));
        } else if (typeof reject !== undefined) {
          reject(`${request.status}: ${request.statusText}`);
        }
      }
    }
    request.open("GET", url);
    request.send();
  });
}

export default getJSON;