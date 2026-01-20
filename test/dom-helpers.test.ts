import { describe, it, expect } from "bun:test";
import { JSDOM } from "jsdom";

// Mock DOM environment
const dom = new JSDOM(`
  <div id="parent">
    <div class="child">Child 1</div>
    <div class="child">Child 2</div>
    <button>Button 1</button>
    <button>Button 2</button>
    <span>Span 1</span>
    <input type="text" />
  </div>
`);

global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement;

// Import after setting up DOM
import { 
  getElementsByTagName, 
  getFirstElementByTagName, 
  countElementsByTagName,
  getInputs,
  getButtons 
} from "../src/utils/dom-helpers";

describe("parent.getElementsByTagName", () => {
  const parent = document.getElementById("parent") as HTMLElement;

  it("should get all elements by tag name", () => {
    const divs = getElementsByTagName(parent, "div");
    expect(divs.length).toBe(2);
    
    const buttons = getElementsByTagName(parent, "button");
    expect(buttons.length).toBe(2);
    
    const spans = getElementsByTagName(parent, "span");
    expect(spans.length).toBe(1);
  });

  it("should get first element by tag name", () => {
    const firstDiv = getFirstElementByTagName(parent, "div");
    expect(firstDiv).toBeTruthy();
    expect(firstDiv?.textContent).toBe("Child 1");
    
    const firstButton = getFirstElementByTagName(parent, "button");
    expect(firstButton).toBeTruthy();
    expect(firstButton?.textContent).toBe("Button 1");
  });

  it("should count elements by tag name", () => {
    expect(countElementsByTagName(parent, "div")).toBe(2);
    expect(countElementsByTagName(parent, "button")).toBe(2);
    expect(countElementsByTagName(parent, "span")).toBe(1);
    expect(countElementsByTagName(parent, "input")).toBe(1);
    expect(countElementsByTagName(parent, "nonexistent")).toBe(0);
  });

  it("should get input elements", () => {
    const inputs = getInputs(parent);
    expect(inputs.length).toBe(1);
    expect(inputs[0].type).toBe("text");
  });

  it("should get button elements", () => {
    const buttons = getButtons(parent);
    expect(buttons.length).toBe(2);
    expect(buttons[0].textContent).toBe("Button 1");
    expect(buttons[1].textContent).toBe("Button 2");
  });

  it("should handle empty results", () => {
    const empty = getElementsByTagName(parent, "nonexistent");
    expect(empty.length).toBe(0);
    
    const firstNonexistent = getFirstElementByTagName(parent, "nonexistent");
    expect(firstNonexistent).toBeNull();
  });
});

describe("HTMLCollection behavior", () => {
  const parent = document.getElementById("parent") as HTMLElement;

  it("should return live HTMLCollection", () => {
    const divs = getElementsByTagName(parent, "div");
    const initialCount = divs.length;
    
    // Add a new div
    const newDiv = document.createElement("div");
    newDiv.textContent = "New Child";
    parent.appendChild(newDiv);
    
    // HTMLCollection should be live and reflect the change
    expect(divs.length).toBe(initialCount + 1);
    
    // Clean up
    parent.removeChild(newDiv);
  });

  it("should support array conversion", () => {
    const divs = getElementsByTagName(parent, "div");
    const divArray = Array.from(divs);
    
    expect(Array.isArray(divArray)).toBe(true);
    expect(divArray.length).toBe(2);
    expect(divArray[0].textContent).toBe("Child 1");
    expect(divArray[1].textContent).toBe("Child 2");
  });
});
