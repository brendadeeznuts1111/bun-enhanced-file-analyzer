// /app/greet.ts
function greet(name) {
  return "Hello, " + name + "!";
}

// /app/version.ts
var version = "1.0.0-virtual";
var buildTime = new Date().toISOString();

// ../../../app/index.ts
console.log(greet("World"));
console.log(`App version: ${version}`);
document.body.innerHTML = `
          <div style="padding: 2rem; font-family: system-ui;">
            <h1>${greet("Virtual App")}</h1>
            <p>Version: ${version}</p>
            <button onclick="alert('Hello from virtual build!')">Click me</button>
          </div>
        `;
