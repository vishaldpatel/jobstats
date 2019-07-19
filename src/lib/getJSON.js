import LZString from 'lz-string';

let GetJSON = {
  getCompressedJSON(url) {
    return new Promise((resolve, reject) => {
      let request = new XMLHttpRequest();
      request.onreadystatechange = () => {
        if (request.readyState === XMLHttpRequest.DONE) {
          if (request.status === 200) {
            resolve(JSON.parse(LZString.decompressFromUTF16(request.responseText)));
          } else if (typeof reject !== undefined) {
            reject(`${request.status}: ${request.statusText}`);
          }
        }
      }
      request.open("GET", url);
      request.send();
    });
  },
  
  getJSON(url) {
    return new Promise((resolve, reject) => {
      let request = new XMLHttpRequest();
      request.onreadystatechange = () => {
        if (request.readyState === XMLHttpRequest.DONE) {
          if (request.status === 200) {
            resolve();
            // resolve(JSON.parse(request.responseText));
          } else if (typeof reject !== undefined) {
            reject(`${request.status}: ${request.statusText}`);
          }
        }
      }
      request.open("GET", url);
      request.send();
    });
  }
}

// export default getJSON;
export default GetJSON;