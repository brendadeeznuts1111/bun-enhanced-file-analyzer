// /demo/text.ts
var message = "Hello from text!";

// /demo/buffer.ts
var arrayBufferMessage = "Hello from ArrayBuffer!";
var timestamp = 1768941192129;

// /demo/blob.ts
var blobMessage = "Hello from Blob!";

// ../../../demo/index.ts
console.log(message);
console.log(arrayBufferMessage);
console.log(blobMessage);
console.log("Timestamp:", timestamp);
document.body.innerHTML = `
          <div style="padding: 2rem; font-family: system-ui;">
            <h1>Content Types Demo</h1>
            <p>Text: ${message}</p>
            <p>Buffer: ${arrayBufferMessage}</p>
            <p>Blob: ${blobMessage}</p>
            <p>Timestamp: ${new Date(timestamp).toLocaleString()}</p>
          </div>
        `;
