import LZString from 'lz-string';

let GetJSON = {
  getCompressedJSON(url) {
    return new Promise((resolve, reject) => {
      let request = new XMLHttpRequest();
      request.onreadystatechange = () => {
        if (request.readyState === XMLHttpRequest.DONE) {
          if (request.status === 200) {
            // Great success!
            console.log("whoa whoa");
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
            // Great success!
            console.log("OKAY!");
            console.log(request.responseText);
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